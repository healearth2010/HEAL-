import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../Navigation/AppNavigator';
import {SplashIcon} from '../Assets';

type SplashScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Splash'
>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [showSecondPhase, setShowSecondPhase] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    // Phase 1: Show initial splash for 1.5 seconds
    const timer = setTimeout(() => {
      setShowSecondPhase(true);
      progress.value = withTiming(1, {duration: 800});
    }, 1500);

    return () => clearTimeout(timer);
  }, [progress]);

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ['#FFFFFF', '#7BA874'], // Adjusted green color to match the image
    );
    return {backgroundColor};
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{translateY: (1 - progress.value) * -20}],
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{translateY: (1 - progress.value) * 20}],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedBackgroundStyle]}>
      {showSecondPhase && (
        <Animated.View
          style={[
            styles.textContainer,
            animatedTextStyle,
            {top: insets.top + 50},
          ]}>
          <Text style={styles.titleText}>WildTag</Text>
          {/* <Text style={styles.titleText}>Watch</Text> */}
        </Animated.View>
      )}

      <View style={styles.logoContainer}>
        <SplashIcon width={250} height={250} />
      </View>

      {showSecondPhase && (
        <Animated.View
          style={[
            styles.buttonContainer,
            animatedButtonStyle,
            {bottom: insets.bottom + 20},
          ]}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
  titleText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Avenir-Heavy', // Using Avenir as a placeholder for a clean sans-serif
  },
  buttonContainer: {
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#41583C', // Darker green for button
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

export default SplashScreen;
