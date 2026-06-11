import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offline_incident_queue';
const API_URL =
  'https://healwildtagapp.cloud/api/incidents/';

export interface QueuedFile {
  uri: string;
  type: string;
  name: string;
  mediaType: 'image' | 'audio';
}

export interface QueuedIncident {
  id: string;
  timestamp: number;
  incidentData: {
    category: string;
    subcategory: string;
    location: string;
    description: string;
    reporterName: string;
    assignedTo: string;
    dueDate: string;
    coordinates: string;
    contactNumber: string;
    comment: string;
  };
  files: QueuedFile[];
}

/** Read the entire queue from AsyncStorage */
export async function getQueue(): Promise<QueuedIncident[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Persist the queue back to AsyncStorage */
async function saveQueue(queue: QueuedIncident[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Add a new incident to the offline queue */
export async function enqueueIncident(
  incidentData: QueuedIncident['incidentData'],
  files: QueuedFile[],
): Promise<void> {
  const queue = await getQueue();
  const entry: QueuedIncident = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    incidentData,
    files,
  };
  queue.push(entry);
  await saveQueue(queue);
}

/** Remove a single item from the queue by id */
async function dequeueById(id: string): Promise<void> {
  const queue = await getQueue();
  await saveQueue(queue.filter(item => item.id !== id));
}

/** Build a FormData payload from a queued incident */
function buildFormData(item: QueuedIncident): FormData {
  const formData = new FormData();
  formData.append('incident', {
    string: JSON.stringify(item.incidentData),
    type: 'application/json',
  } as any);
  item.files.forEach((file, index) => {
    const fileType =
      file.mediaType === 'audio'
        ? 'audio/mpeg'
        : file.type || 'application/octet-stream';
    formData.append('attachments', {
      uri: file.uri,
      type: fileType,
      name: file.name || `file_${index}`,
      mediaType: file.mediaType,
    } as any);
  });
  return formData;
}

/**
 * Attempt to flush every queued incident to the server.
 * Successfully submitted items are removed; failed ones remain for the next attempt.
 * Returns the number of incidents successfully synced.
 */
export async function flushQueue(): Promise<number> {
  const queue = await getQueue();
  if (queue.length === 0) {
    return 0;
  }

  let synced = 0;
  for (const item of queue) {
    try {
      const formData = buildFormData(item);
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.ok) {
        await dequeueById(item.id);
        synced++;
      }
      // If the server returns a non-OK status we leave it in the queue to retry later
    } catch {
      // Network still unavailable or request failed — leave in queue
    }
  }
  return synced;
}

/** How many incidents are currently waiting to be synced */
export async function getQueueCount(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}
