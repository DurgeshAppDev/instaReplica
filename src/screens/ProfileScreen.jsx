import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AuthContext } from '../context/AuthContext';
import { getUserProfile, toggleFollowUser, getFollowList } from '../api/userApi';
import UserItem from '../components/UserItem';

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 3;

const HIGHLIGHTS = [
  { id: '1', title: 'Work 💻', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150' },
  { id: '2', title: 'Travel ✈️', img: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=150' },
  { id: '3', title: 'Setup ⚡', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=150' },
  { id: '4', title: 'Life 🌿', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150' },
];

const ProfileScreen = ({ navigation, route }) => {
  const { user: currentUser, logoutUser, refreshCurrentUser, updateFollowingCount } =
    useContext(AuthContext);

  const routeUserId = route.params?.userId;
  const isOwnProfile = !routeUserId || routeUserId === currentUser?.id;
  const targetUserId = routeUserId || currentUser?.id;

  const [profileData, setProfileData] = useState(isOwnProfile ? currentUser : null);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('grid'); // 'grid' | 'reels' | 'tagged'

  // Followers / Following Modal states
  const [followModalVisible, setFollowModalVisible] = useState(false);
  const [followListType, setFollowListType] = useState('followers');
  const [followListData, setFollowListData] = useState([]);
  const [followListLoading, setFollowListLoading] = useState(false);
  const [followSearchQuery, setFollowSearchQuery] = useState('');

  const fetchFollowList = useCallback(
    async (typeToFetch) => {
      if (!targetUserId) return;
      setFollowListLoading(true);
      try {
        const res = await getFollowList(
          targetUserId,
          typeToFetch,
          currentUser?.id || 0
        );
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          setFollowListData(res.data);
        }
      } catch (err) {
        console.error('Fetch follow list error:', err);
      } finally {
        setFollowListLoading(false);
      }
    },
    [targetUserId, currentUser?.id]
  );

  const openFollowListModal = (type) => {
    setFollowListType(type);
    setFollowSearchQuery('');
    setFollowModalVisible(true);
    fetchFollowList(type);
  };

  const filteredFollowList = followListData.filter((u) => {
    if (!followSearchQuery.trim()) return true;
    const q = followSearchQuery.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.full_name && u.full_name.toLowerCase().includes(q))
    );
  });

  const handleFollowToggleInModal = async (itemId) => {
    if (!currentUser?.id) return;

    setFollowListData((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, is_following: !item.is_following } : item
      )
    );

    try {
      const res = await toggleFollowUser(currentUser.id, itemId);
      if (res && res.status === 'success') {
        setFollowListData((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, is_following: res.is_following } : item
          )
        );
        if (typeof res.following_count === 'number') {
          updateFollowingCount(res.following_count);
        }
      }
    } catch {
      setFollowListData((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_following: !item.is_following } : item
        )
      );
    }
  };

  const handlePressUserFromModal = (selectedUser) => {
    setFollowModalVisible(false);
    navigation.navigate('UserProfile', {
      userId: selectedUser.id,
      username: selectedUser.username,
    });
  };

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
        if (typeof res.following_count === 'number') {
          updateFollowingCount(res.following_count);
        }
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
            {displayUser?.id <= 3 && (
              <Ionicons name="checkmark-circle" size={16} color="#0095F6" style={styles.verifiedBadge} />
            )}
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
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => openFollowListModal('followers')}
            activeOpacity={0.7}>
            <Text style={styles.statNum}>{displayUser?.followers_count ?? 0}</Text>
            <Text style={styles.statLabel}>followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => openFollowListModal('following')}
            activeOpacity={0.7}>
            <Text style={styles.statNum}>{displayUser?.following_count ?? 0}</Text>
            <Text style={styles.statLabel}>following</Text>
          </TouchableOpacity>
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
          <TouchableOpacity
            style={[styles.actionBtn, styles.iconBtn]}
            onPress={() => navigation.navigate('SearchTab')}>
            <Ionicons name="person-add-outline" size={16} color="#000" />
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
          <TouchableOpacity style={[styles.actionBtn, styles.iconBtn]}>
            <Ionicons name="person-add-outline" size={16} color="#000" />
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

      {/* Followers / Following Modal */}
      <Modal
        visible={followModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFollowModalVisible(false)}>
        <SafeAreaView style={styles.modalSafeArea} edges={['top', 'left', 'right']}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setFollowModalVisible(false)}>
              <Ionicons name="chevron-back" size={26} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>
              {displayUser?.username || 'user'}
            </Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          {/* Followers / Following Tabs */}
          <View style={styles.modalTabsRow}>
            <TouchableOpacity
              style={[
                styles.modalTabItem,
                followListType === 'followers' && styles.modalTabItemActive,
              ]}
              onPress={() => {
                setFollowListType('followers');
                fetchFollowList('followers');
              }}>
              <Text
                style={[
                  styles.modalTabText,
                  followListType === 'followers' && styles.modalTabTextActive,
                ]}>
                {displayUser?.followers_count ?? 0} Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalTabItem,
                followListType === 'following' && styles.modalTabItemActive,
              ]}
              onPress={() => {
                setFollowListType('following');
                fetchFollowList('following');
              }}>
              <Text
                style={[
                  styles.modalTabText,
                  followListType === 'following' && styles.modalTabTextActive,
                ]}>
                {displayUser?.following_count ?? 0} Following
              </Text>
            </TouchableOpacity>
          </View>

          {/* Search Input in Modal */}
          <View style={styles.modalSearchContainer}>
            <Ionicons name="search" size={16} color="#8E8E8E" style={styles.modalSearchIcon} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search"
              placeholderTextColor="#8E8E8E"
              value={followSearchQuery}
              onChangeText={setFollowSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          {/* Followers / Following List */}
          {followListLoading ? (
            <View style={styles.modalCentered}>
              <ActivityIndicator size="large" color="#0095F6" />
            </View>
          ) : (
            <FlatList
              data={filteredFollowList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <UserItem
                  item={item}
                  currentUserId={currentUser?.id}
                  onPressUser={handlePressUserFromModal}
                  onToggleFollow={handleFollowToggleInModal}
                />
              )}
              ListEmptyComponent={
                <View style={styles.modalEmptyWrap}>
                  <Ionicons
                    name={
                      followListType === 'followers'
                        ? 'people-outline'
                        : 'person-add-outline'
                    }
                    size={48}
                    color="#C7C7CD"
                  />
                  <Text style={styles.modalEmptyTitle}>
                    {followListType === 'followers' ? 'No Followers Yet' : 'Not Following Anyone'}
                  </Text>
                  <Text style={styles.modalEmptySub}>
                    {followListType === 'followers'
                      ? 'When someone follows this account, they will appear here.'
                      : 'Accounts that this user follows will appear here.'}
                  </Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
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
  verifiedBadge: { marginLeft: 4 },
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
  iconBtn: { paddingHorizontal: 10 },
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
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  modalHeaderSpacer: {
    width: 36,
  },
  modalTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
  },
  modalTabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modalTabItemActive: {
    borderBottomColor: '#000000',
  },
  modalTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E8E',
  },
  modalTabTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 10,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    paddingVertical: 0,
  },
  modalCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  modalEmptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  modalEmptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginTop: 14,
  },
  modalEmptySub: {
    fontSize: 13,
    color: '#8E8E8E',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});

export default ProfileScreen;
