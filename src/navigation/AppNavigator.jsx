import React, { useContext } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
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

const HeaderRightMenu = () => (
  <TouchableOpacity style={styles.headerRightMenuBtn}>
    <Ionicons name="ellipsis-horizontal" size={20} color="#000" />
  </TouchableOpacity>
);

// Stack for Search Tab
const SearchStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTintColor: '#000000',
      headerTitleStyle: { fontWeight: '700', fontSize: 16 },
      headerShadowVisible: false,
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
        headerRight: HeaderRightMenu,
      })}
    />
  </Stack.Navigator>
);

// Stack for Profile Tab
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTintColor: '#000000',
      headerTitleStyle: { fontWeight: '700', fontSize: 16 },
      headerShadowVisible: false,
    }}>
    <Stack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const renderCustomTabIcon = (routeName, focused, userAvatar) => {
  if (routeName === 'SearchTab') {
    return (
      <Ionicons
        name={focused ? 'search' : 'search-outline'}
        size={27}
        color={focused ? '#000000' : '#262626'}
      />
    );
  } else if (routeName === 'ProfileTab') {
    return (
      <View
        style={[
          styles.tabAvatarWrapper,
          focused && styles.tabAvatarActiveWrapper,
        ]}>
        <Image
          source={{
            uri:
              userAvatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
          }}
          style={styles.tabAvatar}
        />
      </View>
    );
  }
  return null;
};

const AppNavigator = () => {
  const { user, needsProfileSetup } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  if (!user) {
    return <LoginScreen />;
  }

  if (needsProfileSetup) {
    return <ProfileSetupScreen />;
  }

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
        tabBarIcon: ({ focused }) =>
          renderCustomTabIcon(route.name, focused, user?.avatar_url),
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

const styles = StyleSheet.create({
  headerRightMenuBtn: {
    padding: 6,
    marginRight: 2,
  },
  tabAvatarWrapper: {
    padding: 1.5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tabAvatarActiveWrapper: {
    borderColor: '#000000',
  },
  tabAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EAEAEA',
  },
});

export default AppNavigator;
