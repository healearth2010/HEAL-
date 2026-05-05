import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Svg, {Path, Circle} from 'react-native-svg';
import {CompositeNavigationProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {RootStackParamList, DrawerParamList} from '../Navigation/AppNavigator';

type SuccessScreenNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  CompositeNavigationProp<
    DrawerNavigationProp<DrawerParamList>,
    StackNavigationProp<RootStackParamList>
  >
>;

interface Props {
  navigation: SuccessScreenNavigationProp;
}

const SuccessScreen: React.FC<Props> = ({navigation}) => {
  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}>
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

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Svg width="140" height="140" viewBox="0 0 140 140" fill="none">
            <Circle cx="70" cy="70" r="65" stroke="#76BA6F" strokeWidth="8" />
            <Path
              d="M45 75L62 92L95 50"
              stroke="#76BA6F"
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text style={styles.title}>Incident successfully submitted</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={handleBackToHome}>
          <Text style={styles.buttonText}>Back to home</Text>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#41583C',
    textAlign: 'center',
    lineHeight: 32,
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 30,
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

export default SuccessScreen;
