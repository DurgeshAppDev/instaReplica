import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import { DEFAULT_AVATARS } from '../constants/config';

const CATEGORIES = [
  'Personal',
  'Developer / Tech',
  'Creator / Influencer',
  'Artist / Designer',
  'Business / Brand',
  'Fitness / Health',
  'Photography',
];

const GENDERS = ['Prefer not to say', 'Male', 'Female', 'Custom'];

const ProfileSetupScreen = () => {
  const { user, saveProfileData, uploadProfilePhoto, skipProfileSetup, loading } =
    useContext(AuthContext);

  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [category, setCategory] = useState(user?.category || 'Personal');
  const [gender, setGender] = useState(user?.gender || 'Prefer not to say');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar_url || DEFAULT_AVATARS[0]
  );

  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setWebsite(user.website || '');
      setCategory(user.category || 'Personal');
      setGender(user.gender || 'Prefer not to say');
      setEmail(user.email || '');
      setAvatarUrl(user.avatar_url || DEFAULT_AVATARS[0]);
    }
  }, [user]);

  /**
   * Mobile device image picker: Gallery
   */
  const handlePickFromGallery = async () => {
    setPhotoModalVisible(false);
    try {
      const response = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (!response.didCancel && response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setUploadingPhoto(true);
        if (asset.base64) {
          const base64Uri = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
          setAvatarUrl(base64Uri);
          const uploadedUrl = await uploadProfilePhoto(base64Uri);
          if (uploadedUrl) {
            setAvatarUrl(uploadedUrl);
          }
        } else if (asset.uri) {
          setAvatarUrl(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Image picker error:', err);
      Alert.alert('Notice', 'Could not open mobile gallery.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  /**
   * Mobile device camera capture
   */
  const handleTakeCameraPhoto = async () => {
    setPhotoModalVisible(false);
    try {
      const response = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: true,
        maxWidth: 800,
        maxHeight: 800,
      });

      if (!response.didCancel && response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        setUploadingPhoto(true);
        if (asset.base64) {
          const base64Uri = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
          setAvatarUrl(base64Uri);
          const uploadedUrl = await uploadProfilePhoto(base64Uri);
          if (uploadedUrl) {
            setAvatarUrl(uploadedUrl);
          }
        } else if (asset.uri) {
          setAvatarUrl(asset.uri);
        }
      }
    } catch (err) {
      console.warn('Camera error:', err);
      Alert.alert('Notice', 'Could not open device camera.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSelectPreset = (url) => {
    setAvatarUrl(url);
    setPhotoModalVisible(false);
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Username cannot be empty');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full Name cannot be empty');
      return;
    }

    const res = await saveProfileData({
      username: username.trim(),
      fullName: fullName.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      website: website.trim(),
      category: category,
      gender: gender,
      email: email.trim(),
    });

    if (res.success) {
      Alert.alert('Profile Complete! 🎉', 'Your profile details have been saved to phpMyAdmin.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      {/* Top Professional Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={skipProfileSetup} style={styles.headerLeftBtn}>
          <Text style={styles.cancelText}>Skip</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading || uploadingPhoto}
          style={styles.headerRightBtn}>
          {loading ? (
            <ActivityIndicator size="small" color="#0095F6" />
          ) : (
            <Text style={styles.doneText}>Done</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Profile Photo Section with Camera Badge */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setPhotoModalVisible(true)}
            style={styles.avatarWrapper}>
            <Image
              source={{ uri: avatarUrl || DEFAULT_AVATARS[0] }}
              style={styles.avatarImage}
            />
            {uploadingPhoto ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator color="#FFF" />
              </View>
            ) : (
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPhotoModalVisible(true)}>
            <Text style={styles.changePhotoText}>Edit picture or avatar</Text>
          </TouchableOpacity>
        </View>

        {/* Public Information Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>PUBLIC PROFILE</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.fieldInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your name"
              placeholderTextColor="#8E8E8E"
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={styles.fieldInput}
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor="#8E8E8E"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Website</Text>
            <TextInput
              style={styles.fieldInput}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://yourwebsite.com"
              placeholderTextColor="#8E8E8E"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.fieldRow, styles.bioRow]}>
            <View style={styles.bioHeaderRow}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <Text style={styles.charCount}>{bio.length}/150</Text>
            </View>
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Write a bio to tell others about yourself..."
              placeholderTextColor="#8E8E8E"
              multiline
              maxLength={150}
            />
          </View>
        </View>

        {/* Category Picker Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>PROFILE CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.categoryChip, category === cat && styles.activeCategoryChip]}
                onPress={() => setCategory(cat)}>
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.activeCategoryChipText,
                  ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Private Information Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeaderTitle}>PRIVATE INFORMATION</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.fieldInput}
              value={email}
              onChangeText={setEmail}
              placeholder="email@domain.com"
              placeholderTextColor="#8E8E8E"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Gender</Text>
            <View style={styles.genderRow}>
              {GENDERS.map((g, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.genderChip, gender === g && styles.activeGenderChip]}
                  onPress={() => setGender(g)}>
                  <Text
                    style={[styles.genderChipText, gender === g && styles.activeGenderChipText]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.disabledBtn]}
          onPress={handleSave}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save Profile & Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Professional Image Picker Bottom Modal */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPhotoModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Change Profile Photo</Text>

            <TouchableOpacity style={styles.modalOption} onPress={handleTakeCameraPhoto}>
              <Ionicons name="camera-outline" size={22} color="#000" />
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalOption} onPress={handlePickFromGallery}>
              <Ionicons name="images-outline" size={22} color="#000" />
              <Text style={styles.modalOptionText}>Choose from Mobile Gallery</Text>
            </TouchableOpacity>

            <View style={styles.presetSection}>
              <Text style={styles.presetTitle}>Or Choose Avatar:</Text>
              <View style={styles.presetRow}>
                {DEFAULT_AVATARS.map((url, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectPreset(url)}
                    style={styles.presetThumbWrap}>
                    <Image source={{ uri: url }} style={styles.presetThumb} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.cancelModalBtn}
              onPress={() => setPhotoModalVisible(false)}>
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  topBar: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
  },
  headerLeftBtn: { padding: 4 },
  headerRightBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  cancelText: { fontSize: 15, color: '#737373' },
  doneText: { fontSize: 15, color: '#0095F6', fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    position: 'relative',
    marginBottom: 10,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFEFEF',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#0095F6',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  changePhotoText: { color: '#0095F6', fontSize: 14, fontWeight: '600' },
  sectionCard: {
    backgroundColor: '#FFF',
    marginTop: 14,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#DBDBDB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E8E',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  fieldRow: {
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  fieldLabel: { fontSize: 12, color: '#8E8E8E', marginBottom: 4, fontWeight: '500' },
  fieldInput: { fontSize: 15, color: '#000', paddingVertical: 2 },
  bioRow: { borderBottomWidth: 0 },
  bioHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCount: { fontSize: 11, color: '#8E8E8E' },
  bioInput: {
    fontSize: 15,
    color: '#000',
    minHeight: 60,
    textAlignVertical: 'top',
    paddingVertical: 4,
  },
  categoryScroll: { flexDirection: 'row', marginVertical: 6 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EFEFEF',
    marginRight: 8,
  },
  activeCategoryChip: { backgroundColor: '#0095F6' },
  categoryChipText: { fontSize: 12, color: '#262626', fontWeight: '500' },
  activeCategoryChipText: { color: '#FFF', fontWeight: '700' },
  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  genderChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    borderWidth: 0.5,
    borderColor: '#DBDBDB',
  },
  activeGenderChip: { backgroundColor: '#000', borderColor: '#000' },
  genderChipText: { fontSize: 11, color: '#737373' },
  activeGenderChipText: { color: '#FFF', fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#0095F6',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledBtn: { opacity: 0.6 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#DBDBDB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 20, color: '#000' },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  modalOptionText: { fontSize: 15, marginLeft: 14, color: '#000', fontWeight: '500' },
  presetSection: { marginTop: 16 },
  presetTitle: { fontSize: 12, color: '#737373', marginBottom: 10, fontWeight: '600' },
  presetRow: { flexDirection: 'row', justifyContent: 'space-around' },
  presetThumbWrap: { padding: 2 },
  presetThumb: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFEFEF' },
  cancelModalBtn: {
    marginTop: 20,
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelModalBtnText: { fontSize: 14, fontWeight: '600', color: '#000' },
});

export default ProfileSetupScreen;
