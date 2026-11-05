import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const UserItem = ({ item, user, currentUserId, onPressUser, onToggleFollow }) => {
  const userData = item || user;
  if (!userData) return null;

  const isVerified = userData.id <= 3; // Give top sample creators a verified badge
  const isMe = currentUserId && userData.id === currentUserId;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onPressUser && onPressUser(userData)}>
      {/* Avatar with subtle ring */}
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri:
              userData.avatar_url ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          }}
          style={styles.avatar}
        />
      </View>

      {/* User Information */}
      <View style={styles.infoContainer}>
        <View style={styles.usernameRow}>
          <Text style={styles.username} numberOfLines={1}>
            {userData.username}
          </Text>
          {isVerified && (
            <Ionicons
              name="checkmark-circle"
              size={14}
              color="#0095F6"
              style={styles.verifiedIcon}
            />
          )}
        </View>

        <Text style={styles.fullName} numberOfLines={1}>
          {userData.full_name || 'Instagram User'}
        </Text>

        <Text style={styles.subtext} numberOfLines={1}>
          {userData.bio ? userData.bio.replace(/\n/g, ' ') : 'Suggested for you'}
        </Text>
      </View>

      {/* Follow Button or You Indicator */}
      {isMe ? (
        <View style={styles.youBadge}>
          <Text style={styles.youBadgeText}>You</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.button,
            userData.is_following ? styles.followingBtn : styles.followBtn,
          ]}
          activeOpacity={0.8}
          onPress={() => onToggleFollow && onToggleFollow(userData.id)}>
          <Text
            style={[
              styles.btnText,
              userData.is_following ? styles.followingText : styles.followText,
            ]}>
            {userData.is_following ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  avatarWrapper: {
    padding: 2,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EAEAEA',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
    justifyContent: 'center',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: '700',
    fontSize: 14,
    color: '#000000',
    letterSpacing: -0.2,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  fullName: {
    color: '#737373',
    fontSize: 13,
    marginTop: 1,
    fontWeight: '400',
  },
  subtext: {
    color: '#A8A8A8',
    fontSize: 11,
    marginTop: 1,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtn: {
    backgroundColor: '#0095F6',
  },
  followingBtn: {
    backgroundColor: '#EFEFEF',
    borderWidth: 0.5,
    borderColor: '#DBDBDB',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  followText: {
    color: '#FFFFFF',
  },
  followingText: {
    color: '#000000',
  },
  youBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  youBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E8E',
  },
});

export default UserItem;
