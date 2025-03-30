import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';

const signIn = ({ navigation }) => {
  const handlePress = () => {
    navigation.navigate('Home');
  };

  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.background}>
      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Image source={require('../assets/images/outlook.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>CONNECT WITH OUTLOOK</Text>
      </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22A45D',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonIcon: {
    width: 38,
    height: 38,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
  },
});

export default signIn;