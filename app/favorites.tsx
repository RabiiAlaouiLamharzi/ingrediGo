import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

// Your server URL - replace with your actual server address
const SERVER_URL = 'http://192.168.1.40:3000';

const Favorites = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const myLanguage = i18n.language;
  const localLanguage = i18n.localLanguage ?? 'fr';

  const [favorites, setFavorites] = useState([]);
  const [recentlyDeleted, setRecentlyDeleted] = useState([]);
  const [showUndoDelete, setShowUndoDelete] = useState(false);
  const [countdownTime, setCountdownTime] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef(null);

  // Load favorites from server
  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching favorites from server...');
      const response = await fetch(`${SERVER_URL}/favorites`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received favorites data:', data);
      return data;
    } catch (error) {
      console.error('Error loading favorites from server:', error);
      Alert.alert('Error', 'Failed to load favorites. Please try again.');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Save favorites to server
  const saveFavorites = async (items) => {
    try {
      console.log('Saving favorites to server:', items);
      const response = await fetch(`${SERVER_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Server response:', result);
      return result;
    } catch (error) {
      console.error('Error saving favorites to server:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  // Use useFocusEffect to reload data every time the screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Favorites screen focused - reloading data');
      const initializeFavorites = async () => {
        const loadedFavorites = await loadFavorites();
        // Add selected property to each item
        const favoritesWithSelected = loadedFavorites.map(item => ({
          ...item,
          selected: false
        }));
        setFavorites(favoritesWithSelected);
      };
      
      initializeFavorites();
      
      return () => {
        // Cleanup when screen loses focus
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }, [currentLang])
  );

  const toggleSelection = (itemId) => {
    const updatedFavorites = favorites.map(item =>
      item.id === itemId ? { ...item, selected: !item.selected } : item
    );
    setFavorites(updatedFavorites);
  };

  const hasSelectedItems = favorites.some(item => item.selected);

  const handleFindInStore = () => {
    const selectedItems = favorites
      .filter(item => item.selected)
      .map(item => ({
        name: item.originalData?.translation?.[myLanguage] || item.name,
        translation: item.originalData?.translation || { [myLanguage]: item.name },
        prices: item.prices,
        stores: item.originalData?.stores || [], // Make sure stores array exists
        // Include all other necessary fields
        ...item.originalData || item
      }));
  
    if (selectedItems.length === 0) {
      Alert.alert(t('No selection'), t('Please select at least one item'));
      return;
    }
  
    // Create a mock recipe structure that NearbyStores expects
    const mockRecipe = {
      id: 'favorites-selection',
      name: {
        en: 'Selected Favorites',
        fr: 'Favoris sélectionnés',
        zh: '选定的收藏'
      },
      ingredients: selectedItems.map(item => ({
        name: item.name,
        translation: item.translation,
        prices: item.prices,
        stores: item.stores,
        ...item
      }))
    };
  
    navigation.navigate('NearbyStores', { 
      selectedItems: selectedItems.map(item => item.name),
      ingredientData: selectedItems,
      recipe: mockRecipe
    });
  };

  const deleteSelectedItems = async () => {
    const selectedItems = favorites.filter(item => item.selected);
    const updatedFavorites = favorites.filter(item => !item.selected);
    
    setRecentlyDeleted(selectedItems);
    setFavorites(updatedFavorites);
    await saveFavorites(updatedFavorites);
    
    setShowUndoDelete(true);
    setCountdownTime(5);
    startDeleteTimer();
  };

  const undoDelete = async () => {
    const updatedFavorites = [...favorites, ...recentlyDeleted];
    setFavorites(updatedFavorites);
    await saveFavorites(updatedFavorites);
    
    setRecentlyDeleted([]);
    setShowUndoDelete(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startDeleteTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdownTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setShowUndoDelete(false);
          setRecentlyDeleted([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const renderFavoriteItem = (item) => {
    // Calculate progress width based on average price between min and max
    const minPrice = item.prices?.min || 0;
    const maxPrice = item.prices?.max || 1;
    const avgPrice = item.prices?.avg || (minPrice + maxPrice) / 2;
    
    const progressWidth = ((avgPrice - minPrice) / (maxPrice - minPrice)) * 100;
  
    // Get the correct name based on user's preferred language
    let displayName;
    if (item.originalData) {
      // If we have the originalData with proper translations
      displayName = item.originalData.translation?.[myLanguage] || 
                   item.originalData.name;
    } else {
      // Fallback to the simpler structure if originalData doesn't exist
      displayName = myLanguage === 'en' ? item.name : 
                   (item.translation || item.name);
    }
  
    // Get local translation (French by default)
    let localTranslation;
    if (item.originalData) {
      localTranslation = item.originalData.translation?.[localLanguage] || 
                       (localLanguage === 'en' ? item.originalData.name : null);
    } else {
      localTranslation = localLanguage === 'fr' ? item.translation : 
                       (localLanguage === 'en' ? item.name : null);
    }
  
    return (
      <View key={item.id} style={styles.favoriteItem}>
        <TouchableOpacity
          style={[styles.checkbox, item.selected && styles.checkboxSelected]}
          onPress={() => toggleSelection(item.id)}
        >
          {item.selected && (
            <Ionicons name="checkmark" size={22} color="white" />
          )}
        </TouchableOpacity>
        
        <View style={styles.itemNameContainer}>
          <Text style={styles.itemName}>{displayName}</Text>
          {localTranslation && localTranslation !== displayName && (
            <Text style={styles.localTranslation}>{localTranslation}</Text>
          )}
        </View>
        
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View
              style={[styles.sliderProgress, { width: `${progressWidth}%` }]}
            />
          </View>
          <View style={styles.priceLabels}>
            <Text style={styles.priceLabel}>Min: {minPrice}€</Text>
            <Text style={styles.midPriceLabel}>Avg: {avgPrice}€</Text>
            <Text style={styles.priceLabel}>Max: {maxPrice}€</Text>
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('Favoirte btn')}</Text>
        <Text style={styles.priceNote}>{t('Price tip')}</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {isLoading ? (
          <Text style={styles.loadingText}>{t('Loading...')}</Text>
        ) : favorites.length > 0 ? (
          favorites.map(renderFavoriteItem)
        ) : (
          <Text style={styles.noFavoritesText}>{t('No favorites yet')}</Text>
        )}
      </ScrollView>

      {hasSelectedItems && (
        <View style={styles.findInStoreContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={deleteSelectedItems}>
            <Ionicons name="trash-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.findInStoreButton} onPress={handleFindInStore}>
            <Text style={styles.findInStoreText}>{t('Find in store')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {showUndoDelete && (
        <View style={styles.undoDeleteContainer}>
          <TouchableOpacity style={styles.undoDeleteButton} onPress={undoDelete}>
            <Ionicons name="arrow-back" size={20} color="black" style={styles.undoIcon} />
            <Text style={styles.undoDeleteText}>{t('Undo delete')}</Text>
          </TouchableOpacity>
          <Text style={styles.countdownText}>{countdownTime} s</Text>
        </View>
      )}

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>{t('home')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Translator')}>
          <Ionicons name="camera-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>{t('translator')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="heart" size={24} color="#4CAF50" />
          <Text style={[styles.tabLabel, styles.activeTab]}>{t('favorite')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={24} color="#888" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '500',
  },
  priceNote: {
    fontSize: 12,
    color: 'gray',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: '#888',
  },
  noFavoritesText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: '#888',
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 21,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 6,
    marginRight: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  itemName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '300',
  },
  sliderContainer: {
    width: '50%',
    marginLeft: 10,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  sliderProgress: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  priceLabel: {
    fontSize: 11,
    color: 'black',
    fontWeight: '300',
  },
  midPriceLabel: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  findInStoreContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  findInStoreButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findInStoreText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '400',
  },
  clearButton: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: '#FBFBFB',
    borderWidth: 1,
    borderColor: '#AFAFAF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  undoDeleteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 20,
    margin: 20,
    borderWidth: 1,
    borderColor: '#AFAFAF',
    borderRadius: 50,
    backgroundColor: '#FBFBFB',
  },
  undoDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  undoIcon: {
    marginRight: 12,
  },
  undoDeleteText: {
    fontSize: 17,
    fontWeight: '400',
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E53935',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 10,
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
  itemNameContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 20,
    fontWeight: '300',
  },
  localTranslation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default Favorites;