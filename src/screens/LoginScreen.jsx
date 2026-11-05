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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
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

  // Server management modal states
  const [serverModalVisible, setServerModalVisible] = useState(false);
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
      Alert.alert('Validation Error', 'Please enter your username');
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
      {/* Top Header with Discreet Server Gear Icon */}
      <View style={styles.topHeaderBar}>
        <View style={styles.languageSelector}>
          <Text style={styles.languageText}>English (US)</Text>
          <Ionicons name="chevron-down" size={12} color="#737373" style={styles.langChevron} />
        </View>

        <TouchableOpacity
          style={styles.serverSettingsBtn}
          onPress={() => setServerModalVisible(true)}>
          <View
            style={[
              styles.serverDot,
              connectionStatus === 'connected' && styles.dotGreen,
              connectionStatus === 'db_error' && styles.dotYellow,
              connectionStatus === 'unreachable' && styles.dotRed,
            ]}
          />
          <Ionicons name="settings-outline" size={20} color="#262626" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Instagram Wordmark Logo */}
        <View style={styles.logoSection}>
          <Text style={styles.logoText}>Instagram</Text>
          <Text style={styles.logoSubtitle}>
            {isRegistering
              ? 'Sign up to see photos and videos from your friends.'
              : 'Sign in with your phpMyAdmin database account'}
          </Text>
        </View>

        {/* Tab Switcher (Log In / Sign Up) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, !isRegistering && styles.activeTab]}
            onPress={() => setIsRegistering(false)}>
            <Text style={[styles.tabText, !isRegistering && styles.activeTabText]}>
              Log In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, isRegistering && styles.activeTab]}
            onPress={() => setIsRegistering(true)}>
            <Text style={[styles.tabText, isRegistering && styles.activeTabText]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View style={styles.formCard}>
          {isRegistering && (
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                placeholderTextColor="#8E8E8E"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.textInput}
              placeholder="Username"
              placeholderTextColor="#8E8E8E"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {isRegistering && (
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Email address (optional)"
                placeholderTextColor="#8E8E8E"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={[styles.inputWrap, styles.passwordInputWrap]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#8E8E8E"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#737373"
              />
            </TouchableOpacity>
          </View>

          {isRegistering && (
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm Password"
                placeholderTextColor="#8E8E8E"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.disabledBtn]}
            onPress={handleAuth}
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginBtnText}>
                {isRegistering ? 'Sign Up' : 'Log In'}
              </Text>
            )}
          </TouchableOpacity>

          {!isRegistering && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotBtnText}>Forgot password?</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Quick Demo Accounts */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>One-Tap Demo Accounts (password: password123):</Text>
          <View style={styles.demoChipsRow}>
            {['santosh_dev', 'alex_river', 'sarah_art'].map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.demoChip, username === u && styles.activeDemoChip]}
                onPress={() => handleSelectSample(u)}>
                <Ionicons
                  name="person-circle"
                  size={16}
                  color={username === u ? '#FFF' : '#0095F6'}
                  style={styles.demoIcon}
                />
                <Text style={[styles.demoChipText, username === u && styles.activeDemoChipText]}>
                  @{u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bottom Switch Link */}
        <View style={styles.bottomFooter}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsRegistering(!isRegistering)}>
            <Text style={styles.switchTextRegular}>
              {isRegistering ? 'Already have an account? ' : "Don't have an account? "}
              <Text style={styles.switchTextBold}>
                {isRegistering ? 'Log In.' : 'Sign Up.'}
              </Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.metaBranding}>Meta</Text>
        </View>
      </ScrollView>

      {/* Backend Server Config Modal */}
      <Modal
        visible={serverModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setServerModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setServerModalVisible(false)}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Backend Server Settings</Text>
            <Text style={styles.modalSubtitle}>
              Current Base URL: <Text style={styles.codeText}>{currentServer}</Text>
            </Text>

            <TouchableOpacity
              style={styles.testPingBtn}
              onPress={() => handleTestConnection()}
              disabled={testingConnection}>
              {testingConnection ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.testPingBtnText}>⚡ Test Ping Backend</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.presetSectionTitle}>Select Target Device Host:</Text>
            {SERVER_PRESETS.map((preset, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.presetOption,
                  currentServer === preset.url && styles.activePresetOption,
                ]}
                onPress={() => handleSelectPreset(preset.url)}>
                <Text
                  style={[
                    styles.presetOptionText,
                    currentServer === preset.url && styles.activePresetOptionText,
                  ]}>
                  {preset.label}
                </Text>
                <Text style={styles.presetOptionUrl}>{preset.url}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setServerModalVisible(false)}>
              <Text style={styles.closeModalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 13,
    color: '#737373',
  },
  langChevron: {
    marginLeft: 4,
  },
  serverSettingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  serverDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ADB5BD',
    marginRight: 6,
  },
  dotGreen: { backgroundColor: '#28A745' },
  dotYellow: { backgroundColor: '#FFC107' },
  dotRed: { backgroundColor: '#DC3545' },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    letterSpacing: -1,
    fontFamily: 'sans-serif',
  },
  logoSubtitle: {
    textAlign: 'center',
    fontSize: 13,
    color: '#737373',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#737373',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '700',
  },
  formCard: {
    marginBottom: 16,
  },
  inputWrap: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 10,
    marginBottom: 12,
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: '#000000',
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 14,
    color: '#000000',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  loginBtn: {
    backgroundColor: '#0095F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
    elevation: 1,
    shadowColor: '#0095F6',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledBtn: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  forgotBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  forgotBtnText: {
    fontSize: 12,
    color: '#00376B',
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#DBDBDB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E8E',
  },
  demoSection: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#737373',
    marginBottom: 10,
    textAlign: 'center',
  },
  demoChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  activeDemoChip: {
    backgroundColor: '#0095F6',
    borderColor: '#0095F6',
  },
  demoIcon: {
    marginRight: 4,
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#262626',
  },
  activeDemoChipText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bottomFooter: {
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#DBDBDB',
    paddingTop: 18,
  },
  switchButton: {
    paddingVertical: 6,
  },
  switchTextRegular: {
    fontSize: 13,
    color: '#737373',
  },
  switchTextBold: {
    fontWeight: '700',
    color: '#0095F6',
  },
  metaBranding: {
    fontSize: 12,
    color: '#A8A8A8',
    fontWeight: '600',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DBDBDB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#737373',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#0095F6',
    fontWeight: '700',
  },
  testPingBtn: {
    backgroundColor: '#0095F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  testPingBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  presetSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#737373',
    marginBottom: 8,
  },
  presetOption: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    marginBottom: 8,
  },
  activePresetOption: {
    borderColor: '#0095F6',
    backgroundColor: '#F0F8FF',
  },
  presetOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#262626',
  },
  activePresetOptionText: {
    color: '#0095F6',
  },
  presetOptionUrl: {
    fontSize: 11,
    color: '#737373',
    marginTop: 2,
  },
  closeModalBtn: {
    backgroundColor: '#EFEFEF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalBtnText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LoginScreen;
