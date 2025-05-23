import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Image,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const SERVER_URL = 'http://192.168.1.139:3000'; // Adjust based on your server URL

const storeImages = {
    Lidl: require('../assets/images/lidl.png'),
    Auchan: require('../assets/images/auchan.jpeg'),
    Carrefour: require('../assets/images/carrefour.jpg'),
    Leclerc: require('../assets/images/leclerc.jpg'),
    Intermarché: require('../assets/images/intermarche.png'),
    Monoprix: require('../assets/images/monoprix.png'),
    Casino: require('../assets/images/casino.png'),
    Aldi: require('../assets/images/aldi.jpg')
  };

// Mock API service for favorites
const FavoritesService = {
  async getFavorites() {
    try {
      // In a real app, you would use fetch here to get data from your API
      // For testing, we'll try to read from a local file
      const response = await fetch(`${SERVER_URL}/favorites`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },
  
  async addFavorite(favorite) {
    try {
      const currentFavorites = await this.getFavorites();

      const exists = currentFavorites.some(fav => fav.id === favorite.id);
      if (exists) {
        return { success: true, message: 'Favorite already exists' };
      }

      const updatedFavorites = [...currentFavorites, favorite];
      
      // Save updated favorites
      const response = await fetch(`${SERVER_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFavorites),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save favorite');
      }
      
      return { success: true, message: 'Favorite added successfully' };
    } catch (error) {
      console.error('Error adding favorite:', error);
      return { success: false, message: error.message };
    }
  },
  
  async removeFavorite(favoriteId) {
    try {
      const currentFavorites = await this.getFavorites();

      const updatedFavorites = currentFavorites.filter(fav => fav.id !== favoriteId);
      
      // Save updated favorites
      const response = await fetch(`${SERVER_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFavorites),
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }
      
      return { success: true, message: 'Favorite removed successfully' };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return { success: false, message: error.message };
    }
  },
};

const Location = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const myLanguage = i18n.language;
  const localLanguage = i18n.localLanguage ?? 'fr';
  const { store, recipe } = route.params;
  
  const [ingredientsList, setIngredientsList] = useState([]);
  const [noIngredientsFound, setNoIngredientsFound] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const loadedFavorites = await FavoritesService.getFavorites();
      setFavorites(loadedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Could not load favorites.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (store && recipe && !isLoading) {
      const processedIngredients = store.ingredients.includedIngredients.map(ingredientName => {
        const ingredient = recipe.ingredients.find(ing => ing.name === ingredientName);
        const storeInfo = ingredient?.stores.find(s => s.name === store.name);

        const isFavorite = favorites.some(fav => fav.id === (ingredient?.id || ingredientName));
        
        return {
          id: ingredient?.id || ingredientName,
          name: ingredient?.translation?.[myLanguage] || ingredientName,
          translation: ingredient?.translation?.[localLanguage] || ingredientName,
          category: getCategoryFromIngredient(ingredientName),
          location: storeInfo?.aisle || 'N/A',
          prices: ingredient?.prices || null,
          isFavorite: isFavorite,
          originalData: ingredient
        };
      });

      const hasValidIngredients = processedIngredients.some(ing => ing.location !== 'N/A');
      
      if (processedIngredients.length === 0 || !hasValidIngredients) {
        setNoIngredientsFound(true);
        setIngredientsList([]);
      } else {
        setNoIngredientsFound(false);
        setIngredientsList(processedIngredients);
      }
    }
  }, [store, recipe, myLanguage, localLanguage, favorites, isLoading]);

  const getCategoryFromIngredient = (ingredientName) => {
    const name = ingredientName.toLowerCase();
  
    if (name.includes('fish')) return t('Fish');
    if (
      name.includes('potato') ||
      name.includes('carrot') ||
      name.includes('onion') ||
      name.includes('zucchini') ||
      name.includes('garlic') 
    ) return t('Fresh');
    if (
      name.includes('flour') ||
      name.includes('baking')
    ) return t('Baking');
    if (
      name.includes('egg') ||
      name.includes('milk') ||
      name.includes('butter') ||
      name.includes('dairy') ||
      name.includes('coconut milk')
    ) return t('Dairy');
    if (
      name.includes('lamb') ||
      name.includes('chicken breast') ||
      name.includes('chicken thigh') ||
      name.includes('ground lamb') ||
      name.includes('beef')
    ) return t('Meat');
    if (
      name.includes('almond') ||
      name.includes('apricot') ||
      name.includes('chickpea') ||
      name.includes('couscous') ||
      name.includes('tomato paste')
    ) return t('Pantry');
    if (
      name.includes('olive oil') ||
      name.includes('vegetable oil')
    ) return t('Oil');
    if (
      name.includes('cumin') ||
      name.includes('ras el hanout') ||
      name.includes('curry') ||
      name.includes('worcestershire')
    ) return t('Spices & Condiments');
  
    return t('Other');
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case t('Dairy'): return '#FF6174';
      case t('Baking'): return '#7F500B';
      case t('Fresh'): return '#3B6313';
      case t('Fish'): return '#1378BA';
      case t('Meat'): return '#C70039';
      case t('Pantry'): return '#FFBF00';
      case t('Oil'): return '#FF8C00';
      case t('Spices & Condiments'): return '#FF6F61';
      default: return '#3B6313';
    }
  };

  const toggleFavorite = async (id) => {
    const ingredient = ingredientsList.find(item => item.id === id);
    if (!ingredient) return;

    const updatedIngredientsList = ingredientsList.map(item => 
      item.id === id ? {...item, isFavorite: !item.isFavorite} : item
    );
    setIngredientsList(updatedIngredientsList);

    try {
      if (ingredient.isFavorite) {
        await FavoritesService.removeFavorite(id);
      } else {
        const favoriteData = {
          id: ingredient.id,
          name: ingredient.name,
          translation: ingredient.translation,
          category: ingredient.category,
          prices: ingredient.prices,
          recipeId: recipe.id,
          recipeName: recipe.name[myLanguage] || recipe.name.en,
          storeName: store.name,
          location: ingredient.location,
          timeAdded: new Date().toISOString(),
          originalData: ingredient.originalData
        };
        
        await FavoritesService.addFavorite(favoriteData);
      }
      
      loadFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Could not update favorites.');

      setIngredientsList(ingredientsList);
    }
  };

  if (noIngredientsFound) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('location')}</Text>
        </View>

        <View style={styles.noIngredientsContainer}>
          <Text style={styles.noIngredientsTitle}>{t('noIngredientsTitle')}</Text>
          <Text style={styles.noIngredientsText}>{t('noIngredientsText')}</Text>
          
          <TouchableOpacity 
            style={styles.backToStoresButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToStoresButtonText}>{t('backToStores')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="home" size={24} color="#4CAF50" />
            <Text style={[styles.tabLabel, styles.activeTab]}>{t('home')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => navigation.navigate('Translator')}
          >
            <Ionicons name="camera-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>{t('translator')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => navigation.navigate('Favorites')}
          >
            <Ionicons name="heart-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>{t('favorites')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>{t('profile')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('location')}</Text>
      </View>

      <ScrollView 
        style={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.textContainer0}>
          <Text style={styles.dishName}>{recipe?.name?.[myLanguage] || recipe?.name?.en}</Text>  
          <Image 
            source={storeImages[store.name]} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        {ingredientsList.map(ingredient => (
          <View key={ingredient.id} style={styles.itemCardTop}>
            <View style={styles.itemCard}>
              <View style={styles.textContainer}>
                <Text style={styles.itemName}>{ingredient.name}</Text>
                <Text style={styles.itemTranslation}>{ingredient.translation}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.heartButton}
                onPress={() => toggleFavorite(ingredient.id)}
              >
                <Ionicons 
                  name={ingredient.isFavorite ? "heart" : "heart-outline"} 
                  size={30} 
                  color={ingredient.isFavorite ? "red" : "black"} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.textContainer2}>
              <Text style={[styles.itemCategory, { backgroundColor: getCategoryColor(ingredient.category) }]}>
                {t('category')}:{'\n'}{ingredient.category}
              </Text>
              {/* <Text style={styles.itemLocation}>
                {t('aisle')}: {ingredient.location}
              </Text> */}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home" size={24} color="#4CAF50" />
          <Text style={[styles.tabLabel, styles.activeTab]}>{t('home')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Translator')}
        >
          <Ionicons name="camera-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>{t('translator')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Favorites')}
        >
          <Ionicons name="heart-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>{t('favorites')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Profile')}
        >
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    marginRight: 45,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  itemCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCard: {
    backgroundColor: '#FBFBFB',
    borderRadius: 50,
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9AA6B2',
    flex: 0.77,
  },
  textContainer0: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10
  },
  textContainer: {
    flex: 0.8,
  },
  textContainer2: {
    flexDirection: 'column',
    flex: 0.4,
    justifyContent: 'center',
    marginBottom: 10,
    paddingLeft: 10,
  },
  itemName: {
    fontSize: 25,
    fontWeight: '200',
    color: 'black',
    marginLeft: 10,
  },
  itemTranslation: {
    fontSize: 18,
    fontWeight: '200',
    fontStyle: 'italic',
    color: '#555',
    marginLeft: 10,
  },
  itemCategory: {
    fontSize: 15,
    fontWeight: '300',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    justifyContent: 'center',
    textAlign: 'center'
  },
  itemLocation: {
    fontSize: 35,
    fontWeight: '400',
    color: '#22A45D',
    textAlign: 'center'
  },
  dishName: {
    fontSize: 22,
    paddingLeft: 10,
    fontWeight: '500',
    fontStyle: 'italic',
    color: 'black'
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
    color: '#999',
    marginTop: 2,
  },
  activeTab: {
    color: '#4CAF50',
  },
  logo: {
    width: 45,
    height: 45,
  },
  noIngredientsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noIngredientsImage: {
    width: Dimensions.get('window').width * 0.6,
    height: Dimensions.get('window').width * 0.6,
    marginBottom: 30,
  },
  noIngredientsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noIngredientsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  backToStoresButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  backToStoresButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  heartButton: {
    padding: 0,
  },
  noIngredientsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noIngredientsImage: {
    width: Dimensions.get('window').width * 0.6,
    height: Dimensions.get('window').width * 0.6,
    marginBottom: 30,
  },
  noIngredientsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  noIngredientsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  backToStoresButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  backToStoresButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  heartButton: {
    padding: 5,
  },
});

export default Location;