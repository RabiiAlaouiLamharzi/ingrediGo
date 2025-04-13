import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Modal } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const NearbyStores = ({ navigation, route }) => {
  const { selectedItems, ingredientData, recipe } = route.params;
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [viewMode, setViewMode] = useState('list');
  const [selectedStore, setSelectedStore] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [storeData, setStoreData] = useState([]);
  
  const getIngredientTranslation = (ingredientName) => {
    const ingredient = recipe.ingredients.find(ing => ing.name === ingredientName);
    return ingredient?.translation?.[lang] || ingredientName;
  };

  useEffect(() => {
    const processStoreData = () => {
      const allStores = new Set();
      recipe.ingredients.forEach(ingredient => {
        ingredient.stores.forEach(store => {
          allStores.add(store.name);
        });
      });

      const processedStores = Array.from(allStores).map(storeName => {
        const includedIngredients = selectedItems.filter(itemName => {
          const ingredient = recipe.ingredients.find(ing => ing.name === itemName);
          if (!ingredient) return false;
          const storeInfo = ingredient.stores.find(s => s.name === storeName);
          return storeInfo?.available || false;
        });

        const totalSelected = selectedItems.length;
        const availableCount = includedIngredients.length;
        const availabilityPercentage = Math.round((availableCount / totalSelected) * 100);

        return {
          id: storeName,
          name: storeName,
          distance: getRandomDistance(),
          dotColor: getDotColor(availabilityPercentage),
          ingredients: {
            includedIngredients,
            nonIncludedIngredients: selectedItems.filter(item => !includedIngredients.includes(item)),
            availabilityPercentage
          },
          ingredientsText: `${availableCount}/${totalSelected} ${t('ingredientsAvailable')}`
        };
      });

      processedStores.sort((a, b) => b.ingredients.availabilityPercentage - a.ingredients.availabilityPercentage);
      setStoreData(processedStores);
    };

    processStoreData();
  }, [selectedItems, recipe, lang, t]);

  const getRandomDistance = () => {
    const distances = {
      en: ['500 M', '700 M', '1.2 KM', '2.5 KM', '3 KM'],
      fr: ['500 M', '700 M', '1,2 KM', '2,5 KM', '3 KM'],
      zh: ['500米', '700米', '1.2公里', '2.5公里', '3公里']
    };
    return distances[lang][Math.floor(Math.random() * distances[lang].length)];
  };

  const getDotColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 50) return '#FFC107';
    return '#FF5722';
  };

  const openStoreDetails = (store) => {
    setSelectedStore(store);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStore(null);
  };

  const renderStoreDetailsModal = () => {
    if (!selectedStore) return null;
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.storeIconContainer}>
                <Text style={styles.modalStoreName}>{selectedStore.name}</Text>
              </View>
              <Text style={styles.modalDistance}>{selectedStore.distance}</Text>
            </View>
            
            <View style={styles.ingredientsSection}>
              <Text style={styles.ingredientsSectionTitle}>
                {t('recipe')}: {recipe?.name?.[lang] || recipe?.name?.en || 'Selected Ingredients'}
              </Text>
            </View>
            
            <View style={styles.ingredientsSection}>
              <Text style={styles.ingredientsSectionTitle}>{t('availableIngredients')}</Text>
              <View style={styles.ingredientsList}>
                {selectedStore.ingredients.includedIngredients.map((ingredientName, index) => {
                  const ingredient = recipe.ingredients.find(ing => ing.name === ingredientName);
                  const storeInfo = ingredient?.stores.find(s => s.name === selectedStore.name);
                  return (
                    <View key={`included-${index}`} style={styles.ingredientItem}>
                      <View style={styles.checkIcon}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      </View>
                      <Text style={styles.ingredientName}>
                        {getIngredientTranslation(ingredientName)}
                        {storeInfo?.aisle && ` (${t('aisle')}: ${storeInfo.aisle})`}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            
            {selectedStore.ingredients.nonIncludedIngredients.length > 0 && (
              <View style={styles.ingredientsSection}>
                <Text style={styles.ingredientsSectionTitle}>{t('unavailableIngredients')}</Text>
                <View style={styles.ingredientsList}>
                  {selectedStore.ingredients.nonIncludedIngredients.map((ingredientName, index) => (
                    <View key={`nonincluded-${index}`} style={styles.ingredientItem}>
                      <View style={styles.crossIcon}>
                        <Ionicons name="close-circle" size={20} color="#F44336" />
                      </View>
                      <Text style={styles.ingredientName}>{getIngredientTranslation(ingredientName)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Ionicons name="close" size={20} color="#777" />
                <Text style={styles.closeButtonText}>{t('close')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={() => {
                  closeModal();
                  navigation.navigate('Location', {
                    store: selectedStore,
                    recipe: recipe
                  });
                }}
              >
                <Ionicons name="checkmark" size={20} color="#22A45D" />
                <Text style={styles.confirmButtonText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderListView = () => (
    <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
      {storeData.map(store => (
        <TouchableOpacity 
          key={store.id} 
          style={styles.storeItem}
          onPress={() => openStoreDetails(store)}
        >
          <View style={styles.storeNameContainer}>
            <Text style={styles.storeName}>{store.name}</Text>
          </View>
          <View style={styles.storeDetailsContainer}>
            <Text style={styles.storeDistance}>{store.distance}</Text>
            <View style={styles.ingredientsContainer}>
              <View style={[styles.dot, { backgroundColor: store.dotColor }]} />
              <Text style={styles.storeIngredients}>{store.ingredientsText}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <Text style={styles.comingSoonText}>{t('Coming Soon')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nearbyStores')}</Text>
      </View>

      {viewMode === 'list' ? renderListView() : renderMapView()}
      {renderStoreDetailsModal()}

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'list' ? styles.activeToggle : styles.inactiveToggle,
          ]}
          onPress={() => setViewMode('list')}
        >
          <MaterialIcons name="format-list-bulleted" size={18} color={viewMode === 'list' ? '#4CAF50' : '#777'} />
          <Text style={[styles.toggleText, viewMode === 'list' ? styles.activeToggleText : null]}>
            {t('listView')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            viewMode === 'map' ? styles.activeToggle : styles.inactiveToggle,
          ]}
          onPress={() => setViewMode('map')}
        >
          <FontAwesome name="map-marker" size={18} color={viewMode === 'map' ? '#4CAF50' : '#777'} />
          <Text style={[styles.toggleText, viewMode === 'map' ? styles.activeToggleText : null]}>
            {t('mapView')}
          </Text>
        </TouchableOpacity>
      </View>

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
            <Text style={styles.tabLabel}>{t('favorites')}</Text>
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
  comingSoonText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
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
    paddingTop: 16,
  },
  storeItem: {
    backgroundColor: '#FBFBFB',
    borderRadius: 50,
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#9AA6B2',
  },
  storeNameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 27,
    fontWeight: '200',
  },
  storeDetailsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  storeDistance: {
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 4,
  },
  ingredientsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeIngredients: {
    fontSize: 12,
    color: '#555',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  mapContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  map: {
    flex: 1,
    borderRadius: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 36,
    backgroundColor: '#fff',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 100,
    width: '48%',
    marginHorizontal: 5,
  },
  activeToggle: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  inactiveToggle: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleText: {
    marginLeft: 8,
    color: '#777',
    fontSize: 18,
    fontWeight: '300',
  },
  activeToggleText: {
    color: '#4CAF50',
  },
  bottomSpacer: {
    height: 80,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingBottom: 15,
    overflow: 'hidden',
    opacity: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  storeLogoText: {
    fontWeight: 'bold',
    color: '#000',
  },
  modalStoreName: {
    fontSize: 30,
    fontWeight: '300',
  },
  modalDistance: {
    fontSize: 25,
    fontWeight: '200',
  },
  modalMap: {
    width: '100%',
    height: 170,
    paddingHorizontal: 30,
    paddingTop: 20,
    borderRadius: 12,
    marginBottom: 10,
  },
  ingredientsSection: {
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  ingredientsSectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
    fontWeight: 300,
    marginLeft: 10,
  },
  ingredientsList: {
    marginLeft: 10,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkIcon: {
    marginRight: 10,
  },
  crossIcon: {
    marginRight: 10,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: 300,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    padding: 15,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#AFAFAF',
  },
  closeButtonText: {
    color: '#777',
    marginLeft: 5,
    fontWeight: '300',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#22A45D'
  },
  confirmButtonText: {
    color: '#22A45D',
    marginLeft: 5,
    fontWeight: '300',
  },
});

export default NearbyStores;