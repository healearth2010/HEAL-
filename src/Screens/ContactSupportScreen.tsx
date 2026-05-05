import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {DrawerParamList} from '../Navigation/AppNavigator';

type ContactSupportScreenProps = {
  navigation: DrawerNavigationProp<DrawerParamList, 'ContactSupport'>;
};

const ContactSupportScreen = ({navigation}: ContactSupportScreenProps) => {
  const phoneNumbers = [
    '+91 79806 90537',
    '+91 98310 60229',
    '+91 98304 79671',
    '+91 99036 93999',
  ];

  const email = 'healearth2010@gmail.com';

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
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
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Contact us/Request support</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Phone:</Text>
          {phoneNumbers.map((phone, index) => (
            <TouchableOpacity key={index} onPress={() => handlePhonePress(phone)}>
              <Text style={styles.linkText}>{phone}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Email:</Text>
          <TouchableOpacity onPress={handleEmailPress}>
            <Text style={styles.linkText}>{email}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  backButton: {
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#41583C',
  },
  content: {
    padding: 25,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#41583C',
    marginBottom: 40,
    textAlign: 'center',
  },
  section: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  linkText: {
    fontSize: 18,
    color: '#41583C',
    fontWeight: '500',
    textDecorationLine: 'underline',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ContactSupportScreen;
