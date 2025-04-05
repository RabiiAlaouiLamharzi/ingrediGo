import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import recipeData from '../data/data.json'; 

const Favorites = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [favorites, setFavorites] = useState([]);
  const [recentlyDeleted, setRecentlyDeleted] = useState([]);
  const [showUndoDelete, setShowUndoDelete] = useState(false);
  const [countdownTime, setCountdownTime] = useState(3);
  const timerRef = useRef(null);

  useEffect(() => {
    const bookmarkedRecipes = recipeData.recipes.filter(recipe => recipe.bookmarked);
    const allIngredients = bookmarkedRecipes.flatMap(recipe => recipe.ingredients);

    const dedupedIngredients = allIngredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.translation?.[currentLang] || ingredient.name,
      minPrice: ingredient.prices.min,
      midPrice: ingredient.prices.avg,
      maxPrice: ingredient.prices.max,
      selected: false,
    }));

    setFavorites(dedupedIngredients);
  }, [currentLang]);

  const toggleSelection = (itemId) => {
    setFavorites(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const hasSelectedItems = favorites.some(item => item.selected);

  const handleFindInStore = () => {
    const selectedItems = favorites.filter(item => item.selected);
    navigation.navigate('NearbyStores', { items: selectedItems });
  };

  const deleteSelectedItems = () => {
    const selectedItems = favorites.filter(item => item.selected);
    setRecentlyDeleted(selectedItems);
    setFavorites(prev => prev.filter(item => !item.selected));
    setShowUndoDelete(true);
    setCountdownTime(5);
    startDeleteTimer();
  };

  const undoDelete = () => {
    setFavorites(prev => [...prev, ...recentlyDeleted]);
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
    const progressWidth = ((item.midPrice - item.minPrice) / (item.maxPrice - item.minPrice)) * 100;

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
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View
              style={[styles.sliderProgress, { width: `${progressWidth}%` }]}
            />
          </View>
          <View style={styles.priceLabels}>
            <Text style={styles.priceLabel}>{item.minPrice}€</Text>
            <Text style={styles.midPriceLabel}>{item.midPrice}€</Text>
            <Text style={styles.priceLabel}>{item.maxPrice}€</Text>
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
        {favorites.map(renderFavoriteItem)}
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
          <Text style={styles.tabLabel}>{t('favorite')}</Text>
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
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 21,
    paddingHorizontal: 20,
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
    fontSize: 13,
    color: 'black',
    fontWeight: '300',
  },
  midPriceLabel: {
    fontSize: 13,
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
});

export default Favorites;