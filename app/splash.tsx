import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, StatusBar, Text, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Splash: undefined;
  SignIn: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const splash = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const loaderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startLoaderAnimation = () => {
      Animated.timing(loaderAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start();
    };

    startLoaderAnimation();

    const timer = setTimeout(() => {
      navigation.replace('SignIn');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation, loaderAnim]);

  const loaderWidth = loaderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.text}>IngrediGO</Text>
      </View>
      <View style={styles.loadingBarBackground}>
        <Animated.View
          style={[
            styles.loadingBarLoader,
            {
              width: loaderWidth,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
    color: '#000',
  },
  loadingBarBackground: {
    width: '55%',
    height: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  loadingBarLoader: {
    height: '100%',
    backgroundColor: '#000',
  },
});

export default splash;