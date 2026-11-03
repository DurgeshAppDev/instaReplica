import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LoginScreen from '../screens/LoginScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { AuthContext } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Search Tab (allows navigating from Search Screen -> User's Profile Screen)
const SearchStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTintColor: '#000000',
      headerTitleStyle: { fontWeight: '700', fontSize: 16 },
    }}>
    <Stack.Screen
      name="SearchMain"
      component={SearchScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="UserProfile"
      component={ProfileScreen}
      options={({ route }) => ({
        title: route.params?.username ? `@${route.params.username}` : 'Profile',
        headerBackTitleVisible: false,
      })}
    />
  </Stack.Navigator>
);

// Stack for Profile Tab (allows navigating from Own Profile -> Edit Profile)
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTintColor: '#000000',
      headerTitleStyle: { fontWeight: '700', fontSize: 16 },
    }}>
    <Stack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile', headerBackTitleVisible: false }}
    />
  </Stack.Navigator>
);

const renderTabBarIcon = (routeName, focused, color) => {
  let iconName;
  if (routeName === 'SearchTab') {
    iconName = focused ? 'search' : 'search-outline';
  } else if (routeName === 'ProfileTab') {
    iconName = focused ? 'person-circle' : 'person-circle-outline';
  }
  return <Ionicons name={iconName} size={28} color={color} />;
};

const AppNavigator = () => {
  const { user, needsProfileSetup } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  // If not logged in, show Login Screen
  if (!user) {
    return <LoginScreen />;
  }

  // If user just logged in and needs profile setup / onboarding, show ProfileSetupScreen
  if (needsProfileSetup) {
    return <ProfileSetupScreen />;
  }

  // Main App with Tabs
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#8E8E8E',
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 52 + (insets.bottom > 0 ? insets.bottom : 8),
          borderTopWidth: 0.5,
          borderTopColor: '#DBDBDB',
          backgroundColor: '#FFFFFF',
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
        tabBarIcon: ({ focused, color }) => renderTabBarIcon(route.name, focused, color),
      })}>
      <Tab.Screen
        name="SearchTab"
        component={SearchStack}
        options={{ title: 'Search' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
