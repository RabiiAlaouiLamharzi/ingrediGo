import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';

const Translation = ({ navigation }) => {
    const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.cameraPreview}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        <View style={styles.imageOverlay} />
        
        <View style={styles.overlayContainer}>
          {/* <Text style={styles.titleText}>Scan & Translate</Text> */}
          <Text style={styles.titleText}>{t('translator')}</Text>
          <Text style={styles.subtitleText}>{t('Scan')}</Text>
          {/* <Text style={styles.subtitleText}>
            Scan any ingredient with your camera for an instant translation
          </Text> */}
        </View>
      </View>
      
 <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home-outline" size={24} color="#888" />
            {/* <Text style={styles.tabLabel}>Home</Text> */}
            <Text style={styles.tabLabel}>{t('home')}</Text>

        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Translator')}>
            <Ionicons name="camera-outline" size={24} color="#4CAF50" />
            {/* <Text style={styles.tabLabel}>Translator</Text> */}
            <Text style={styles.tabLabel}>{t('translator')}</Text>

        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="heart" size={24} color="#888" />
            {/* <Text style={[styles.tabLabel, styles.activeTab]}>Favorites</Text> */}
            <Text style={styles.tabLabel}>{t('favorite')}</Text>

        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={24} color="#888" />
            {/* <Text style={styles.tabLabel}>Profile</Text> */}
            <Text style={styles.tabLabel}>{t('profile')}</Text>
            
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  cameraPreview: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  translationBox: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    borderWidth: 2,
    borderColor: 'green',
    padding: 10,
    borderRadius: 10,
  },
  translationText: {
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
    opacity: 0.6,
  },
  activeNavItem: {
    alignItems: 'center',
    opacity: 1,
  },
  activeNavText: {
    color: '#007AFF',
    marginTop: 5,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFF',
    height: 60,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 3,
    color: '#888',
  },
  activeTab: {
    color: '#4CAF50',
  },
});

export default Translation;