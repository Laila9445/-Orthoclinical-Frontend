import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ImageBackground,
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
  const {login} = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Login successful!');
      if (result.user?.role?.toLowerCase() === 'doctor') {
        router.replace('./DoctorDashboardScreen');
      } else if (result.user?.role?.toLowerCase() === 'nurse') {
        router.replace('./DashboardScreen');
      } else if (result.user?.role?.toLowerCase() === 'patient') {
        router.replace('./patient/PatientDashboardScreen');
      } else {
        // Default navigation if role is not specified
        router.replace('./DashboardScreen');
      }
    } else {
      Alert.alert('Login Failed', result.error || 'Please check your credentials');
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://dam.northwell.edu/m/141304741cd230bf/Drupal-web_GettyImages-661788145.jpg' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />
      
      
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {/* Shield Icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="shield-check" size={80} color="#fff" />
            </View>
            {/* Home Button - Top Left */}
      <TouchableOpacity 
        style={styles.homeButton}
        onPress={() => router.push('/Home')}
      >
        <MaterialCommunityIcons name="home" size={28} color="#fff" />
      </TouchableOpacity>

      {/* About Us Button - Top Right */}
      <TouchableOpacity 
        style={styles.aboutButton}
        onPress={() => router.push('/about')}
      >
        <MaterialCommunityIcons name="information" size={28} color="#fff" />
      </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to your account</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email or Username"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
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
                  color="#fff"
                />
              </TouchableOpacity>
            </View>



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

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/SignUp')} disabled={loading}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 450,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: '100%',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#fff',
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: '#fff',
    alignSelf: 'flex-end',
    marginBottom: 24,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fff',
    width: '100%',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  signUpLink: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  homeButton: {
  position: 'absolute',
  top: 50,
  left: 20,  // Changed from 20 to 40
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderWidth: 1,
  borderColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},
aboutButton: {
  position: 'absolute',
  top: 50,
  right: 20,  // Changed from 20 to 40
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  borderWidth: 1,
  borderColor: '#fff',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10,
},
});