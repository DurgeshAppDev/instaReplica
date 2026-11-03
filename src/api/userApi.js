import {
  getApiBaseUrl,
  setApiBaseUrl,
  CANDIDATE_URLS,
} from '../constants/config';

const makeSingleRequest = async (url, options = {}, timeoutMs = 5000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text.slice(0, 150)}`);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const requestWithFallback = async (endpoint, options = {}) => {
  const activeBase = getApiBaseUrl();
  const primaryUrl = `${activeBase}/${endpoint.replace(/^\/+/, '')}`;

  try {
    return await makeSingleRequest(primaryUrl, options, 4000);
  } catch (primaryErr) {
    console.warn(`Request failed on ${primaryUrl}:`, primaryErr.message);

    const remainingUrls = CANDIDATE_URLS.filter((u) => u !== activeBase);

    for (const candidate of remainingUrls) {
      const candidateUrl = `${candidate}/${endpoint.replace(/^\/+/, '')}`;
      try {
        const result = await makeSingleRequest(candidateUrl, options, 3000);
        setApiBaseUrl(candidate);
        return result;
      } catch {
        // Continue trying next candidate
      }
    }

    throw new Error(
      `Could not reach server at ${activeBase}. Please check connection or XAMPP.`
    );
  }
};

/**
 * Health check to ping backend
 */
export const pingBackend = async () => {
  return await requestWithFallback('ping.php', { method: 'GET' });
};

/**
 * Log in with username and password
 */
export const loginUserApi = async (username, password) => {
  return await requestWithFallback('login.php', {
    method: 'POST',
    body: JSON.stringify({
      username: username.trim(),
      password: password,
    }),
  });
};

/**
 * Register a new user with password
 */
export const registerUserApi = async ({ username, password, fullName, email }) => {
  return await requestWithFallback('register.php', {
    method: 'POST',
    body: JSON.stringify({
      username: username.trim(),
      password: password,
      full_name: fullName.trim(),
      email: email ? email.trim() : undefined,
    }),
  });
};

/**
 * Upload profile picture from mobile (supports base64 or multipart)
 */
export const uploadAvatarApi = async (userId, imageBase64) => {
  return await requestWithFallback('upload_avatar.php', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      image_base64: imageBase64,
    }),
  });
};

/**
 * Get profile details of a user
 */
export const getUserProfile = async (userId, currentUserId = 0) => {
  return await requestWithFallback(
    `get_profile.php?user_id=${userId}&current_user_id=${currentUserId}`,
    { method: 'GET' }
  );
};

/**
 * Update professional profile details
 */
export const updateUserProfile = async (
  userId,
  fullName,
  bio,
  avatarUrl,
  username,
  website,
  gender,
  category
) => {
  return await requestWithFallback('update_profile.php', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      full_name: fullName,
      bio: bio,
      avatar_url: avatarUrl,
      username: username,
      website: website,
      gender: gender,
      category: category,
    }),
  });
};

/**
 * Search users
 */
export const searchUsers = async (query = '', currentUserId = 0) => {
  return await requestWithFallback(
    `search_users.php?query=${encodeURIComponent(query)}&current_user_id=${currentUserId}`,
    { method: 'GET' }
  );
};

/**
 * Toggle follow/unfollow between two users
 */
export const toggleFollowUser = async (followerId, followingId) => {
  return await requestWithFallback('toggle_follow.php', {
    method: 'POST',
    body: JSON.stringify({
      follower_id: followerId,
      following_id: followingId,
    }),
  });
};
