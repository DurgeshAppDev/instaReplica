import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const UserItem = ({ item, onPressUser, onToggleFollow }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onPressUser && onPressUser(item)}>
      <Image
        source={{
          uri: item.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        }}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.username} numberOfLines={1}>
          {item.username}
        </Text>
        <Text style={styles.fullName} numberOfLines={1}>
          {item.full_name || 'No name'}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          item.is_following ? styles.followingBtn : styles.followBtn,
        ]}
        activeOpacity={0.8}
        onPress={() => onToggleFollow && onToggleFollow(item.id)}>
        <Text
          style={[
            styles.btnText,
            item.is_following ? styles.followingText : styles.followText,
          ]}>
          {item.is_following ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFF',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EFEFEF',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  username: {
    fontWeight: '700',
    fontSize: 14,
    color: '#000',
  },
  fullName: {
    color: '#737373',
    fontSize: 13,
    marginTop: 2,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    minWidth: 95,
    alignItems: 'center',
  },
  followBtn: {
    backgroundColor: '#0095F6',
  },
  followingBtn: {
    backgroundColor: '#EFEFEF',
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  followText: {
    color: '#FFF',
  },
  followingText: {
    color: '#000',
  },
});

export default UserItem;
