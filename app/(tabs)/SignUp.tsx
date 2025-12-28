import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function SignUp() {
  const router = useRouter();
  const { register } = useAuth(); // Get register function from AuthContext
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('Patient'); // Default role
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Validate inputs
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || 
        !confirmPassword.trim() || !phoneNumber.trim() || !gender.trim() || !dateOfBirth.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }
    
    // Validate phone number format - Backend expects Egyptian format
    const phoneRegex = /^(010|011|012|015)\d{8}$/; // Egyptian phone format
    if (!phoneRegex.test(phoneNumber.replace(/[^\d]/g, ''))) {
      Alert.alert('Validation Error', 'Please enter a valid Egyptian phone number (e.g., 01012345678)');
      return;
    }
    
    // Validate gender - Backend expects specific values
    if (!['Male', 'Female', 'Other'].includes(gender)) {
      Alert.alert('Validation Error', 'Gender must be Male, Female, or Other');
      return;
    }
    
    // Validate date of birth format - Backend expects YYYY/MM/DD format
    const dateRegex = /^\d{4}\/\d{1,2}\/\d{1,2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      Alert.alert('Validation Error', 'Please enter date of birth in YYYY/MM/DD format');
      return;
    }
    
    // Check if date is in the past
    const enteredDate = new Date(dateOfBirth);
    const today = new Date();
    if (enteredDate >= today) {
      Alert.alert('Validation Error', 'Date of birth must be in the past');
      return;
    }

    // Show loading spinner
    setLoading(true);
    
    // Prepare user data for registration with backend-specific format
    const userData = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role,
      gender,
      dateOfBirth,
    };

    // Call the register function from AuthContext
    const result = await register(userData);
    
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to appropriate dashboard based on role
            if (result.user?.role?.toLowerCase() === 'doctor') {
              router.replace('/DoctorDashboardScreen');
            } else if (result.user?.role?.toLowerCase() === 'nurse') {
              router.replace('/DashboardScreen');
            } else if (result.user?.role?.toLowerCase() === 'patient') {
              router.replace('/patient/PatientDashboardScreen');
            } else {
              router.replace('/(tabs)/index'); // Default to login
            }
          },
        },
      ]);
    } else {
      Alert.alert('Registration Failed', result.error || 'Please check your details');
    }
  };

  return (
    <ImageBackground
          source={{ uri: 'https://img.freepik.com/premium-photo/digital-visualization-human-knee-joint-highlighting-anatomical-structure-medical-analysis_74231-10759.jpg?semt=ais_hybrid&w=740&q=80' }}
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
        {/* User Icon */}
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="account-plus" size={80} color="#ffffffff" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to get started</Text>

        {/* First Name Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>

        {/* Last Name Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
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

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
            disabled={loading}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>


        {/* Phone Number Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g., 01012345678"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>

        {/* Role Selection */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-circle-outline" size={20} color="#666" style={styles.inputIcon} />
          <Text style={[styles.input, { color: '#333', flex: 1 }]}>Role: {role}</Text>
          <TouchableOpacity onPress={() => {
            const roles = ['Patient', 'Doctor', 'Nurse'];
            const currentIndex = roles.indexOf(role);
            const nextIndex = (currentIndex + 1) % roles.length;
            setRole(roles[nextIndex]);
          }} disabled={loading}>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Gender Selection */}
        <View style={styles.inputContainer}>
          <Ionicons name="transgender-outline" size={20} color="#666" style={styles.inputIcon} />
          <Text style={[styles.input, { color: '#333', flex: 1 }]}>Gender: {gender || 'Select'}</Text>
          <TouchableOpacity onPress={() => {
            const genders = gender === 'Male' ? 'Female' : gender === 'Female' ? 'Other' : 'Male';
            setGender(genders);
          }} disabled={loading}>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Date of Birth Input */}
        <View style={styles.inputContainer}>
          <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="YYYY/MM/DD"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            keyboardType="numbers-and-punctuation"
            editable={!loading}
          />
        </View>
        
        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>
        
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
        
        </View>
        
        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity disabled={loading}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
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
  formContainer: {   // ADD THIS WHOLE BLOCK
    width: '100%',
    maxWidth: 450,   // Change this number to make it wider/narrower
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
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparent white
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
  signUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparent white
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    width: '100%',
    borderColor: '#fff',
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#ffffffff',
  },
  signInLink: {
    fontSize: 14,
    color: '#ffffffff',
    fontWeight: '600',
  },
  homeButton: {
    position: 'absolute',
    top: 50, // Adjust based on your StatusBar height
    left: 20,
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
  right: 20,
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