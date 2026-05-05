import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../Screens/SplashScreen';
import PrivacyPolicyScreen from '../Screens/PrivacyPolicyScreen';
import HomeScreen from '../Screens/HomeScreen';
import IncidentFormScreen from '../Screens/IncidentFormScreen';
import PermissionsScreen from '../Screens/PermissionsScreen';
import AboutUsScreen from '../Screens/AboutUsScreen';
import ContactSupportScreen from '../Screens/ContactSupportScreen';
import SuccessScreen from '../Screens/SuccessScreen';
import ErrorScreen from '../Screens/ErrorScreen';
import { useNetworkSync } from '../hooks/useNetworkSync';

export type RootStackParamList = {
  Splash: undefined;
  PrivacyPolicy: undefined;
  MainDrawer: undefined;
  IncidentForm: undefined;
};

export type DrawerParamList = {
  Home: undefined;
  IncidentForm: undefined;
  Permissions: undefined;
  AboutUs: undefined;
  ContactSupport: undefined;
  Success: undefined;
  Error: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

const RightArrow = () => <Text style={styles.arrowIcon}>›</Text>;

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      <View style={styles.menuItemsContainer}>
        <DrawerItem
          label="Permissions"
          onPress={() => props.navigation.navigate('Permissions')}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
          icon={RightArrow}
        />
        <DrawerItem
          label="About us"
          onPress={() => props.navigation.navigate('AboutUs')}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
          icon={RightArrow}
        />
        <DrawerItem
          label="Contact us/Request support"
          onPress={() => props.navigation.navigate('ContactSupport')}
          labelStyle={styles.drawerLabel}
          style={styles.drawerItem}
          icon={RightArrow}
        />
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '80%',
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="IncidentForm" component={IncidentFormScreen} />
      <Drawer.Screen name="Permissions" component={PermissionsScreen} />
      <Drawer.Screen name="AboutUs" component={AboutUsScreen} />
      <Drawer.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Drawer.Screen name="Success" component={SuccessScreen} />
      <Drawer.Screen name="Error" component={ErrorScreen} />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Automatically flush queued incidents when the device comes back online
  useNetworkSync();

  useEffect(() => {
    checkPrivacyAcceptance();
  }, []);

  const checkPrivacyAcceptance = async () => {
    try {
      const accepted = await AsyncStorage.getItem('privacyPolicyAccepted');
      setPrivacyAccepted(accepted === 'true');
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { flex: 1 }]}>
        <ActivityIndicator size="large" color="#3F5B3B" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={privacyAccepted ? 'MainDrawer' : 'Splash'}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FE',
  },
  drawerContent: {
    paddingTop: 50,
  },
  menuItemsContainer: {
    paddingHorizontal: 10,
  },
  drawerItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginVertical: 0,
    borderRadius: 0,
  },
  drawerLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: '500',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#999',
    position: 'absolute',
    right: 0,
  },
});

export default AppNavigator;
