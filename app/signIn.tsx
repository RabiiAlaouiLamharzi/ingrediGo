import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignIn = ({ navigation }) => {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = () => {
    setShowLoginPopup(true);
    setErrorMessage('');
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');

    // Check if guest login
    if (username === 'usertest' && password === 'usertest') {
      try {
        await AsyncStorage.setItem('userData', JSON.stringify({
          name: username,
          profession: 'University Student'
        }));
        setShowLoginPopup(false);
        navigation.navigate('Home');
      } catch (error) {
        setErrorMessage('Failed to save user data');
      }
    } else if (username && password) {
      // All other credentials are invalid
      setErrorMessage('Invalid credentials. Please try again or login as guest.');
    } else {
      setErrorMessage('Please enter both username and password');
    }
    
    setIsLoading(false);
  };

  const handleGuestLogin = () => {
    setUsername('usertest');
    setPassword('usertest');
  };

  return (
    <ImageBackground source={require('../assets/images/background.png')} style={styles.background}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePress}>
          <Image source={require('../assets/images/outlook.png')} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>CONNECT WITH OUTLOOK</Text>
        </TouchableOpacity>
      </View>

      {/* Login Popup Modal */}
      <Modal transparent visible={showLoginPopup} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.loginPopup}>
            <Text style={styles.popupTitle}>Sign In</Text>
            
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
            
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              style={[styles.loginButton, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'LOGGING IN...' : 'LOGIN'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.skipButton} 
              onPress={handleGuestLogin}
            >
              <Text style={styles.skipButtonText}>Login as Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
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
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  loginPopup: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 50,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 25,
    paddingVertical: 25,
    marginBottom: 15,
    color: '#333',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#22A45D',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  loginButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButton: {
    marginTop: 10,
    padding: 10,
  },
  skipButtonText: {
    color: '#22A45D',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default SignIn;