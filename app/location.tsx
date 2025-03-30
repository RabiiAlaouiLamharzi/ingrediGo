import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Location = ({ navigation }) => {
  const [storeData, setStoreData] = useState([
    { 
      id: '1',
      name: 'Cod', 
      translation: 'Morue', 
      category: 'Fish', 
      location: 'A22',
      dish: 'Fish & Chips',
      isFavorite: false
    },
    { 
      id: '2',
      name: 'Potato', 
      translation: 'Pomme de Terre', 
      category: 'Fresh', 
      location: 'B30',
      dish: 'Fish & Chips',
      isFavorite: true
    },
    { 
      id: '3',
      name: 'Flour', 
      translation: 'Farine', 
      category: 'Baking', 
      location: 'C21',
      dish: 'Fish & Chips',
      isFavorite: false
    },
    { 
      id: '4',
      name: 'Eggs', 
      translation: 'Œuf', 
      category: 'Dairy', 
      location: 'C23',
      dish: 'Fish & Chips',
      isFavorite: false
    },
    { 
      id: '5',
      name: 'Milk', 
      translation: 'Lait', 
      category: 'Dairy', 
      location: 'D10',
      dish: 'Fish & Chips',
      isFavorite: true
    }
  ]);

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Dairy':
        return '#FF6174';
      case 'Baking':
        return '#7F500B';
      case 'Fresh':
        return '#3B6313';
      case 'Fish':
        return '#1378BA';
      default:
        return '#3B6313';
    }
  };

  const toggleFavorite = (id) => {
    setStoreData(storeData.map(store => 
      store.id === id ? {...store, isFavorite: !store.isFavorite} : store
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location</Text>
      </View>

      <ScrollView 
        style={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        >
        <View style={styles.textContainer0}>
            <Text style={styles.dishName}>Fish & Chips</Text>  
            <Image 
            source={require('../assets/images/lidl.png')} 
            style={styles.logo} 
            resizeMode="contain"
            />
        </View>

        {storeData.map(store => (
            <View key={store.id} style={styles.itemCardTop}>
            <View style={styles.itemCard}>
                <View style={styles.textContainer}>
                <Text style={styles.itemName}>{store.name}</Text>
                <Text style={styles.itemTranslation}>{store.translation}</Text>
                </View>
                
                <TouchableOpacity 
                style={styles.heartButton}
                onPress={() => toggleFavorite(store.id)}
                >
                <Ionicons 
                    name={store.isFavorite ? "heart" : "heart-outline"} 
                    size={30} 
                    color={store.isFavorite ? "red" : "black"} 
                />
                </TouchableOpacity>
            </View>

            <View style={styles.textContainer2}>
                <Text style={[styles.itemCategory, { backgroundColor: getCategoryColor(store.category) }]}>
                {store.category}
                </Text>
                <Text style={styles.itemLocation}>{store.location}</Text>
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
          <Text style={[styles.tabLabel, styles.activeTab]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Translator')}
        >
          <Ionicons name="camera-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>Translator</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Favorites')}
        >
          <Ionicons name="heart-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>Favorites</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => navigation.navigate('Profile')}
        >
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
    flex: 0.70,
  },
  textContainer2: {
    flexDirection: 'column',
    flex: 0.85,
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 27,
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
    borderRadius: 100
  },
});

export default Location;