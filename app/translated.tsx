import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export type ScrollViewRef = ScrollView & {
    flashScrollIndicators: () => void;
  };

const Translated = ({ navigation, route }) => {
  const scrollViewRef = useRef<ScrollViewRef | null>(null); // Create ref for ScrollView
  
  useEffect(() => {
    setTimeout(() => {
      // Flash the scroll indicators after 500ms
      scrollViewRef.current?.flashScrollIndicators();
    }, 1000);
  }, []);

  const { translatedText } = route.params;  // Assume the image URI, text, and positions are passed via route params
  
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Scaling the positions according to the image and screen size
  useEffect(() => {
    console.log('Route Params:', route.params);
  }, [screenWidth, screenHeight]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
    
      {/* Title */}
      <View style={styles.overlayContainer}>
        <Text style={styles.titleText}>Translation Results</Text>
        <Text style={styles.subtitleText}></Text>
      </View>

      {/* Main translation content */}
      <View style={styles.translationContainer}>
        {translatedText ? (
          <ScrollView
            style={styles.scrollableContainer}
            ref={scrollViewRef}    
            contentContainerStyle={styles.scrollableContent}
            persistentScrollbar={true}  // Ensure scroll indicator is visible
          >
            <Text style={styles.translationText}>
              {translatedText}
            </Text>
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>No translated text available.</Text>
        )}
      </View>

      {/* Translate Again Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Translator')} style={styles.button}>
        <Text style={styles.buttonText}>Translate again</Text>
      </TouchableOpacity>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Translator')}>
          <Ionicons name="camera" size={24} color="#4CAF50" />
          <Text style={[styles.tabLabel, styles.activeTab]}>Translator</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Favorites')}>
          <Ionicons name="heart-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>Favorites</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>Profile</Text>
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
    color: 'black',
    marginBottom: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
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
  button: {
    width: 285,
    height: 46.39535,
    backgroundColor: 'rgba(34, 164, 93, 1)',
    borderRadius: 47.34219,
    position: "absolute",
    bottom: 132, // increased a bit to avoid overlapping with tab bar
    alignSelf: 'center', // centers it horizontally
    flexDirection: "row", 
    justifyContent: "center", 
    paddingHorizontal: 30,
    alignItems: 'center',
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 1.89369,
    shadowOffset: { width: 0, height: 3.78738 },
  },  
  buttonText: {
    fontFamily: 'Poppins',  // Make sure 'Poppins' is available
    fontSize: 16.09635,
    letterSpacing: 0.75748,
    textAlign: 'center',
    color: 'white',
    marginVertical: 5,  // Center the text vertically
  },
  translationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  translationText: {
    fontSize: 16,
    color: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
  scrollableContainer: {
    width: '100%',  // Ensures ScrollView takes full width
    maxHeight: '70%',  // Adjust based on your preference, limiting the height before scrolling kicks in
    paddingTop: 10,  // Optional: Add some padding at the top
  },
  scrollableContent: {
    paddingBottom: 10,  // Optional: adds some padding to the bottom if needed
  },
});

export default Translated;
