import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DrawerParamList} from '../Navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PERMISSIONS_KEY = '@user_permissions';

type PermissionsScreenProps = {
  navigation: DrawerNavigationProp<DrawerParamList, 'Permissions'>;
};

const PermissionsScreen = ({navigation}: PermissionsScreenProps) => {
  const [notifications, setNotifications] = useState(false);
  const [camera, setCamera] = useState(false);
  const [location, setLocation] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const savePermissions = async (key: string, value: boolean) => {
    try {
      const existing = await AsyncStorage.getItem(PERMISSIONS_KEY);
      const parsed = existing ? JSON.parse(existing) : {};
      parsed[key] = value;
      await AsyncStorage.setItem(PERMISSIONS_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.warn('Failed to save permission preference', e);
    }
  };

  const loadPermissions = async () => {
    try {
      const stored = await AsyncStorage.getItem(PERMISSIONS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('Failed to load permission preferences', e);
      return {};
    }
  };

  const checkPermissions = useCallback(async () => {
    const savedPrefs = await loadPermissions();
    
    if (Platform.OS === 'android') {
      const cameraGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      const locationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      
      let notificationGranted = true;
      if (Platform.Version >= 33) {
        notificationGranted = await PermissionsAndroid.check(
          'android.permission.POST_NOTIFICATIONS' as any,
        );
      }

      setCamera(savedPrefs.camera ?? cameraGranted);
      setLocation(savedPrefs.location ?? locationGranted);
      setNotifications(savedPrefs.notifications ?? notificationGranted);
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
    
    // Check when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      checkPermissions();
    });

    return unsubscribe;
  }, [navigation, checkPermissions]);

  const requestPermission = async (permission: any, setter: (val: boolean) => void, key: string) => {
    try {
      const granted = await PermissionsAndroid.request(permission);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        setter(true);
        await savePermissions(key, true);
      } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        Alert.alert(
          'Permission Required',
          'Please enable this permission from app settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => Linking.openSettings()},
          ],
        );
        setter(false);
        await savePermissions(key, false);
      } else {
        setter(false);
        await savePermissions(key, false);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const toggleNotifications = async () => {
    if (!notifications) {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await requestPermission('android.permission.POST_NOTIFICATIONS' as any, setNotifications, 'notifications');
      } else {
        setNotifications(true);
        await savePermissions('notifications', true);
      }
    } else {
      setNotifications(false);
      await savePermissions('notifications', false);
    }
  };

  const toggleCamera = async () => {
    if (!camera) {
      await requestPermission(PermissionsAndroid.PERMISSIONS.CAMERA, setCamera, 'camera');
    } else {
      setCamera(false);
      await savePermissions('camera', false);
    }
  };

  const toggleLocation = async () => {
    if (!location) {
      await requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, setLocation, 'location');
    } else {
      setLocation(false);
      await savePermissions('location', false);
    }
  };

  const BellIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
        stroke="#666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const CameraIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 14l-4-4 4-4"
        stroke="#666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 20v-7a4 4 0 0 0-4-4H5"
        stroke="#666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  const LocationIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="#666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        stroke="#666"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
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
        <View style={{width: 30}} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Permissions</Text>

        <View style={styles.card}>
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <BellIcon />
              <Text style={styles.itemText}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{false: '#D1D1D1', true: '#76BA6F'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <CameraIcon />
              <Text style={styles.itemText}>Camera</Text>
            </View>
            <Switch
              value={camera}
              onValueChange={toggleCamera}
              trackColor={{false: '#D1D1D1', true: '#76BA6F'}}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <LocationIcon />
              <Text style={styles.itemText}>Location</Text>
            </View>
            <Switch
              value={location}
              onValueChange={toggleLocation}
              trackColor={{false: '#D1D1D1', true: '#76BA6F'}}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Save and exit</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3F5B3B',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3F5B3B',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 15,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  button: {
    backgroundColor: '#3F5B3B',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PermissionsScreen;
