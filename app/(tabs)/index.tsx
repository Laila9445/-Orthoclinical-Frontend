import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';


export default function Index() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);

    // Attempt login
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Login successful!');
      // Navigate to appropriate dashboard based on role
      if (result.role === 'doctor') {
        router.replace('/DoctorDashboardScreen');
      } else {
        router.replace('/DashboardScreen');
      }
    } else {
      Alert.alert('Login Failed', result.error || 'Please check your credentials');
    }
  };

  // const handleBiometricLogin = async () => {
  //   try {
  //     // Check if device supports biometric authentication
  //     const hasHardware = await LocalAuthentication.hasHardwareAsync();
  //     if (!hasHardware) {
  //       Alert.alert('Not Supported', 'Biometric authentication is not supported on this device');
  //       return;
  //     }

  //     const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  //     if (!isEnrolled) {
  //       Alert.alert('Not Enrolled', 'No biometric data found. Please set up biometrics in your device settings.');
  //       return;
  //     }

  //     // Attempt biometric authentication
  //     const result = await LocalAuthentication.authenticateAsync({
  //       promptMessage: 'Login with Biometrics',
  //       fallbackLabel: 'Use passcode',
  //     });

  //     if (result.success) {
  //       Alert.alert('Success', 'Login successful!');
  //     } else {
  //       Alert.alert('Authentication Failed', 'Please try again');
  //     }
  //   } catch (error) {
  //     Alert.alert('Error', 'An error occurred during biometric authentication');
  //   }
  // };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Shield Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="shield-check" size={80} color="#007BFF" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email or Username"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
            disabled={loading}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => { }} disabled={loading}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>

        {/* Biometric Login Button
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
          disabled={loading} */}
        {/* > */}
        {/* <MaterialCommunityIcons name="fingerprint" size={24} color="#007BFF" />
          <Text style={styles.biometricButtonText}>Login with Biometrics</Text>
        </TouchableOpacity> */}

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/SignUp')} disabled={loading}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#007BFF',
    textAlign: 'right',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#007BFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // biometricButton: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   height: 50,
  //   borderRadius: 8,
  //   borderWidth: 1,
  //   borderColor: '#007BFF',
  //   backgroundColor: '#fff',
  //   marginBottom: 24,
  // },
  // biometricButtonText: {
  //   color: '#007BFF',
  //   fontSize: 16,
  //   fontWeight: '600',
  //   marginLeft: 8,
  // },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  signUpLink: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '600',
  },
});