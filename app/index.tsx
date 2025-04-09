import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from './splash';
import SignIn from './signIn';
import Home from './home';
import Recipe from './recipe';
import NearbyStores from './nearbyStores';
import Profile from './profile';
import Location from './location';
import Translator from './translation';
import Translated from './translated';
import Favorites from './favorites';

import '../i18n'; 

const Stack = createStackNavigator();


const App = () => {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        component={Splash}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignIn}
        options={{
          title: 'Sign In',
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
        }}
      />
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Recipe"
        component={Recipe}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NearbyStores"
        component={NearbyStores}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Location"
        component={Location}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Translator"
        component={Translator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Translated"
        component={Translated}
        options={{ headerShown: false }}
        />
      <Stack.Screen
        name="Favorites"
        component={Favorites}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default App;