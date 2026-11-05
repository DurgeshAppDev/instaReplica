import React, { createContext, useState } from 'react';
import {
  loginUserApi,
  registerUserApi,
  getUserProfile,
  updateUserProfile,
  uploadAvatarApi,
} from '../api/userApi';
import { Alert } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);

  /**
   * Log In with existing username and password from MySQL / phpMyAdmin
   */
  const loginUser = async (username, password) => {
    setLoading(true);
    try {
      const res = await loginUserApi(username, password);
      if (res && res.status === 'success' && res.user) {
        setUser(res.user);
        // Prompt profile setup/review on login
        setNeedsProfileSetup(true);
        return { success: true, user: res.user };
      } else {
        const errorMsg = res?.message || 'Login failed. Please check your credentials.';
        Alert.alert('Login Notice', errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert(
        'Server Connection Failed',
        'Could not reach the PHP backend. Please check your XAMPP connection.'
      );
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user in phpMyAdmin
   */
  const registerUser = async ({ username, password, fullName, email }) => {
    setLoading(true);
    try {
      const res = await registerUserApi({ username, password, fullName, email });
      if (res && res.status === 'success' && res.user) {
        setUser(res.user);
        setNeedsProfileSetup(true);
        Alert.alert('Registration Successful', 'Welcome to Instagram! Please personalize your profile.');
        return { success: true, user: res.user };
      } else {
        const errorMsg = res?.message || 'Registration failed.';
        Alert.alert('Registration Notice', errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert(
        'Server Connection Failed',
        'Could not reach the PHP backend. Please check your XAMPP server.'
      );
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload image from mobile device directly to backend server
   */
  const uploadProfilePhoto = async (imageBase64) => {
    if (!user?.id) return null;
    try {
      const res = await uploadAvatarApi(user.id, imageBase64);
      if (res && res.status === 'success' && res.avatar_url) {
        setUser((prev) => ({ ...prev, avatar_url: res.avatar_url }));
        return res.avatar_url;
      }
    } catch (err) {
      console.error('Upload photo error:', err);
    }
    return null;
  };

  /**
   * Immediately keep logged in user's following count synchronized
   */
  const updateFollowingCount = (newCount) => {
    setUser((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        following_count: typeof newCount === 'number' ? newCount : Math.max(0, (prev.following_count || 0) + 1),
      };
    });
  };

  /**
   * Save professional profile input data to phpMyAdmin MySQL
   */
  const saveProfileData = async ({
    username,
    fullName,
    bio,
    avatarUrl,
    website,
    gender,
    category,
  }) => {
    if (!user) return { success: false, message: 'No active user' };
    setLoading(true);
    try {
      const res = await updateUserProfile(
        user.id,
        fullName || user.full_name,
        bio !== undefined ? bio : user.bio,
        avatarUrl || user.avatar_url,
        username || user.username,
        website !== undefined ? website : user.website,
        gender !== undefined ? gender : user.gender,
        category !== undefined ? category : user.category
      );

      if (res && res.status === 'success' && res.user) {
        setUser(res.user);
        setNeedsProfileSetup(false);
        return { success: true, user: res.user };
      } else {
        const errorMsg = res?.message || 'Update failed.';
        Alert.alert('Error', errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      console.error('Update profile error:', err);
      Alert.alert('Error', 'Unable to save profile to database.');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const skipProfileSetup = () => {
    setNeedsProfileSetup(false);
  };

  const refreshCurrentUser = async () => {
    if (!user?.id) return;
    try {
      const res = await getUserProfile(user.id, user.id);
      if (res && res.status === 'success' && res.data) {
        setUser(res.data);
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  const logoutUser = () => {
    setUser(null);
    setNeedsProfileSetup(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        needsProfileSetup,
        setNeedsProfileSetup,
        loginUser,
        registerUser,
        uploadProfilePhoto,
        updateFollowingCount,
        saveProfileData,
        skipProfileSetup,
        refreshCurrentUser,
        logoutUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};
