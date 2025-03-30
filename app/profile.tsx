import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Profile = ({ navigation }) => {
  const [myLanguage, setMyLanguage] = useState('English');
  const [localLanguage, setLocalLanguage] = useState('French');
  
  const [showMyLanguageDropdown, setShowMyLanguageDropdown] = useState(false);
  const [showLocalLanguageDropdown, setShowLocalLanguageDropdown] = useState(false);
  const [showDietaryDropdown, setShowDietaryDropdown] = useState(false);
  const [showAllergyDropdown, setShowAllergyDropdown] = useState(false);
  
  const [dietaryRestrictions, setDietaryRestrictions] = useState([
    { id: 1, name: 'Halal', color: '#6B2323' },
    { id: 2, name: 'Vegan', color: '#4B6D26' }
  ]);
  
  const [allergies, setAllergies] = useState([
    { id: 1, name: 'Nuts', color: '#1A237E' },
    { id: 2, name: 'Milk', color: '#7A4F21' }
  ]);
  
  const languageOptions = ['English', 'French', 'Chinese'];
  
  const dietaryOptions = ['Halal', 'Vegan', 'Gluten Free', 'Vegetarian', 'Kosher', 'Pescatarian'];
  
  const allergyOptions = ['Nuts', 'Milk', 'Fish', 'Peanuts', 'Shellfish', 'Eggs', 'Soy', 'Wheat'];
  
  const getRandomColor = () => {
    const colors = ['#6B2323', '#4B6D26', '#1A237E', '#7A4F21', '#880E4F', '#4A148C', '#1B5E20', '#BF360C', '#006064'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  const addDietaryRestriction = (item) => {
    if (!dietaryRestrictions.some(restriction => restriction.name === item)) {
      const newItem = {
        id: Date.now(),
        name: item,
        color: getRandomColor()
      };
      setDietaryRestrictions([...dietaryRestrictions, newItem]);
    }
    setShowDietaryDropdown(false);
  };
  
  const addAllergy = (item) => {
    if (!allergies.some(allergy => allergy.name === item)) {
      const newItem = {
        id: Date.now(),
        name: item,
        color: getRandomColor()
      };
      setAllergies([...allergies, newItem]);
    }
    setShowAllergyDropdown(false);
  };
  
  const removeDietaryRestriction = (id) => {
    setDietaryRestrictions(dietaryRestrictions.filter(item => item.id !== id));
  };
  
  const removeAllergy = (id) => {
    setAllergies(allergies.filter(item => item.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <View style={styles.profileHeader}>
          <Image 
            source={require('../assets/images/asian-woman.png')} 
            style={styles.profileImage} 
          />
          <Text style={styles.profileName}>Dory Jin</Text>
          <Text style={styles.profileSubtitle}>Student at Université{'\n'}Paris-Saclay</Text>
        </View>

        <Text style={styles.sectionTitle}>My Language</Text>
        <TouchableOpacity 
          style={styles.dropdownContainer}
          onPress={() => setShowMyLanguageDropdown(true)}
        >
          <Text style={styles.dropdownText}>{myLanguage}</Text>
          <Ionicons name="chevron-down" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Local Language</Text>
        <TouchableOpacity 
          style={styles.dropdownContainer}
          onPress={() => setShowLocalLanguageDropdown(true)}
        >
          <Text style={styles.dropdownText}>{localLanguage}</Text>
          <Ionicons name="chevron-down" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.tagRow}>
            {dietaryRestrictions.map(item => (
              <View key={item.id} style={[styles.tag, { backgroundColor: item.color }]}>
                <Text style={styles.tagText}>{item.name}</Text>
                <TouchableOpacity onPress={() => removeDietaryRestriction(item.id)}>
                  <Ionicons name="close" size={16} color="white" style={styles.tagIcon} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addIconContainer} onPress={() => setShowDietaryDropdown(true)}>
            <Ionicons name="add-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Allergies</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.tagRow}>
            {allergies.map(item => (
              <View key={item.id} style={[styles.tag, { backgroundColor: item.color }]}>
                <Text style={styles.tagText}>{item.name}</Text>
                <TouchableOpacity onPress={() => removeAllergy(item.id)}>
                  <Ionicons name="close" size={16} color="white" style={styles.tagIcon} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addIconContainer} onPress={() => setShowAllergyDropdown(true)}>
            <Ionicons name="add-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
            <Ionicons name="home-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>Home</Text>
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
            <Ionicons name="person" size={24} color="#4CAF50" />
            <Text style={[styles.tabLabel, styles.activeTab]}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showMyLanguageDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMyLanguageDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMyLanguageDropdown(false)}
        >
          <View style={styles.languageDropdown}>
            {languageOptions.map((language, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.languageOption,
                  index !== languageOptions.length - 1 && styles.languageOptionBorder,
                  language === myLanguage && styles.languageOptionSelected
                ]}
                onPress={() => {
                  setMyLanguage(language);
                  setShowMyLanguageDropdown(false);
                }}
              >
                <Text style={styles.languageOptionText}>{language}</Text>
                {language === myLanguage && (
                  <Ionicons name="checkmark" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showLocalLanguageDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocalLanguageDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocalLanguageDropdown(false)}
        >
          <View style={styles.languageDropdown}>
            {languageOptions.map((language, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.languageOption,
                  index !== languageOptions.length - 1 && styles.languageOptionBorder,
                  language === localLanguage && styles.languageOptionSelected
                ]}
                onPress={() => {
                  setLocalLanguage(language);
                  setShowLocalLanguageDropdown(false);
                }}
              >
                <Text style={styles.languageOptionText}>{language}</Text>
                {language === localLanguage && (
                  <Ionicons name="checkmark" size={24} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showDietaryDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDietaryDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDietaryDropdown(false)}
        >
          <View style={styles.optionsDropdown}>
            <ScrollView>
              {dietaryOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    index !== dietaryOptions.length - 1 && styles.optionItemBorder
                  ]}
                  onPress={() => addDietaryRestriction(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showAllergyDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAllergyDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAllergyDropdown(false)}
        >
          <View style={styles.optionsDropdown}>
            <ScrollView>
              {allergyOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    index !== allergyOptions.length - 1 && styles.optionItemBorder
                  ]}
                  onPress={() => addAllergy(option)}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, 
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  profileImage: {
    width: '100%',
    height: 180,
    marginBottom: 20,
  },
  profileName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000000',
  },
  profileSubtitle: {
    fontSize: 18,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666666',
    paddingHorizontal: 45,
    marginTop: 12,
    marginBottom: 6,
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 25,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#AFAFAF',
    backgroundColor: '#FBFBFB',
  },
  dropdownText: {
    fontSize: 18,
    color: '#868686',
  },
  tagsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 30,
    borderWidth: 1,
    marginHorizontal: 25,
    borderColor: '#AFAFAF',
    backgroundColor: '#FBFBFB',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    color: 'white',
    fontSize: 16,
  },
  tagIcon: {
    marginLeft: 8,
  },
  addIconContainer: {
    paddingLeft: 10,
    paddingRight: 0,
    paddingVertical: 5,
    marginLeft: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
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
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  languageDropdown: {
    marginHorizontal: 25,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  languageOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  languageOptionSelected: {
    backgroundColor: '#F5F5F5',
  },
  languageOptionText: {
    fontSize: 18,
    color: '#333',
  },
  optionsDropdown: {
    marginHorizontal: 25,
    maxHeight: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 18,
    color: '#333',
  },
});

export default Profile;