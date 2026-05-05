import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DrawerParamList} from '../Navigation/AppNavigator';

type MyDataScreenProps = {
  navigation: DrawerNavigationProp<DrawerParamList, 'MyData'>;
};

const MyDataScreen = ({navigation}: MyDataScreenProps) => {
  const [loading, setLoading] = useState(false);

  const handleRequestData = async () => {
    setLoading(true);
    try {
      // Assuming a standard endpoint for data request
      const response = await fetch('http://10.0.2.2:8080/api/v1/users/request-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert(
          'Request Data',
          'Your request for data export has been received. We will process it shortly.',
        );
      } else {
        throw new Error('Server returned an error');
      }
    } catch (error) {
      console.error('Request data error:', error);
      Alert.alert(
        'Error',
        'Could not complete your request. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete Data',
      'Are you sure you want to request data deletion? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Request Deletion',
          style: 'destructive',
          onPress: performDeleteRequest,
        },
      ],
    );
  };

  const performDeleteRequest = async () => {
    setLoading(true);
    try {
      // Assuming a standard endpoint for data deletion
      const response = await fetch('http://10.0.2.2:8080/api/v1/users/data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        Alert.alert(
          'Data Deletion',
          'Your deletion request has been submitted successfully.',
        );
      } else {
        throw new Error('Server returned an error');
      }
    } catch (error) {
      console.error('Delete data error:', error);
      Alert.alert(
        'Error',
        'Could not complete your request. Please try again later.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke="#333"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wildlife Watch</Text>
        <View style={{width: 40}} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>My data</Text>
        <Text style={styles.description}>
          You can request an export of your personal data or ask for it to be deleted.
        </Text>
      </View>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color="#3F5B3B" style={{marginBottom: 20}} />
        ) : (
          <>
            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestData}
              disabled={loading}>
              <Text style={styles.requestButtonText}>Request data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteData}
              disabled={loading}>
              <Text style={styles.deleteButtonText}>Delete data</Text>
            </TouchableOpacity>
          </>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F5B3B',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3F5B3B',
    marginBottom: 25,
  },
  description: {
    fontSize: 18,
    color: '#333',
    lineHeight: 26,
    textAlign: 'center',
    fontWeight: '400',
  },
  footer: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  requestButton: {
    backgroundColor: '#3F5B3B',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  deleteButtonText: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default MyDataScreen;
