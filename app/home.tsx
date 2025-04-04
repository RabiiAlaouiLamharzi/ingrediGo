import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  TextInput, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import recipeData from '../data/data.json';

const Home = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState({ recipes: [], ingredients: [] });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);

  // Initialize data
  useEffect(() => {
    const categories = [...new Set(recipeData.recipes.map(recipe => recipe.category.en))];
    if (categories.length > 0) {
      setSelectedCategory(categories[0]);
      filterByCategory(categories[0]);
    }
    updateBookmarkedRecipes();
  }, []);

  // Update bookmarked recipes whenever recipeData changes
  const updateBookmarkedRecipes = () => {
    const bookmarked = recipeData.recipes.filter(recipe => recipe.bookmarked);
    setBookmarkedRecipes(bookmarked);
  };

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
        recipe.name.en.toLowerCase().includes(query.toLowerCase())
      );
      
      const allIngredients = recipeData.recipes.flatMap(recipe => recipe.ingredients);
      const uniqueIngredients = Array.from(new Set(allIngredients.map(i => i.name)))
        .map(name => allIngredients.find(i => i.name === name));
      
      const ingredientMatches = uniqueIngredients.filter(ingredient => 
        ingredient.name.toLowerCase().includes(query.toLowerCase())
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
    setSelectedCategory(category);
    setFilteredRecipes(recipeData.recipes.filter(recipe => 
      recipe.category.en === category
    ));
  };

  const handleSuggestionPress = (item, isIngredient) => {
    if (isIngredient) {
      navigation.navigate('Recipe', { 
        ingredient: item,
        recipe: null
      });
    } else {
      navigation.navigate('Recipe', { recipe: item });
    }
  };

  const renderSuggestionItem = ({ item, section }) => (
    <TouchableOpacity 
      style={styles.suggestionItem} 
      onPress={() => handleSuggestionPress(item, section.key === 'ingredients')}
    >
      <Text style={styles.suggestionText}>
        {section.key === 'recipes' ? item.name.en : item.name}
      </Text>
      {section.key === 'ingredients' && (
        <Text style={styles.suggestionSubtext}>
          Found in {recipeData.recipes.filter(r => 
            r.ingredients.some(i => i.name === item.name)
          ).length} recipes
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderRecipeCard = (recipe) => (
    <TouchableOpacity 
      key={recipe.id}
      style={styles.recipeCard}
      onPress={() => navigation.navigate('Recipe', { recipe })}
    >
      <Image 
        source={{ uri: recipe.images?.main }} 
        style={styles.recipeImage}
        defaultSource={require('../assets/images/background.png')}
      />
      <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.name.en}</Text>
      <View style={styles.recipeDetails}>
        <Text style={styles.priceText}>€{calculateAveragePrice(recipe)}</Text>
        <Text style={styles.dotSeparator}>•</Text>
        <Text style={styles.cuisineText} numberOfLines={1}>{recipe.category.en}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecipeCard2 = (recipe) => (
    <TouchableOpacity 
      key={recipe.id}
      style={styles.recipeCard2}
      onPress={() => navigation.navigate('Recipe', { recipe })}
    >
      <Image 
        source={{ uri: recipe.images?.main }} 
        style={styles.recipeImage}
        defaultSource={require('../assets/images/background.png')}
      />
      <Text style={styles.recipeTitle} numberOfLines={1}>{recipe.name.en}</Text>
      <View style={styles.recipeDetails}>
        <Text style={styles.priceText}>€{calculateAveragePrice(recipe)}</Text>
        <Text style={styles.dotSeparator}>•</Text>
        <Text style={styles.cuisineText} numberOfLines={1}>{recipe.category.en}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <Text style={styles.appName}>IngrediGO</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for recipes or ingredients..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />
        </View>

        {/* Search Suggestions */}
        {isSearchFocused && (suggestions.recipes.length > 0 || suggestions.ingredients.length > 0) && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={[
                { key: 'recipes', data: suggestions.recipes },
                { key: 'ingredients', data: suggestions.ingredients }
              ]}
              renderItem={({ item: section }) => (
                <View>
                  <Text style={styles.suggestionHeader}>
                    {section.key === 'recipes' ? 'Recipes' : 'Ingredients'}
                  </Text>
                  <FlatList
                    data={section.data}
                    renderItem={({ item }) => renderSuggestionItem({ item, section })}
                    keyExtractor={(item) => section.key === 'recipes' ? item.id.toString() : item.name}
                  />
                </View>
              )}
              keyExtractor={(item) => item.key}
            />
          </View>
        )}

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {[...new Set(recipeData.recipes.map(recipe => recipe.category.en))].map((category) => (
            <TouchableOpacity 
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
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

        {/* Category Recipes */}
        {selectedCategory && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{selectedCategory} Recipes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filteredRecipes.map(renderRecipeCard)}
            </ScrollView>
          </View>
        )}

        {/* Bookmarked Recipes */}
        <View style={styles.sectionContainer2}>
          <Text style={styles.sectionTitle2}>Bookmarked Recipes</Text>
          {bookmarkedRecipes.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {bookmarkedRecipes.map(renderRecipeCard2)}
            </ScrollView>
          ) : (
            <View style={styles.emptyBookmarks}>
              <Ionicons name="bookmark-outline" size={40} color="#888" />
              <Text style={styles.emptyBookmarksText}>No bookmarked recipes yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#4CAF50" />
          <Text style={[styles.tabLabel, styles.activeTab]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Translator')}>
          <Ionicons name="camera-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>Translator</Text>
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
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 15,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
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
  suggestionsContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: -10,
    maxHeight: 300,
    backgroundColor: '#FFF',
    borderRadius: 10,
    elevation: 3,
    padding: 10,
  },
  suggestionHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 5,
    color: '#4CAF50',
  },
  suggestionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
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
  categoriesContainer: {
    marginBottom: 20,
    paddingLeft: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
  },
  categoryButtonActive: {
    backgroundColor: '#E8F5E9',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#4CAF50',
  },
  sectionContainer: {
    marginBottom: 25,
    marginHorizontal: 20,
    backgroundColor: '#E9F6EF',
    padding: 20,
    borderRadius: 15
  },
  sectionContainer2: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#22A45D',
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