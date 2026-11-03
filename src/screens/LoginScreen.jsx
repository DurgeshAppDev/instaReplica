import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  SERVER_PRESETS,
} from '../constants/config';
import { pingBackend } from '../api/userApi';

const LoginScreen = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  // Form states
  const [username, setUsername] = useState('santosh_dev');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Server states
  const [currentServer, setCurrentServer] = useState(getApiBaseUrl());
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const { loginUser, registerUser, loading } = useContext(AuthContext);

  useEffect(() => {
    pingBackend()
      .then((res) => {
        if (res && res.database_connected) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('db_error');
        }
      })
      .catch(() => {
        setConnectionStatus('unreachable');
      });
  }, []);

  const handleTestConnection = async (urlToTest) => {
    const target = urlToTest || currentServer;
    setTestingConnection(true);
    try {
      if (urlToTest) {
        setApiBaseUrl(urlToTest);
        setCurrentServer(urlToTest);
      }
      const res = await pingBackend();
      if (res && res.database_connected) {
        setConnectionStatus('connected');
        Alert.alert(
          'Connection Success! ✅',
          `Server is online!\nConnected to phpMyAdmin database "insta_db".\nTotal registered users: ${res.users_in_db}`
        );
      } else {
        setConnectionStatus('db_error');
        Alert.alert(
          'Database Issue ⚠️',
          `Apache is reachable, but MySQL error: ${res?.database_error || 'Check failed'}.\nEnsure MySQL is running in XAMPP.`
        );
      }
    } catch {
      setConnectionStatus('unreachable');
      Alert.alert(
        'Server Unreachable ❌',
        `Could not reach ${target}.\n\nTips:\n• If on a real phone: tap "Real Phone (Wi-Fi)" or run "adb reverse tcp:80 tcp:80".\n• Ensure Apache is started in XAMPP.`
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSelectPreset = (presetUrl) => {
    setApiBaseUrl(presetUrl);
    setCurrentServer(presetUrl);
    handleTestConnection(presetUrl);
  };

  const handleAuth = async () => {
    if (!username.trim()) {
      Alert.alert('Validation Error', 'Please enter a username');
      return;
    }

    if (isRegistering) {
      if (!fullName.trim()) {
        Alert.alert('Validation Error', 'Please enter your full name');
        return;
      }
      if (!password) {
        Alert.alert('Validation Error', 'Please enter a password');
        return;
      }
      if (password.length < 4) {
        Alert.alert('Validation Error', 'Password must be at least 4 characters');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Validation Error', 'Passwords do not match');
        return;
      }

      await registerUser({
        username: username.trim(),
        password: password,
        fullName: fullName.trim(),
        email: email.trim(),
      });
    } else {
      if (!password) {
        Alert.alert('Validation Error', 'Please enter your password');
        return;
      }
      await loginUser(username.trim(), password);
    }
  };

  const handleSelectSample = (sampleUser) => {
    setUsername(sampleUser);
    setPassword('password123');
    setIsRegistering(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Backend Server Bar */}
        <View style={styles.serverCard}>
          <View style={styles.serverHeaderRow}>
            <View style={styles.statusDotWrap}>
              <View
                style={[
                  styles.statusDot,
                  connectionStatus === 'connected' && styles.statusDotGreen,
                  connectionStatus === 'db_error' && styles.statusDotYellow,
                  connectionStatus === 'unreachable' && styles.statusDotRed,
                ]}
              />
              <Text style={styles.serverCardTitle}>Backend Server</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleTestConnection()}
              disabled={testingConnection}
              style={styles.testBtn}>
              {testingConnection ? (
                <ActivityIndicator size="small" color="#0095F6" />
              ) : (
                <Text style={styles.testBtnText}>Test Ping</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.currentUrlText} numberOfLines={1}>
            {currentServer}
          </Text>

          <View style={styles.presetButtonsRow}>
            {SERVER_PRESETS.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetChip,
                  currentServer === preset.url && styles.activePresetChip,
                ]}
                onPress={() => handleSelectPreset(preset.url)}>
                <Text
                  style={[
                    styles.presetChipText,
                    currentServer === preset.url && styles.activePresetChipText,
                  ]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Instagram Header */}
        <Text style={styles.logoText}>Instagram</Text>
        <Text style={styles.subTitle}>
          {isRegistering ? 'Create your official account' : 'Log in with your registered account'}
        </Text>

        {/* Mode Switcher Tabs */}
        <View style={styles.tabSwitchContainer}>
          <TouchableOpacity
            style={[styles.modeTab, !isRegistering && styles.activeModeTab]}
            onPress={() => setIsRegistering(false)}>
            <Text style={[styles.modeTabText, !isRegistering && styles.activeModeTabText]}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, isRegistering && styles.activeModeTab]}
            onPress={() => setIsRegistering(true)}>
            <Text style={[styles.modeTabText, isRegistering && styles.activeModeTabText]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        {isRegistering && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Anderson"
              placeholderTextColor="#8E8E8E"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. santosh_dev"
            placeholderTextColor="#8E8E8E"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {isRegistering && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. john@example.com"
              placeholderTextColor="#8E8E8E"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Password</Text>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            placeholderTextColor="#8E8E8E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
        </View>

        {isRegistering && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Repeat password"
              placeholderTextColor="#8E8E8E"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledBtn]}
          onPress={handleAuth}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>{isRegistering ? 'Register & Continue' : 'Log In'}</Text>
          )}
        </TouchableOpacity>

        {/* Security / Notice Badge */}
        {!isRegistering && (
          <Text style={styles.registeredOnlyNotice}>
            🔒 Only registered accounts stored in phpMyAdmin can log in.
          </Text>
        )}

        {/* Quick Test Accounts */}
        {!isRegistering && (
          <View style={styles.testAccountsSection}>
            <Text style={styles.quickLabel}>Registered Test Accounts (Password: password123):</Text>
            <View style={styles.chipsRow}>
              {['santosh_dev', 'alex_river', 'sarah_art'].map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.chip, username === u && styles.activeChip]}
                  onPress={() => handleSelectSample(u)}>
                  <Text style={[styles.chipText, username === u && styles.activeChipText]}>
                    @{u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Switch Link */}
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.switchText}>
            {isRegistering
              ? 'Already registered? Log In here'
              : "Don't have an account yet? Sign Up"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 36 },
  serverCard: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  serverHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDotWrap: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ADB5BD', marginRight: 6 },
  statusDotGreen: { backgroundColor: '#28A745' },
  statusDotYellow: { backgroundColor: '#FFC107' },
  statusDotRed: { backgroundColor: '#DC3545' },
  serverCardTitle: { fontSize: 12, fontWeight: '700', color: '#495057' },
  currentUrlText: { fontSize: 11, color: '#6C757D', marginBottom: 8 },
  testBtn: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4, backgroundColor: '#E9ECEF' },
  testBtnText: { fontSize: 11, color: '#0095F6', fontWeight: '600' },
  presetButtonsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  presetChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  activePresetChip: { backgroundColor: '#0095F6', borderColor: '#0095F6' },
  presetChipText: { fontSize: 11, color: '#495057' },
  activePresetChipText: { color: '#FFF', fontWeight: '600' },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    fontFamily: 'sans-serif',
  },
  subTitle: {
    textAlign: 'center',
    color: '#737373',
    fontSize: 13,
    marginBottom: 20,
    marginTop: 4,
  },
  tabSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    padding: 3,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeModeTab: {
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  modeTabText: { fontSize: 13, fontWeight: '600', color: '#737373' },
  activeModeTabText: { color: '#000', fontWeight: '700' },
  inputContainer: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inputLabel: { fontSize: 13, color: '#262626', fontWeight: '600', marginBottom: 6 },
  showHideText: { fontSize: 12, color: '#0095F6', fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
  },
  button: {
    backgroundColor: '#0095F6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledBtn: { opacity: 0.6 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
  registeredOnlyNotice: {
    textAlign: 'center',
    color: '#8E8E8E',
    fontSize: 11,
    marginTop: 10,
  },
  switchBtn: { marginTop: 24, alignItems: 'center' },
  switchText: { color: '#0095F6', fontSize: 13, fontWeight: '600' },
  testAccountsSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  quickLabel: { fontSize: 11, color: '#737373', marginBottom: 8, fontWeight: '500' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
  },
  activeChip: { backgroundColor: '#0095F6' },
  chipText: { fontSize: 12, color: '#333', fontWeight: '500' },
  activeChipText: { color: '#FFF', fontWeight: 'bold' },
});

export default LoginScreen;
