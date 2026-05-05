import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useFocusEffect } from '@react-navigation/native';
import { DrawerParamList } from '../Navigation/AppNavigator';
import Geolocation from 'react-native-geolocation-service';
import DatePicker from 'react-native-date-picker';
import { pick, types } from '@react-native-documents/picker';
import Svg, { Path } from 'react-native-svg';
import NetInfo from '@react-native-community/netinfo';
import { enqueueIncident } from '../services/offlineQueue';

type IncidentFormScreenProps = {
  navigation: DrawerNavigationProp<DrawerParamList, 'IncidentForm'>;
};

const IncidentFormScreen = ({ navigation }: IncidentFormScreenProps) => {
  const [reporterName, setReporterName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [comments, setComments] = useState('');
  const [incidentDetails, setIncidentDetails] = useState('');
  const [dateTime, setDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isInLocation, setIsInLocation] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [dateTimeDisplay, setDateTimeDisplay] = useState('');
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch(
        'http://ec2-13-234-204-250.ap-south-1.compute.amazonaws.com:8080/api/categories/',
      );
      if (response.ok) {
        const data = await response.json();
        setCategoriesList(data);
      } else {
        console.error('Failed to fetch categories. Status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setReporterName('');
    setContactNumber('');
    setLocation('');
    setCategory('');
    setSubcategory('');
    setAssignedTo('');
    setComments('');
    setIncidentDetails('');
    const now = new Date();
    setDateTime(now);
    const formatted = now.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    setDateTimeDisplay(formatted);
    setUploadedFiles([]);
    setIsInLocation(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Form resets every time the screen is focused (e.g., when clicking "Report incident" from dashboard)
      resetForm();
    }, [resetForm]),
  );

  useEffect(() => {
    const now = new Date();
    setDateTime(now);
    updateDateTimeDisplay(now);
  }, []);

  const updateDateTimeDisplay = (date: Date) => {
    const formatted = date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    setDateTimeDisplay(formatted);
  };

  const fetchLocation = async () => {
    setLoadingLocation(true);
    try {
      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude}, ${longitude}`);
          setLoadingLocation(false);
        },
        error => {
          Alert.alert('Location Error', error.message);
          setLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    } catch {
      Alert.alert('Error', 'Failed to fetch location');
      setLoadingLocation(false);
    }
  };

  const handleDateChange = (date: Date) => {
    setDateTime(date);
    updateDateTimeDisplay(date);
  };

  const pickFiles = async (mediaType: 'image' | 'audio') => {
    try {
      let type: any[] = [];
      if (mediaType === 'image') {
        type = [types.images];
      } else if (mediaType === 'audio') {
        type = [types.audio];
      }

      const pickedFiles = await pick({
        type,
        allowMultiSelection: mediaType === 'image', // Allow multiple photos
      });

      if (pickedFiles && pickedFiles.length > 0) {
        if (mediaType === 'image') {
          // Append new images
          const newFiles = pickedFiles.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
            uri: file.uri,
            mediaType,
          }));
          setUploadedFiles(prev => [...prev, ...newFiles]);
        } else {
          // Replace audio file
          const file = pickedFiles[0];
          const newFile = {
            name: file.name,
            size: file.size,
            type: file.type,
            uri: file.uri,
            mediaType,
          };
          const filteredFiles = uploadedFiles.filter(
            f => f.mediaType !== mediaType,
          );
          setUploadedFiles([...filteredFiles, newFile]);
        }
      }
    } catch (err: any) {
      if (err.code !== 'CANCELLED') {
        Alert.alert('Error', `Failed to pick ${mediaType} from device`);
      }
    }
  };

  const deleteFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const getFileIcon = (file: any) => {
    const fileName = file.name || '';
    const type = file.type || '';
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (
      type.includes('image') ||
      ['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')
    ) {
      return '🖼️';
    } else if (
      type.includes('audio') ||
      ['mp3', 'wav', 'aac', 'm4a'].includes(extension || '')
    ) {
      return '🎵';
    }
    return '📄';
  };

  const handleSubmit = async () => {
    if (!reporterName || !location || !category || !incidentDetails) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    setSubmitting(true);

    const incidentData = {
      category: category,
      subcategory: subcategory || '',
      location: isInLocation ? '' : location,
      description: incidentDetails,
      reporterName: reporterName,
      assignedTo: assignedTo || '',
      dueDate: dateTime.toISOString().split('T')[0],
      coordinates: isInLocation ? location : '',
      contactNumber: contactNumber || '',
      comment: comments || '',
    };

    const queuedFiles = uploadedFiles.map(file => ({
      uri: file.uri,
      type: file.type || 'application/octet-stream',
      name: file.name || 'file',
      mediaType: file.mediaType as 'image' | 'audio',
    }));

    // Check network connectivity before attempting the request
    const netState = await NetInfo.fetch();
    const isConnected =
      netState.isConnected && netState.isInternetReachable !== false;

    if (!isConnected) {
      // Save to offline queue and navigate to the Error screen
      await enqueueIncident(incidentData, queuedFiles);
      setSubmitting(false);
      resetForm();
      navigation.navigate('Error');
      return;
    }

    const formData = new FormData();
    formData.append('incident', {
      string: JSON.stringify(incidentData),
      type: 'application/json',
    } as any);

    uploadedFiles.forEach((file, index) => {
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

    try {
      const response = await fetch(
        'http://ec2-13-234-204-250.ap-south-1.compute.amazonaws.com:8080/api/incidents/',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (response.ok) {
        resetForm();
        navigation.navigate('Success');
      } else {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        Alert.alert('Error', `Server responded with an error: ${errorText}`);
      }
    } catch (error) {
      // Network dropped mid-request — queue and show offline screen
      console.error('Submission error:', error);
      await enqueueIncident(incidentData, queuedFiles);
      resetForm();
      navigation.navigate('Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}
        >
          <Svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 12h18M3 6h18M3 18h18"
              stroke="#333"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wildlife Watch</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.mainTitle}>Report incident</Text>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Reporter name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Reporter name"
                value={reporterName}
                onChangeText={setReporterName}
              />
              {reporterName ? (
                <TouchableOpacity onPress={() => setReporterName('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact number (optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                value={contactNumber}
                onChangeText={text =>
                  setContactNumber(text.replace(/[^0-9]/g, ''))
                }
                keyboardType="phone-pad"
                maxLength={10}
              />
              {contactNumber ? (
                <TouchableOpacity onPress={() => setContactNumber('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Date and time(auto-detected){' '}
              <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={[styles.input, styles.dateTimeInput]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateTimeText}>{dateTimeDisplay}</Text>
              </TouchableOpacity>
              {dateTimeDisplay ? (
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <DatePicker
            modal
            open={showDatePicker}
            date={dateTime}
            onConfirm={date => {
              handleDateChange(date);
              setShowDatePicker(false);
            }}
            onCancel={() => setShowDatePicker(false)}
            title="Select date and time"
            confirmText="Confirm"
            cancelText="Cancel"
          />

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => {
                const nextValue = !isInLocation;
                setIsInLocation(nextValue);
                if (nextValue) {
                  fetchLocation();
                } else {
                  setLocation('');
                }
              }}
            >
              <View
                style={[
                  styles.checkbox,
                  isInLocation && styles.checkboxChecked,
                ]}
              >
                {isInLocation && (
                  <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M20 6L9 17L4 12"
                      stroke="#FFFFFF"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </View>
              <Text style={styles.checkboxLabel}>Are you in the location?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              {isInLocation && (
                <TouchableOpacity
                  onPress={fetchLocation}
                  disabled={loadingLocation}
                  style={styles.locationIconButton}
                >
                  {loadingLocation ? (
                    <ActivityIndicator color="#3F5B3B" size="small" />
                  ) : (
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                        fill="#3F5B3B"
                      />
                    </Svg>
                  )}
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={
                  isInLocation
                    ? 'Detecting location...'
                    : '(Village/Town, Block, Address, landmarks. )'
                }
                value={location}
                onChangeText={setLocation}
                multiline
                editable={!isInLocation}
              />
              {location && !loadingLocation && !isInLocation ? (
                <TouchableOpacity onPress={() => setLocation('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Category <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={[styles.pickerText, !category && { color: '#999' }]}>
                {category || 'Select category'}
              </Text>
              <Svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                <Path
                  d="M1 1L8 8L15 1"
                  stroke="#999"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <Modal visible={showCategoryModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select Category</Text>
                {categoriesLoading ? (
                  <ActivityIndicator
                    size="large"
                    color="#41583C"
                    style={{ padding: 20 }}
                  />
                ) : (
                  categoriesList.map((cat, index) => {
                    const categoryName =
                      cat.categerie ||
                      cat.category ||
                      cat.name ||
                      `Category ${cat.id || index}`;
                    return (
                      <TouchableOpacity
                        key={cat.id || index}
                        style={styles.categoryOption}
                        onPress={() => {
                          setCategory(categoryName);
                          setShowCategoryModal(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.categoryText,
                            category === categoryName &&
                              styles.selectedCategory,
                          ]}
                        >
                          {categoryName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowCategoryModal(false)}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subcategory (optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter subcategory if any"
                value={subcategory}
                onChangeText={setSubcategory}
              />
              {subcategory ? (
                <TouchableOpacity onPress={() => setSubcategory('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Assigned to (optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Name of assigned person"
                value={assignedTo}
                onChangeText={setAssignedTo}
              />
              {assignedTo ? (
                <TouchableOpacity onPress={() => setAssignedTo('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Incident details <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe the incident"
                value={incidentDetails}
                onChangeText={setIncidentDetails}
                multiline
              />
              {incidentDetails ? (
                <TouchableOpacity onPress={() => setIncidentDetails('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Comments (optional)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Any additional comments"
                value={comments}
                onChangeText={setComments}
                multiline
              />
              {comments ? (
                <TouchableOpacity onPress={() => setComments('')}>
                  <Text style={styles.clearButton}>✕</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <View style={styles.uploadSection}>
            <Text style={styles.uploadTitle}>Uploaded files</Text>

            {uploadedFiles.length > 0 && (
              <View style={styles.filesList}>
                {uploadedFiles.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <Text style={styles.fileIcon}>{getFileIcon(file)}</Text>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <TouchableOpacity onPress={() => deleteFile(index)}>
                      <Svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <Path
                          d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"
                          fill="#FF6B6B"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.uploadButtonsRow}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => pickFiles('image')}
              >
                <Text style={styles.mediaButtonText}>📸 Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => pickFiles('audio')}
              >
                <Text style={styles.mediaButtonText}>🎵 Audio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          activeOpacity={0.8}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitText}>Submit report</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F6FF',
  },
  menuButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#41583C',
  },
  content: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#41583C',
    marginBottom: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 5,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  locationIconButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
  },
  required: {
    color: '#FF0000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: '#333333',
    paddingVertical: 8,
  },
  dateTimeInput: {
    flex: 1,
    justifyContent: 'center',
  },
  dateTimeText: {
    fontSize: 17,
    color: '#333333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  clearButton: {
    fontSize: 18,
    color: '#CCCCCC',
    marginLeft: 10,
    padding: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#41583C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#41583C',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FAFAFA',
  },
  pickerText: {
    fontSize: 17,
    color: '#333333',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#41583C',
    marginBottom: 15,
    textAlign: 'center',
  },
  categoryOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryText: {
    fontSize: 16,
    color: '#333333',
  },
  selectedCategory: {
    color: '#41583C',
    fontWeight: '700',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#41583C',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadSection: {
    marginTop: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#41583C',
    marginBottom: 15,
  },
  filesList: {
    marginBottom: 15,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 10,
  },
  fileIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  uploadButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  mediaButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mediaButtonText: {
    fontSize: 14,
    color: '#41583C',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 20,
    backgroundColor: '#F8F9FE',
  },
  submitButton: {
    backgroundColor: '#41583C',
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default IncidentFormScreen;
