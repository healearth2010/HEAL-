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

type AboutUsScreenProps = {
  navigation: DrawerNavigationProp<DrawerParamList, 'AboutUs'>;
};

const AboutUsScreen = ({navigation}: AboutUsScreenProps) => {
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
        <Text style={styles.title}>About us</Text>
        
        <Text style={styles.paragraph}>
          Human & Environment Alliance League (HEAL) is a conservation NGO founded in 2017 that works to protect wildlife and ecosystems in India.
        </Text>

        <Text style={styles.paragraph}>
          It addresses environmental challenges through scientific research, community engagement, wildlife crime investigations, and policy advocacy to promote sustainable coexistence between humans and nature.
        </Text>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Find us at </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://healearth.in/')}>
            <Text style={styles.link}>https://healearth.in/</Text>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#41583C',
    marginBottom: 30,
  },
  paragraph: {
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 25,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  linkText: {
    fontSize: 18,
    color: '#333',
  },
  link: {
    fontSize: 18,
    color: '#41583C',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default AboutUsScreen;
