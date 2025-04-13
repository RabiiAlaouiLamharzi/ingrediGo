import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Pressable, StyleSheet, StatusBar, SafeAreaView, Button, Dimensions } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import OcrModule from '../modules/ocr-module'; // Assume this is an OCR module
import FastTranslator from 'fast-mlkit-translate-text'; // Assume this is translation module
import { useTranslation } from 'react-i18next';

const Translation = ({ navigation }) => {
  const { t,i18n } = useTranslation();
  const localLanguage = i18n.localLanguage ?? 'fr';

  const setLocalLanguage = (lang) => {
    i18n.localLanguage = lang ?? 'fr';
  };
  const [facing, setFacing] = useState<CameraType>('back');
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState('picture');
  const [text, setText] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const currentLanguage = i18n.language;
  const languageMap = {
    en: 'English',
    fr: 'French',
    zh: 'Chinese',
  };
  
  // Take a picture
  const takePicture = async () => {
    setText([]); // Clear old text
    setTranslatedText(null);

    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      skipProcessing: true, // Get raw image
    });

    if (photo?.uri) {
    await recognizeTextFromImage(photo?.uri, localLanguage);
    }
  };

  /// Recognize text from image (OCR)
const recognizeTextFromImage = async (path: string, languageCode: string) => {
    setIsLoading(true);
    try {
      const recognizedText = await OcrModule.recognizeTextAsync(path, languageCode);
      setText(recognizedText);
      console.log("Recognized Text:", recognizedText);
  
      // If recognized text is found, attempt translation
      if (recognizedText && recognizedText.length > 0) {
        translateAll(recognizedText); // Proceed to translation
      } else {
        // If no text is recognized, handle the case and move forward
        setTranslatedText(null); // Set translated text to null
        navigation.navigate('Translated', { translatedText: null });
      }
    } catch (err) {
      console.error(err);
      setText([]);
      setTranslatedText(null); // If error occurs, reset to null
      navigation.navigate('Translated', { translatedText: null });
    }
    setIsLoading(false);
  };
  
  // Translate recognized text
  const translateAll = async (recognizedText: string[]) => {
    try {
      const sourceLang = languageMap[localLanguage];; // Example, could be dynamically detected
      const targetLang = languageMap[currentLanguage];; // Desired translation language
  
      await FastTranslator.prepare({
        source: sourceLang,
        target: targetLang,
        downloadIfNeeded: false,
      });
      if (!FastTranslator.isLanguageDownloaded('French')) {
        await FastTranslator.downloadLanguageModel('French');
      }
      if (!FastTranslator.isLanguageDownloaded('English')) {
        await FastTranslator.downloadLanguageModel('English');
      }
      if (!FastTranslator.isLanguageDownloaded('Chinese')) {
        await FastTranslator.downloadLanguageModel('Chinese');
      }
  
      const translations = await FastTranslator.translate(recognizedText); // Translate as a single string
      setTranslatedText(translations); // Set as a single string if translation exists
  
      console.log("Translations:", translations);
  
      // Always navigate to 'Translated' screen, regardless of translation success
      navigation.navigate('Translated', { translatedText: translations || null });
    } catch (err) {
      console.error('Translation error:', err);
      setTranslatedText(null); // If translation fails, set to null
  
      // Always navigate to 'Translated' screen, even on error
      navigation.navigate('Translated', { translatedText: null });
    }
  };
  


  // Style for layout
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [scaledPositions, setScaledPositions] = useState<any[]>([]);

  useEffect(() => {
    if (uri) {
      Image.getSize(uri, (width, height) => {
        setImageSize({ width, height });
      });
    }
  }, [uri, screenWidth, screenHeight]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      
      <View style={styles.cameraPreview}>
        {uri ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri }}
              style={{
                width:
                  imageSize.width *
                  Math.min(screenWidth / imageSize.width, screenHeight / imageSize.height),
                height:
                  imageSize.height *
                  Math.min(screenWidth / imageSize.width, screenHeight / imageSize.height),
                resizeMode: 'contain',
              }}
            />
            <View style={styles.overlay}>
              {translatedText ? (
                <Text
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    right: 10,
                    fontSize: 16,
                    color: 'black',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: 10,
                    borderRadius: 5,
                  }}
                >
                  {translatedText}
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.overlayContainer}>
                <Text style={styles.titleText}>{t('translator')}</Text>
                <Text style={styles.subtitleText}>
                {t('Scan')}
                </Text>
                <Text style={styles.subtitleText}>{localLanguage+ " -> "+currentLanguage}</Text>

                </View>
                
            <View style={styles.buttonContainer}>
                {/* Camera button for taking picture */}
                <Pressable onPress={() => takePicture()}>
                <View style={{ backgroundColor: "transparent", borderWidth: 5, borderColor: "white", width: 65, height: 65, borderRadius: 45, alignItems: "center", justifyContent: "center" }}>
                    <View style={{ width: 50, height: 50, borderRadius: 50, backgroundColor: "white" }} />
                </View>
                </Pressable>
            </View>
          </CameraView>
        )}
      </View>
      
 <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home-outline" size={24} color="#888" />
            {/* <Text style={styles.tabLabel}>Home</Text> */}
            <Text style={styles.tabLabel}>{t('home')}</Text>

        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Translator')}>
            <Ionicons name="camera" size={24} color="#4CAF50" />
            {/* <Text style={styles.tabLabel}>Translator</Text> */}
            <Text style={styles.tabLabel}>{t('translator')}</Text>

        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Favorites')}>
            <Ionicons name="heart-outline" size={24} color="#888" />
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
  camera: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  buttonContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center", 
    flexDirection: "row", 
    justifyContent: "center", 
    paddingHorizontal: 30,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
