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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserItem from '../components/UserItem';
import { searchUsers, toggleFollowUser } from '../api/userApi';
import { AuthContext } from '../context/AuthContext';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);

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

  // Load all users on mount as requested: "in search section already show some all users there"
  useEffect(() => {
    fetchSearchResults(query);
  }, [query, fetchSearchResults]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSearchResults(query);
  };

  const handlePressUser = (selectedUser) => {
    // Navigate to that user's profile with details
    navigation.navigate('UserProfile', {
      userId: selectedUser.id,
      username: selectedUser.username,
    });
  };

  const handleFollowToggle = async (targetId) => {
    if (!user?.id) return;

    // Immediate Optimistic Update
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
      } else {
        // Revert on failure
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetId ? { ...u, is_following: !u.is_following } : u
          )
        );
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetId ? { ...u, is_following: !u.is_following } : u
        )
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search accounts by username or name..."
          placeholderTextColor="#8E8E8E"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Header Label: Suggested vs Search Results */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {query.trim().length > 0
            ? `Search Results for "${query}"`
            : 'All Users (Suggested)'}
        </Text>
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
          renderItem={({ item }) => (
            <UserItem
              item={item}
              onPressUser={handlePressUser}
              onToggleFollow={handleFollowToggle}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {query.trim().length > 0
                  ? `No accounts found for "${query}"`
                  : 'No users found in database.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  flatListContent: { paddingBottom: 70 },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
    color: '#000',
  },
  clearBtn: {
    position: 'absolute',
    right: 26,
    padding: 6,
  },
  clearBtnText: {
    color: '#8E8E8E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#737373',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 30,
  },
  loader: {
    marginTop: 30,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E8E',
    fontSize: 14,
  },
});

export default SearchScreen;
