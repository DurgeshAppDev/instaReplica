import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import UserItem from '../components/UserItem';
import { searchUsers, toggleFollowUser } from '../api/userApi';
import { AuthContext } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const GRID_SIZE = width / 3;

const EXPLORE_CATEGORIES = [
  'All',
  'For you',
  'Technology',
  'Photography',
  'Travel',
  'Art & Design',
  'Fitness',
  'Food',
];

const EXPLORE_GRID_PHOTOS = [
  { id: '101', uri: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500', isReel: true, likes: '4.2k' },
  { id: '102', uri: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500', isReel: false, likes: '1.8k' },
  { id: '103', uri: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500', isReel: false, likes: '950' },
  { id: '104', uri: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500', isReel: true, likes: '12.4k' },
  { id: '105', uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', isReel: false, likes: '3.1k' },
  { id: '106', uri: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500', isReel: false, likes: '2.5k' },
  { id: '107', uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500', isReel: true, likes: '8.9k' },
  { id: '108', uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500', isReel: false, likes: '1.1k' },
  { id: '109', uri: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500', isReel: false, likes: '6.7k' },
];

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, updateFollowingCount } = useContext(AuthContext);

  const fetchSearchResults = useCallback(
    async (searchText = '') => {
      setLoading(true);
      try {
        const res = await searchUsers(searchText, user?.id || 0);
        if (res && res.status === 'success' && Array.isArray(res.data)) {
          setUsers(res.data);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchSearchResults(query);
  }, [query, fetchSearchResults]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSearchResults(query);
  };

  const handlePressUser = (selectedUser) => {
    navigation.navigate('UserProfile', {
      userId: selectedUser.id,
      username: selectedUser.username,
    });
  };

  const handleFollowToggle = async (targetId) => {
    if (!user?.id) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === targetId ? { ...u, is_following: !u.is_following } : u
      )
    );

    try {
      const res = await toggleFollowUser(user.id, targetId);
      if (res && res.status === 'success') {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetId ? { ...u, is_following: res.is_following } : u
          )
        );
        if (typeof res.following_count === 'number') {
          updateFollowingCount(res.following_count);
        }
      } else {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetId ? { ...u, is_following: !u.is_following } : u
          )
        );
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetId ? { ...u, is_following: !u.is_following } : u
        )
      );
    }
  };

  const isSearching = query.trim().length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Search Input Bar */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputWrap}>
          <Ionicons name="search" size={18} color="#8E8E8E" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search accounts, tags, or places"
            placeholderTextColor="#8E8E8E"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#8E8E8E" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills Bar */}
      <View style={styles.categoryBarWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {EXPLORE_CATEGORIES.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.activeCategoryChip,
              ]}
              onPress={() => setSelectedCategory(cat)}>
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.activeCategoryChipText,
                ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator style={styles.loader} color="#0095F6" size="large" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.flatListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {isSearching ? `Accounts for "${query}"` : 'Suggested for you'}
              </Text>
              {!isSearching && (
                <TouchableOpacity onPress={onRefresh}>
                  <Text style={styles.seeAllText}>Refresh</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <UserItem
              item={item}
              currentUserId={user?.id}
              onPressUser={handlePressUser}
              onToggleFollow={handleFollowToggle}
            />
          )}
          ListFooterComponent={
            !isSearching && (
              <View style={styles.exploreSection}>
                <View style={styles.exploreHeaderRow}>
                  <Ionicons name="compass-outline" size={18} color="#000" />
                  <Text style={styles.exploreHeaderText}>Explore Trending</Text>
                </View>

                {/* 3-column Trending Grid */}
                <View style={styles.gridContainer}>
                  {EXPLORE_GRID_PHOTOS.map((photo) => (
                    <View key={photo.id} style={styles.gridItem}>
                      <Image source={{ uri: photo.uri }} style={styles.gridImg} />
                      {photo.isReel && (
                        <View style={styles.reelBadge}>
                          <Ionicons name="play" size={14} color="#FFF" />
                        </View>
                      )}
                      <View style={styles.likesOverlay}>
                        <Ionicons name="heart" size={12} color="#FFF" />
                        <Text style={styles.likesText}>{photo.likes}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#C7C7CD" />
              <Text style={styles.emptyTitle}>
                {isSearching ? `No results for "${query}"` : 'No accounts found'}
              </Text>
              <Text style={styles.emptyText}>
                {isSearching
                  ? 'Check spelling or try searching for another name.'
                  : 'Start following people to discover great photos and videos.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  flatListContent: { paddingBottom: 70 },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000000',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  categoryBarWrap: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#DBDBDB',
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#262626',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#262626',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0095F6',
  },
  exploreSection: {
    marginTop: 16,
  },
  exploreHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 6,
  },
  exploreHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: GRID_SIZE - 2,
    height: GRID_SIZE - 2,
    margin: 1,
    position: 'relative',
    backgroundColor: '#EAEAEA',
  },
  gridImg: {
    width: '100%',
    height: '100%',
  },
  reelBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    padding: 3,
  },
  likesOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  likesText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loader: {
    marginTop: 36,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginTop: 14,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E8E',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
});

export default SearchScreen;
