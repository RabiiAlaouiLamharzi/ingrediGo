import React, { useState, useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  FlatList,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://192.168.1.40:3000'; // Adjust based on your server URL

const Recipe = () => {
  const route = useRoute();
  const { recipe, ingredient } = route.params;
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // Always start with bookmark unselected
  const [bookmarked, setBookmarked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const initialSelections = {};
  if (recipe?.ingredients) {
    recipe.ingredients.forEach(ing => {
      initialSelections[ing.name] = false;
    });
  } else if (ingredient) {
    initialSelections[ingredient.name] = false;
  }

  const [selections, setSelections] = useState(initialSelections);
  const isAnySelected = Object.values(selections).some(value => value === true);

  const productImages = [];
  if (recipe?.images) {
    if (recipe.images.main) productImages.push({ uri: recipe.images.main });
    if (recipe.images.alt1) productImages.push({ uri: recipe.images.alt1 });
    if (recipe.images.alt2) productImages.push({ uri: recipe.images.alt2 });
  } else {
    productImages.push(require('../assets/images/background.png'));
  }

  // Check if recipe is already bookmarked on component mount
  useEffect(() => {
    checkIfBookmarked();
  }, []);

  // Check if this recipe is already bookmarked
  const checkIfBookmarked = async () => {
    try {
      if (!recipe) return;
      
      // Read the current bookmarked recipes
      const response = await axios.get(`${API_URL}/bookmarked`);
      const bookmarkedRecipes = response.data || [];
      
      // Check if current recipe is in the bookmarked list
      const isBookmarked = bookmarkedRecipes.some(item => item.id === recipe.id);
      setBookmarked(isBookmarked);
    } catch (error) {
      console.error('Error checking if recipe is bookmarked:', error);
    }
  };

  const toggleSelection = (item) => {
    setSelections(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const toggleBookmark = async () => {
    try {
      if (!recipe) return;
      
      // Toggle bookmark state for UI
      const newBookmarkState = !bookmarked;
      setBookmarked(newBookmarkState);
      
      // Read current bookmarked recipes
      const response = await axios.get(`${API_URL}/bookmarked`);
      let bookmarkedRecipes = response.data || [];
      
      if (newBookmarkState) {
        // Add to bookmarked recipes if not already there
        if (!bookmarkedRecipes.some(item => item.id === recipe.id)) {
          const recipeToSave = {
            id: recipe.id,
            name: recipe.name,
            images: recipe.images,
            description: recipe.description,
            ingredients: recipe.ingredients,
            bookmarked: true
          };
          bookmarkedRecipes.push(recipeToSave);
        }
      } else {
        // Remove from bookmarked recipes
        bookmarkedRecipes = bookmarkedRecipes.filter(item => item.id !== recipe.id);
      }
      
      // Save updated bookmarked recipes
      await axios.post(`${API_URL}/bookmarked`, bookmarkedRecipes);
      
    } catch (error) {
      console.error('Error updating bookmarked recipes:', error);
      // Revert UI state if saving failed
      setBookmarked(!bookmarked);
      Alert.alert('Error', 'Failed to update bookmarks');
    }
  };

  useEffect(() => {
    if (productImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % productImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentImageIndex]);

  const getSliderPosition = (min, max, current) => {
    if (min === max) return 50;
    return ((current - min) / (max - min)) * 100;
  };

  const ingredientsData = [];
  if (recipe?.ingredients) {
    recipe.ingredients.forEach(ing => {
      ingredientsData.push({
        id: ing.name,
        name: ing.translation?.[lang] || ing.name,
        min: ing.prices?.min || 0,
        max: ing.prices?.max || 0,
        current: ing.prices?.avg || 0,
        unit: ing.prices?.currency || '€'
      });
    });
  } else if (ingredient) {
    ingredientsData.push({
      id: ingredient.name,
      name: ingredient.translation?.[lang] || ingredient.name,
      min: ingredient.prices?.min || 0,
      max: ingredient.prices?.max || 0,
      current: ingredient.prices?.avg || 0,
      unit: ingredient.prices?.currency || '€'
    });
  }

  const renderIngredientItem = ({ item }) => {
    const sliderPosition = getSliderPosition(item.min, item.max, item.current);

    return (
      <View style={styles.ingredientRow}>
        <TouchableOpacity
          style={[styles.checkbox, selections[item.id] && styles.checkedBox]}
          onPress={() => toggleSelection(item.id)}
        >
          {selections[item.id] && (
            <Ionicons name="checkmark" size={18} color="white" />
          )}
        </TouchableOpacity>
        <Text style={styles.ingredientName}>{item.name}</Text>
        <View style={styles.priceSliderContainer}>
          <View style={styles.sliderContainer}>
            <View style={styles.sliderTrack}>
              <View style={[styles.sliderFill, { width: `${sliderPosition}%` }]} />
            </View>
            <View style={styles.priceLabelsContainer}>
              <Text style={styles.priceMin}>Min: {item.min}€</Text>
              <Text style={styles.currentPrice}>Avg: {item.current}€</Text>
              <Text style={styles.priceMax}>Max: {item.max}€</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView style={styles.contentArea} edges={['right', 'bottom', 'left']}>
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.imageContainer}>
            <Animated.Image
              source={productImages[currentImageIndex]}
              style={[styles.headerImage, { opacity: fadeAnim }]}
              resizeMode="cover"
            />

            <LinearGradient colors={['rgba(0,0,0,0.7)', 'transparent']} style={styles.topGradient} />
            <LinearGradient colors={['transparent', 'white']} style={styles.bottomGradient} />

            <View style={styles.imageOverlay}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
                <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.textOverlay}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>
                  {recipe ? recipe.name?.[lang] : ingredient.translation?.[lang] || ingredient.name}
                </Text>
                {productImages.length > 1 && (
                  <View style={styles.paginationContainer}>
                    {productImages.map((_, index) => (
                      <View
                        key={index}
                        style={[styles.paginationDot, index === currentImageIndex && styles.activeDot]}
                      />
                    ))}
                  </View>
                )}
              </View>
              {recipe?.description && (
                <Text style={styles.description}>{recipe.description?.[lang]}</Text>
              )}
            </View>
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.priceDisclaimer}>{t('Price tip')}</Text>

            <FlatList
              data={ingredientsData}
              renderItem={renderIngredientItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.ingredientsContainer}
              scrollEnabled={false}
              ListFooterComponent={
                <TouchableOpacity
                  style={[styles.findButton, !isAnySelected && styles.findButtonDisabled]}
                  disabled={!isAnySelected}
                  onPress={() => navigation.navigate('NearbyStores', {
                    selectedItems: Object.keys(selections).filter(key => selections[key]),
                    ingredientData: ingredientsData,
                    recipe: recipe || { // If no recipe, create a mock recipe from the ingredient
                      name: {
                        en: ingredient?.name || "Selected Ingredients",
                        fr: ingredient?.translation?.fr || "Ingrédients sélectionnés",
                        zh: ingredient?.translation?.zh || "选定的成分"
                      },
                      ingredients: [ingredient] // Wrap single ingredient in array
                    }
                  })}
                >
                  <Text style={styles.findButtonText}>{t('Find in store')}</Text>
                </TouchableOpacity>
              }
            />
          </View>
        </ScrollView>

        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home" size={24} color="#4CAF50" />
            <Text style={[styles.tabLabel, styles.activeTab]}>{t('home')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Translator')}>
            <Ionicons name="camera-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>{t('translator')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Favorites')}>
            <Ionicons name="heart-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>{t('favorite')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>{t('profile')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    marginTop: -1,
  },
  listContainer: {
    padding: 20,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  textOverlay: {
    position: 'absolute',
    bottom: -55,
    left: 20,
    right: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 40,
    color: '#333',
  },
  paginationContainer: {
    flexDirection: 'row',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#333',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 16,
    textAlign: 'justify',
  },
  priceDisclaimer: {
    fontSize: 12,
    color: '#888',
    marginTop: 44,
    marginBottom: 22,
  },
  ingredientsContainer: {
    marginBottom: 15,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '300',
    paddingRight: 10,
    width: 120,
  },
  priceSliderContainer: {
    flex: 1,

  },
  sliderContainer: {
    flex: 1,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  priceLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  priceMin: {
    fontSize: 12,
    color: '#333',
    textAlign: 'left',
  },
  currentPrice: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
    textAlign: 'center',
  },
  priceMax: {
    fontSize: 12,
    color: '#333',
    textAlign: 'right',
  },
  findButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  findButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  findButtonText: {
    color: 'white',
    fontSize: 18,
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

export default Recipe;