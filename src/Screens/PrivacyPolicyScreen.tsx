import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../Navigation/AppNavigator';

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PrivacyPolicy'
>;

interface Props {
  navigation: PrivacyPolicyScreenNavigationProp;
}

const PrivacyPolicyScreen: React.FC<Props> = ({navigation}) => {
  const requestAllPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const permissions: any[] = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        if (Platform.Version >= 33) {
          permissions.push('android.permission.POST_NOTIFICATIONS' as any);
        }

        await PermissionsAndroid.requestMultiple(permissions);
      } catch (err) {
        console.warn(err);
      }
    }

    try {
      await AsyncStorage.setItem('privacyPolicyAccepted', 'true');
    } catch (err) {
      console.warn(err);
    }
    
    navigation.navigate('MainDrawer');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wildlife Watch</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.mainTitle}>Privacy Policy</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal data</Text>
          <Text style={styles.sectionText}>
            We collect your mobile numbers, photos, and location data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purpose</Text>
          <Text style={styles.sectionText}>
            Your personal data is used to report and track wildlife incidents.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Retention</Text>
          <Text style={styles.sectionText}>
            Your data will be retained for the duration necessary to fulfill the
            reporting purpose.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={requestAllPermissions}>
          <Text style={styles.buttonText}>I agree</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE', // Light off-white color
  },
  header: {
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#41583C',
  },
  content: {
    padding: 30,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#41583C',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 18,
    color: '#333333',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  button: {
    backgroundColor: '#41583C',
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PrivacyPolicyScreen;
