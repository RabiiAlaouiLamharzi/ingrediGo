import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SectionList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import recipeData from '../data/data.json';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'http://192.168.1.139:3000';

const Home = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ recipes: [], ingredients: [] });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryScrollViewRef, setCategoryScrollViewRef] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const categories = [...new Set(recipeData.recipes.map(recipe => recipe.category[lang]))];
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
        setSelectedCategoryIndex(0);
        filterByCategory(categories[0]);
      }

      const response = await fetch(`${API_URL}/bookmarked`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookmarked recipes');
      }
      
      const bookmarkedRecipes = await response.json();
      
      const normalizedRecipes = bookmarkedRecipes.map(recipe => {
        if (recipe.category && typeof recipe.category === 'object') {
          return recipe;
        }
        
        return {
          ...recipe,
          category: {
            en: recipe.category || 'General',
            fr: recipe.category || 'Général',
            zh: recipe.category || '一般'
          }
        };
      });
      
      setBookmarkedRecipes(normalizedRecipes);
    } catch (error) {
      console.error('Error fetching data:', error);
      const localBookmarked = recipeData.recipes.filter(recipe => recipe.bookmarked);
      setBookmarkedRecipes(localBookmarked);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [lang]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    fetchData();
  }, [lang, fetchData]);

  const calculateAveragePrice = (recipe) => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return '0.00';
    const total = recipe.ingredients.reduce((sum, ingredient) => {
      return sum + (ingredient.prices?.avg || 0);
    }, 0);
    return total.toFixed(2);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const recipeMatches = recipeData.recipes.filter(recipe => 
        recipe.name[lang].toLowerCase().includes(query.toLowerCase())
      );

      const allIngredients = recipeData.recipes.flatMap(recipe => recipe.ingredients);
      const uniqueIngredients = Array.from(new Set(allIngredients.map(i => i.name)))
        .map(name => allIngredients.find(i => i.name === name));

      const ingredientMatches = uniqueIngredients.filter(ingredient => 
        ingredient.translation?.[lang]?.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions({
        recipes: recipeMatches,
        ingredients: ingredientMatches
      });
    } else {
      setSuggestions({ recipes: [], ingredients: [] });
    }
  };

  const filterByCategory = (category) => {
    const categories = [...new Set(recipeData.recipes.map(recipe => recipe.category[lang]))];
    const index = categories.indexOf(category);
    setSelectedCategory(category);
    setSelectedCategoryIndex(index);
    setFilteredRecipes(recipeData.recipes.filter(recipe => 
      recipe.category[lang] === category
    ));
    
    if (categoryScrollViewRef) {
      categoryScrollViewRef.scrollTo({ 
        x: index * 110,
        animated: true 
      });
    }
  };

  const handleSuggestionPress = (item, isIngredient) => {
    setIsSearchFocused(false);
    setTimeout(() => {
      if (isIngredient) {
        navigation.navigate('Recipe', { 
          ingredient: item,
          recipe: null
        });
      } else {
        navigation.navigate('Recipe', { recipe: item });
      }
      
      setSearchQuery('');
      setSuggestions({ recipes: [], ingredients: [] });
    }, 50);
  };

  const renderSuggestionItem = ({ item, section }) => (
    <TouchableOpacity 
      style={styles.suggestionItem} 
      activeOpacity={0.7}
      onPress={() => handleSuggestionPress(item, section.title === 'ingredients')}
    >
      <Text style={styles.suggestionText}>
        {section.title === 'recipes' ? item.name[lang] : item.translation[lang]}
      </Text>
      {section.title === 'ingredients' && (
        <Text style={styles.suggestionSubtext}>
          {t('found_in')} {recipeData.recipes.filter(r => 
            r.ingredients.some(i => i.name === item.name)
          ).length} {t('recipes')}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderRecipeCard = (recipe) => (
    <TouchableOpacity 
      key={recipe.id}
      style={styles.recipeCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Recipe', { recipe })}
    >
      <Image 
        source={{ uri: recipe.images?.main }} 
        style={styles.recipeImage}
        defaultSource={require('../assets/images/background.png')}
      />
      <Text style={styles.recipeTitle} numberOfLines={1}>
        {recipe.name?.[lang] || recipe.name || t('Unnamed Recipe')}
      </Text>
      <View style={styles.recipeDetails}>
        <Text style={styles.priceText}>€{calculateAveragePrice(recipe)}</Text>
        <Text style={styles.dotSeparator}>•</Text>
        <Text style={styles.cuisineText} numberOfLines={1}>
          {recipe.category?.[lang] || recipe.category || t('Uncategorized')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecipeCard2 = (recipe) => (
    <TouchableOpacity 
      key={recipe.id}
      style={styles.recipeCard2}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Recipe', { recipe })}
    >
      <Image 
        source={{ uri: recipe.images?.main }} 
        style={styles.recipeImage}
        defaultSource={require('../assets/images/background.png')}
      />
      <Text style={styles.recipeTitle} numberOfLines={1}>
        {recipe.name?.[lang] || recipe.name || t('unnamed_recipe')}
      </Text>
      <View style={styles.recipeDetails}>
        <Text style={styles.priceText}>€{calculateAveragePrice(recipe)}</Text>
        <Text style={styles.dotSeparator}>•</Text>
        <Text style={styles.cuisineText} numberOfLines={1}>
          {recipe.category?.[lang] || recipe.category || t('uncategorized')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const categories = [...new Set(recipeData.recipes.map(recipe => recipe.category[lang]))];

  const sectionsData = [
    { title: 'recipes', data: suggestions.recipes },
    { title: 'ingredients', data: suggestions.ingredients }
  ].filter(section => section.data.length > 0);

  const hasSuggestions = suggestions.recipes.length > 0 || suggestions.ingredients.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.appName}>IngrediGO</Text>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('search_recipe')}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setSuggestions({ recipes: [], ingredients: [] });
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {isSearchFocused && hasSuggestions && (
          <View style={styles.suggestionsContainer}>
            <SectionList
              sections={sectionsData}
              keyExtractor={(item, index) => item.id?.toString() || item.name || index.toString()}
              renderItem={renderSuggestionItem}
              renderSectionHeader={({ section: { title } }) => (
                <Text style={styles.suggestionHeader}>
                  {title === 'recipes' ? t('recipes') : t('ingredients')}
                </Text>
              )}
              style={styles.suggestionsList}
              keyboardShouldPersistTaps="always"
              bounces={false}
            />
          </View>
        )}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent, 
          isSearchFocused && hasSuggestions && styles.dimmedContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.categoryWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            ref={ref => setCategoryScrollViewRef(ref)}
          >
            {categories.map((category, index) => (
              <TouchableOpacity 
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive,
                  selectedCategory === category && {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    borderWidth: 1,
                    borderColor: '#E8F5E9',
                    borderBottomWidth: 0,
                  }
                ]}
                onPress={() => filterByCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedCategory && (
            <View style={[
              styles.sectionContainer,
              {
                borderTopLeftRadius: selectedCategoryIndex > 0 ? 20 : 0,
                marginTop: 0,
                borderWidth: 1,
                borderColor: '#E8F5E9',
              }
            ]}>
              <FlatList
                horizontal
                data={filteredRecipes}
                renderItem={({item}) => renderRecipeCard(item)}
                keyExtractor={(item) => item.id.toString()}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        <View style={styles.sectionContainer2}>
          <Text style={styles.sectionTitle2}>{t('bookmarked_recipes')}</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
            </View>
          ) : bookmarkedRecipes.length > 0 ? (
            <FlatList
              horizontal
              data={bookmarkedRecipes}
              renderItem={({item}) => renderRecipeCard2(item)}
              keyExtractor={(item) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyBookmarks}>
              <Ionicons name="bookmark-outline" size={40} color="#888" />
              <Text style={styles.emptyBookmarksText}>{t('no_bookmarked')}</Text>
            </View>
          )}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  dimmedContent: {
    opacity: 0.3,
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 15,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  searchWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    zIndex: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  suggestionsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginTop: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    maxHeight: 240,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  suggestionsList: {
    maxHeight: 240,
  },
  suggestionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 10,
    color: '#4CAF50',
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#F9F9F9',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  suggestionSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryWrapper: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
    zIndex: 1,
  },
  categoryButtonActive: {
    backgroundColor: '#E8F5E9',
    paddingBottom: 12,
    marginBottom: -1,
    elevation: 1, 
    shadowColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 20,
    zIndex: 0,
  },
  sectionContainer2: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'black',
  },
  sectionTitle2: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  recipeCard: {
    width: 172,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 2,
  },
  recipeCard2: {
    width: 192,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    elevation: 2,
  },
  recipeImage: {
    width: '100%',
    height: 120,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    paddingHorizontal: 10,
    color: '#333',
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
    marginTop: 5,
  },
  priceText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  dotSeparator: {
    fontSize: 14,
    color: '#999',
    marginHorizontal: 5,
  },
  cuisineText: {
    fontSize: 14,
    color: '#666',
    flexShrink: 1,
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBookmarks: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
  },
  emptyBookmarksText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    backgroundColor: '#FFF',
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

export default Home;