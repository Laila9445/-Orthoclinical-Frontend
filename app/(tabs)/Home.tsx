import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import 'expo-router/entry';
import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={{ uri: 'https://t4.ftcdn.net/jpg/08/36/35/21/360_F_836352120_kxdMqhvhvjdPgfOnTHzL9VgZsinmYkky.jpg' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
  contentContainerStyle={styles.content}
  keyboardShouldPersistTaps="handled">
  
  <View style={styles.formContainer}>   

      {/* Semi-transparent overlay */}
      <View style={styles.overlay} />
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons name="wheelchair-accessibility" size={100} color="#ffffffff" />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Dr Ahmed Nabil Clinic</Text>
        <Text style={styles.tagline}>Orthopedics Specialist</Text>

        <TouchableOpacity 
  style={styles.aboutButton}
  onPress={() => router.push('/about')} // Adjust path based on your file structure
>
  <MaterialCommunityIcons name="information" size={24} color="#fff" />
  <Text style={styles.aboutText}>About Us</Text>
</TouchableOpacity>

        {/* Welcome Text */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome!</Text>
          
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/(tabs)" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/SignUp" asChild>
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
        
         </View>  
         {/* ADD THIS LINE */}
         </SafeAreaView>

      
      

    
    </View>
    </ScrollView> 
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
    backgroundColor: 'rgba(166, 166, 167, 0)',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {   // ADD THIS WHOLE BLOCK
    width: '100%',
    maxWidth: 450,   // Change this number to make it wider/narrower
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparent white
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    width: '100%', 
    borderColor: '#fff',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparent white
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    width: '100%', 
    borderColor: '#fff',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  aboutButton: {
  position: 'absolute',
  top: 50,
  right: 20,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#fff',
  gap: 6,
},
aboutText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
});