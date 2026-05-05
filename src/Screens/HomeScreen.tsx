import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {CompositeNavigationProp} from '@react-navigation/native';
import {RootStackParamList, DrawerParamList} from '../Navigation/AppNavigator';
import {ReportIcon} from '../Assets';

type HomeScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.openDrawer()}>
          <View style={styles.menuLine} />
          <View style={[styles.menuLine, styles.shortMenuLine]} />
          <View style={styles.menuLine} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wildlife Watch</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('IncidentForm')}>
          <View style={styles.cardImageContainer}>
            <ReportIcon
              // width="100%"
              // height="100%"
              // preserveAspectRatio="xMidYMid slice"
            />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    position: 'absolute',
    left: 20,
    gap: 4,
  },
  menuLine: {
    width: 25,
    height: 3,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  shortMenuLine: {
    width: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#41583C',
  },
  content: {
    padding: 25,
    flex: 1,
  },
  card: {
    // borderRadius: 24,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 4},
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 5,
    // overflow: 'hidden', // Ensure image respects card's borderRadius
  },
  cardImageContainer: {
    width: '100%',
    height: 250, // Increased height to match card-like feel
    alignItems: 'center',
    justifyContent: 'center',
    top: 50,
  },
});

export default HomeScreen;
