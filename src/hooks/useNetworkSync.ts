import { useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { flushQueue, getQueueCount } from '../services/offlineQueue';

/**
 * Mount this hook once at the app root (AppNavigator).
 * It listens for the device coming back online and automatically
 * flushes any queued incidents to the server.
 */
export function useNetworkSync() {
  // Track whether a flush is already running so we don't double-submit
  const isSyncing = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(
      async (state: NetInfoState) => {
        const isConnected =
          state.isConnected && state.isInternetReachable !== false;
        if (!isConnected || isSyncing.current) {
          return;
        }

        const count = await getQueueCount();
        if (count === 0) {
          return;
        }

        isSyncing.current = true;
        try {
          await flushQueue();
        } finally {
          isSyncing.current = false;
        }
      },
    );

    return () => unsubscribe();
  }, []);
}
