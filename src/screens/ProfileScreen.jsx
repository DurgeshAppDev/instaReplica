import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile, toggleFollowUser } from '../api/userApi';

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 3;

const HIGHLIGHTS = [
  { id: '1', title: 'Work 💻', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150' },
  { id: '2', title: 'Travel ✈️', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=150' },
  { id: '3', title: 'Setup ⚡', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=150' },
  { id: '4', title: 'Life 🌿', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150' },
];

const ProfileScreen = ({ navigation, route }) => {
  const { user: currentUser, logoutUser, refreshCurrentUser } = useContext(AuthContext);

  const routeUserId = route.params?.userId;
  const isOwnProfile = !routeUserId || routeUserId === currentUser?.id;
  const targetUserId = routeUserId || currentUser?.id;

  const [profileData, setProfileData] = useState(isOwnProfile ? currentUser : null);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'reels' | 'tagged'

  const fetchProfile = useCallback(async () => {
    if (!targetUserId) return;
    try {
      const res = await getUserProfile(targetUserId, currentUser?.id || 0);
      if (res && res.status === 'success' && res.data) {
        setProfileData(res.data);
        setIsFollowing(Boolean(res.data.is_following));
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [targetUserId, currentUser?.id]);

  useEffect(() => {
    if (isOwnProfile) {
      setProfileData(currentUser);
    } else {
      fetchProfile();
    }
  }, [isOwnProfile, currentUser, fetchProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (isOwnProfile) {
      await refreshCurrentUser();
      setRefreshing(false);
    } else {
      await fetchProfile();
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser?.id || !targetUserId) return;
    setFollowLoading(true);

    const prevFollowing = isFollowing;
    const prevCount = profileData?.followers_count || 0;

    setIsFollowing(!prevFollowing);
    setProfileData((prev) => ({
      ...prev,
      followers_count: prevFollowing ? Math.max(0, prevCount - 1) : prevCount + 1,
    }));

    try {
      const res = await toggleFollowUser(currentUser.id, targetUserId);
      if (res && res.status === 'success') {
        setIsFollowing(res.is_following);
        setProfileData((prev) => ({
          ...prev,
          followers_count: res.followers_count ?? (res.is_following ? prevCount + 1 : prevCount - 1),
        }));
      } else {
        setIsFollowing(prevFollowing);
        setProfileData((prev) => ({ ...prev, followers_count: prevCount }));
      }
    } catch (err) {
      console.error('Toggle follow error:', err);
      setIsFollowing(prevFollowing);
      setProfileData((prev) => ({ ...prev, followers_count: prevCount }));
      Alert.alert('Error', 'Could not update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const openWebsite = (url) => {
    if (!url) return;
    const formatted = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(formatted).catch(() => Alert.alert('Invalid URL', url));
  };

  const displayUser = isOwnProfile ? currentUser : profileData;
  const posts = displayUser?.posts || [];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color="#0095F6" />
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar for Own Profile */}
      {isOwnProfile && (
        <View style={styles.topNavBar}>
          <View style={styles.navUserWrap}>
            <Text style={styles.navUsername}>@{displayUser?.username || 'instagram'}</Text>
            <Ionicons name="chevron-down" size={16} color="#000" style={styles.navChevron} />
          </View>
          <View style={styles.navIconsRow}>
            <TouchableOpacity style={styles.navIconButton}>
              <Ionicons name="add-circle-outline" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navIconButton} onPress={logoutUser}>
              <Ionicons name="log-out-outline" size={24} color="#ED4956" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Profile Row: Avatar & Stats */}
      <View style={styles.profileRow}>
        <View style={styles.avatarBorderRing}>
          <Image
            source={{
              uri:
                displayUser?.avatar_url ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            }}
            style={styles.profileAvatar}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{displayUser?.posts_count ?? posts.length}</Text>
            <Text style={styles.statLabel}>posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{displayUser?.followers_count ?? 0}</Text>
            <Text style={styles.statLabel}>followers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{displayUser?.following_count ?? 0}</Text>
            <Text style={styles.statLabel}>following</Text>
          </View>
        </View>
      </View>

      {/* Bio Section */}
      <View style={styles.bioSection}>
        <Text style={styles.displayName}>{displayUser?.full_name || displayUser?.username}</Text>
        {displayUser?.category && (
          <Text style={styles.categoryBadge}>{displayUser.category}</Text>
        )}
        <Text style={styles.bioText}>
          {displayUser?.bio || 'Hey there! I am using Instagram.'}
        </Text>
        {displayUser?.website ? (
          <TouchableOpacity
            style={styles.websiteRow}
            onPress={() => openWebsite(displayUser.website)}>
            <Ionicons name="link-outline" size={14} color="#00376B" />
            <Text style={styles.websiteText} numberOfLines={1}>
              {displayUser.website}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Action Buttons */}
      {isOwnProfile ? (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.flex1]}
            onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.actionBtnText}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.flex1]}>
            <Text style={styles.actionBtnText}>Share profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.flex1,
              isFollowing ? styles.followingBtn : styles.followBtn,
            ]}
            onPress={handleFollowToggle}
            disabled={followLoading}>
            {followLoading ? (
              <ActivityIndicator color={isFollowing ? '#000' : '#FFF'} size="small" />
            ) : (
              <Text
                style={[
                  styles.actionBtnText,
                  isFollowing ? styles.followingBtnText : styles.followBtnText,
                ]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.flex1]}>
            <Text style={styles.actionBtnText}>Message</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Story Highlights Row */}
      <View style={styles.highlightsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {HIGHLIGHTS.map((item) => (
            <View key={item.id} style={styles.highlightItem}>
              <View style={styles.highlightRing}>
                <Image source={{ uri: item.img }} style={styles.highlightImage} />
              </View>
              <Text style={styles.highlightTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </View>
          ))}
          {isOwnProfile && (
            <View style={styles.highlightItem}>
              <View style={[styles.highlightRing, styles.highlightNewRing]}>
                <Ionicons name="add" size={24} color="#000" />
              </View>
              <Text style={styles.highlightTitle}>New</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Tabs: Grid | Reels | Tagged */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'grid' && styles.activeTabButton]}
          onPress={() => setActiveTab('grid')}>
          <Ionicons
            name={activeTab === 'grid' ? 'grid' : 'grid-outline'}
            size={22}
            color={activeTab === 'grid' ? '#000' : '#8E8E8E'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'reels' && styles.activeTabButton]}
          onPress={() => setActiveTab('reels')}>
          <Ionicons
            name={activeTab === 'reels' ? 'videocam' : 'videocam-outline'}
            size={24}
            color={activeTab === 'reels' ? '#000' : '#8E8E8E'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tagged' && styles.activeTabButton]}
          onPress={() => setActiveTab('tagged')}>
          <Ionicons
            name={activeTab === 'tagged' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'tagged' ? '#000' : '#8E8E8E'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={posts}
        keyExtractor={(item, index) => item?.id ? item.id.toString() : index.toString()}
        numColumns={3}
        contentContainerStyle={styles.flatListContent}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Image
            source={{
              uri:
                item?.image_url ||
                `https://picsum.photos/400/400?random=${item?.id || 1}`,
            }}
            style={styles.gridImage}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyPosts}>
            <Ionicons name="camera-outline" size={48} color="#C7C7CD" />
            <Text style={styles.emptyPostsTitle}>No Posts Yet</Text>
            <Text style={styles.emptyPostsText}>Photos and videos will appear here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  flatListContent: { paddingBottom: 70 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerContainer: { backgroundColor: '#FFF' },
  topNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  navUserWrap: { flexDirection: 'row', alignItems: 'center' },
  navUsername: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  navChevron: { marginLeft: 4 },
  navIconsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  navIconButton: { padding: 2 },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  avatarBorderRing: {
    padding: 2,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: '#DBDBDB',
  },
  profileAvatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#EFEFEF',
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    marginLeft: 24,
  },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 17, fontWeight: '700', color: '#000' },
  statLabel: { fontSize: 13, color: '#262626', marginTop: 1 },
  bioSection: { paddingHorizontal: 16, marginTop: 10 },
  displayName: { fontWeight: '700', fontSize: 14, color: '#000' },
  categoryBadge: { fontSize: 12, color: '#8E8E8E', marginTop: 1 },
  bioText: { fontSize: 13, color: '#000', marginTop: 3, lineHeight: 18 },
  websiteRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  websiteText: { fontSize: 13, color: '#00376B', fontWeight: '600', marginLeft: 4 },
  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 14,
  },
  actionBtn: {
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: { flex: 1 },
  actionBtnText: { color: '#000', fontWeight: '600', fontSize: 13 },
  followBtn: { backgroundColor: '#0095F6' },
  followBtnText: { color: '#FFF', fontWeight: '700' },
  followingBtn: { backgroundColor: '#EFEFEF', borderWidth: 0.5, borderColor: '#DBDBDB' },
  followingBtnText: { color: '#000', fontWeight: '600' },
  highlightsContainer: {
    paddingVertical: 14,
    paddingLeft: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  highlightItem: { alignItems: 'center', marginRight: 16 },
  highlightRing: {
    padding: 2,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    marginBottom: 4,
  },
  highlightNewRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#C7C7CD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightImage: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#EEE' },
  highlightTitle: { fontSize: 11, color: '#262626', maxWidth: 64, textAlign: 'center' },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#000',
  },
  gridImage: {
    width: GRID_SIZE - 2,
    height: GRID_SIZE - 2,
    margin: 1,
    backgroundColor: '#EFEFEF',
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyPostsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginTop: 10,
  },
  emptyPostsText: {
    fontSize: 13,
    color: '#8E8E8E',
    marginTop: 4,
  },
});

export default ProfileScreen;
