import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  ScrollView, Modal, StatusBar, SafeAreaView, Alert, Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const Profile = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [myLanguage, setMyLanguage] = useState(i18n.language);
  const localLanguage = i18n.localLanguage ?? 'fr';
  const [userData, setUserData] = useState({
    name: '',
    profession: ''
  });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showReferencesModal, setShowReferencesModal] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedUserData = await AsyncStorage.getItem('userData');
        if (savedUserData) {
          const parsedData = JSON.parse(savedUserData);
          setUserData({
            name: parsedData.name,
            profession: parsedData.profession || 'University Student'
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      navigation.replace('SignIn');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const setLocalLanguage = (lang) => {
    i18n.localLanguage = lang ?? 'fr';
  };
  
  const [showMyLanguageDropdown, setShowMyLanguageDropdown] = useState(false);
  const [showLocalLanguageDropdown, setShowLocalLanguageDropdown] = useState(false);
  const [showDietaryDropdown, setShowDietaryDropdown] = useState(false);
  const [showAllergyDropdown, setShowAllergyDropdown] = useState(false);

  const [dietaryRestrictions, setDietaryRestrictions] = useState([
    { id: 1, value: 'Halal', color: '#6B2323' },
    { id: 2, value: 'Vegan', color: '#4B6D26' }
  ]);

  const [allergies, setAllergies] = useState([
    { id: 1, value: 'Nuts', color: '#1A237E' },
    { id: 2, value: 'Milk', color: '#7A4F21' }
  ]);

  const [dataLoaded, setDataLoaded] = useState(false);

  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'French', value: 'fr' },
    { label: 'Chinese', value: 'zh' }
  ];

  const dietaryOptions = useMemo(() => [
    { label: t('Halal'), value: 'Halal' },
    { label: t('Vegan'), value: 'Vegan' },
    { label: t('Gluten Free'), value: 'Gluten Free' },
    { label: t('Vegetarian'), value: 'Vegetarian' },
    { label: t('Kosher'), value: 'Kosher' },
    { label: t('Pescatarian'), value: 'Pescatarian' },
  ], [t]);

  const allergyOptions = useMemo(() => [
    { label: t('Nuts'), value: 'Nuts' },
    { label: t('Milk'), value: 'Milk' },
    { label: t('Fish_allergy'), value: 'Fish_allergy' },
    { label: t('Peanuts'), value: 'Peanuts' },
    { label: t('Shellfish'), value: 'Shellfish' },
    { label: t('Eggs'), value: 'Eggs' },
    { label: t('Soy'), value: 'Soy' },
    { label: t('Wheat'), value: 'Wheat' },
  ], [t]);

  const getRandomColor = () => {
    const colors = ['#6B2323', '#4B6D26', '#1A237E', '#7A4F21', '#880E4F', '#4A148C', '#1B5E20', '#BF360C', '#006064'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    if (typeof i18n.localLanguage === 'undefined') {
    i18n.localLanguage = 'fr';
  }
    const loadData = async () => {
      const savedDietary = await AsyncStorage.getItem('dietaryRestrictions');
      const savedAllergies = await AsyncStorage.getItem('allergies');
      if (savedDietary) setDietaryRestrictions(JSON.parse(savedDietary));
      if (savedAllergies) setAllergies(JSON.parse(savedAllergies));
      setDataLoaded(true);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (dataLoaded) {
      AsyncStorage.setItem('dietaryRestrictions', JSON.stringify(dietaryRestrictions));
    }
  }, [dietaryRestrictions]);

  useEffect(() => {
    if (dataLoaded) {
      AsyncStorage.setItem('allergies', JSON.stringify(allergies));
    }
  }, [allergies]);

  const addTag = (type, value) => {
    const tag = { id: Date.now(), value, color: getRandomColor() };
    if (type === 'dietary') {
      if (!dietaryRestrictions.some(item => item.value === value)) {
        setDietaryRestrictions([...dietaryRestrictions, tag]);
      }
      setShowDietaryDropdown(false);
    } else {
      if (!allergies.some(item => item.value === value)) {
        setAllergies([...allergies, tag]);
      }
      setShowAllergyDropdown(false);
    }
  };

  const removeTag = (type, id) => {
    if (type === 'dietary') {
      setDietaryRestrictions(dietaryRestrictions.filter(item => item.id !== id));
    } else {
      setAllergies(allergies.filter(item => item.id !== id));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
        </View>

        <View style={styles.profileHeader}>
          <Image source={require('../assets/images/students.jpg')} style={styles.profileImage} />
          <View style={styles.profileLogout}>
            <Text style={styles.profileName}>{userData.name || 'Guest User'}</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('SignIn')}
            >
              <Ionicons name="log-out-outline" size={32} color="#333" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileSubtitle}>{userData.profession}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('MyLanguage')}</Text>
        <TouchableOpacity style={styles.dropdownContainer} onPress={() => setShowMyLanguageDropdown(true)}>
          <Text style={styles.dropdownText}>{languageOptions.find(opt => opt.value === myLanguage)?.label}</Text>
          <Ionicons name="chevron-down" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('LocalLanguage')}</Text>
        <TouchableOpacity style={styles.dropdownContainer} onPress={() => setShowLocalLanguageDropdown(true)}>
          <Text style={styles.dropdownText}>{languageOptions.find(opt => opt.value === localLanguage)?.label}</Text>
          <Ionicons name="chevron-down" size={24} color="#333" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('Dietary Restrictions')}</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.tagRow}>
            {dietaryRestrictions.map(item => (
              <View key={item.id} style={[styles.tag, { backgroundColor: item.color }]}>
                <Text style={styles.tagText}>{t(item.value)}</Text>
                <TouchableOpacity onPress={() => removeTag('dietary', item.id)}>
                  <Ionicons name="close" size={16} color="white" style={styles.tagIcon} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addIconContainer} onPress={() => setShowDietaryDropdown(true)}>
            <Ionicons name="add-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>{t('Allergies')}</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.tagRow}>
            {allergies.map(item => (
              <View key={item.id} style={[styles.tag, { backgroundColor: item.color }]}>
                <Text style={styles.tagText}>{t(item.value)}</Text>
                <TouchableOpacity onPress={() => removeTag('allergy', item.id)}>
                  <Ionicons name="close" size={16} color="white" style={styles.tagIcon} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addIconContainer} onPress={() => setShowAllergyDropdown(true)}>
            <Ionicons name="add-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.dropdownContainer, { marginTop: 12, backgroundColor: '#00796B' }]}
        onPress={() => setShowReferencesModal(true)}>
            <Text style={[styles.dropdownText, { color: 'white', fontWeight: 'bold' }]}>t('View References')</Text>
        </TouchableOpacity>
        <Modal transparent visible={showReferencesModal} animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent]}>
            <Text style={styles.dropdownText}>References Used</Text>
            <Text style={styles.modalBody}>
            {'\n'}• <Text style={{ fontWeight: 'bold' }}>NUMBEO </Text>– for price comparisons.{'\n'}
  • <Text style={{ fontWeight: 'bold' }}>ChatGPT</Text> – to generate descriptions of recipes and identify main ingredients required to cook them.{'\n'}
  • <Text style={{ fontWeight: 'bold' }}>Expatica France </Text>– for cultural context and general information about food and grocery habits in France.{'\n'}
  • <Text style={{ fontWeight: 'bold' }}>Statista</Text> – for food availability trends.{'\n'}
  • <Text style={{ fontWeight: 'bold' }}>Supermarket Availability</Text> – ingredient availability is determined through a combination of methods:{'\n'}
  {'\t'}1. Visiting supermarkets and speaking with staff about inventory trends.{'\n'}
  {'\t'}2. Tracking product availability through the official websites of French supermarkets or third-party stock tracking platforms.
            </Text>
            <TouchableOpacity
                onPress={() => setShowReferencesModal(false)}
                style={[styles.dropdownContainer, { marginTop: 20, backgroundColor: '#00796B' }]}
            >
                <Text style={[styles.dropdownText, { color: 'white', fontWeight: 'bold' }]}>Close</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
        <TouchableOpacity
        onPress={() => Linking.openURL('https://docs.google.com/forms/d/e/1FAIpQLSeJLoPP5A01VXLbYA6Jv41RQswvjDZBa6c0mx6vmqwHGI4Anw/viewform?usp=sharing')}
        style={[styles.dropdownContainer, { backgroundColor: '#880E4F', marginTop: 12 }]}
        >
        <Text style={[styles.dropdownText, { color: 'white', fontWeight: 'bold' }]}>
            t('Submit Feedback & Recipes')
        </Text>
        </TouchableOpacity>


        <View style={styles.bottomPadding} />
        
      </ScrollView>

      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>{t('home')}</Text>
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
          <Ionicons name="person" size={24} color="#4CAF50" />
          <Text style={[styles.tabLabel, styles.activeTab]}>{t('profile')}</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={showMyLanguageDropdown} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowMyLanguageDropdown(false)}>
          <View style={[styles.languageDropdown, { top: 220 }]}>
            {languageOptions.map(({ label, value }) => (
              <TouchableOpacity key={value} style={styles.languageOption}
                onPress={() => {
                  setMyLanguage(value);
                  i18n.changeLanguage(value);
                  setShowMyLanguageDropdown(false);
                }}>
                <Text style={styles.languageOptionText}>{label}</Text>
                {value === myLanguage && <Ionicons name="checkmark" size={24} color="#4CAF50" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={showLocalLanguageDropdown} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowLocalLanguageDropdown(false)}>
          <View style={[styles.languageDropdown, { top: 300 }]}>
            {languageOptions.map(({ label, value }) => (
              <TouchableOpacity key={value} style={styles.languageOption}
                onPress={() => {
                  setLocalLanguage(value);
                  setShowLocalLanguageDropdown(false);
                }}>
                <Text style={styles.languageOptionText}>{label}</Text>
                {value === localLanguage && <Ionicons name="checkmark" size={24} color="#4CAF50" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={showDietaryDropdown} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowDietaryDropdown(false)}>
          <ScrollView style={styles.optionsDropdown}>
            {dietaryOptions.map(option => (
              <TouchableOpacity key={option.value} style={styles.optionItem}
                onPress={() => addTag('dietary', option.value)}>
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={showAllergyDropdown} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowAllergyDropdown(false)}>
          <ScrollView style={styles.optionsDropdown}>
            {allergyOptions.map(option => (
              <TouchableOpacity key={option.value} style={styles.optionItem}
                onPress={() => addTag('allergy', option.value)}>
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, backgroundColor: '#FFF' },
  profileHeader: { alignItems: 'center', paddingTop: 20, paddingBottom: 10 },
  profileImage: { width: '100%', height: 180, marginBottom: 20 },
  profileName: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  profileSubtitle: { fontSize: 16, color: '#777', textAlign: 'center', lineHeight: 22 },
  sectionTitle: { fontSize: 16, color: '#666', paddingHorizontal: 45, marginTop: 12, marginBottom: 6 },
  dropdownContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 15, marginHorizontal: 25,
    borderRadius: 30, borderWidth: 1, borderColor: '#AFAFAF', backgroundColor: '#FBFBFB',
  },
  dropdownText: { fontSize: 18, color: '#868686' },
  tagsContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 5, marginHorizontal: 25,
    borderRadius: 30, borderWidth: 1, borderColor: '#AFAFAF', backgroundColor: '#FBFBFB',
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 },
  tag: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6, paddingHorizontal: 15, borderRadius: 20,
    marginRight: 10, marginBottom: 10,
  },
  tagText: { color: 'white', fontSize: 16 },
  tagIcon: { marginLeft: 8 },
  addIconContainer: { paddingLeft: 10 },
  bottomPadding: { height: 80 },
  tabBar: {
    flexDirection: 'row', height: 60, backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#E0E0E0',
  },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabLabel: { fontSize: 12, color: '#999', marginTop: 2 },
  activeTab: { color: '#4CAF50' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  languageDropdown: {
    position: 'absolute',
    left: 25,
    right: 25,
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingVertical: 10,
    zIndex: 100,
  },
  languageOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15 },
  languageOptionText: { fontSize: 18 },
  optionsDropdown: { marginHorizontal: 25, maxHeight: 300, backgroundColor: 'white', borderRadius: 20 },
  optionItem: { padding: 16 },
  optionText: { fontSize: 18 },
  profileLogout: { flexDirection: 'row', gap: 7 },
  modalContent: {
    marginHorizontal: 25,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 16,
    color: '#555',
    textAlign: 'left',
    lineHeight: 24,
  },
  
});

export default Profile;
