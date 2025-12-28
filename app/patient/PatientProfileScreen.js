import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const PatientProfileScreen = () => {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();

  // Local editable fields
  const [photoUri, setPhotoUri] = useState(user?.photo || null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [address, setAddress] = useState(user?.address || '');
  const [emergencyName, setEmergencyName] = useState(user?.emergencyName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyPhone || '');

  // Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notifications ?? true
  );
  const [language, setLanguage] = useState(user?.preferences?.language ?? 'English');
  const [privacyStrict, setPrivacyStrict] = useState(user?.preferences?.privacyStrict ?? false);

  // Read-only medical / insurance (from user or fallback mocks)
  const medical = user?.medicalInfo || {
    allergies: ['Penicillin'],
    chronicConditions: ['Type 2 Diabetes'],
    bloodType: 'O+',
    currentMedications: ['Metformin 500mg'],
  };

  const insurance = user?.insurance || {
    provider: 'HealthCare Co.',
    policyNumber: 'HC-2024-001',
    expiry: '2025-12-31',
  };

  useEffect(() => {
    setPhotoUri(user?.photo || null);
    setPhone(user?.phone || '');
    setEmail(user?.email || '');
    setAddress(user?.address || '');
    setEmergencyName(user?.emergencyName || '');
    setEmergencyPhone(user?.emergencyPhone || '');
    setNotificationsEnabled(user?.preferences?.notifications ?? true);
    setLanguage(user?.preferences?.language ?? 'English');
    setPrivacyStrict(user?.preferences?.privacyStrict ?? false);
  }, [user]);

  const pickImage = async () => {
    try {
      const permission =
        Platform.OS === 'web'
          ? { granted: true }
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission required', 'Please grant gallery permissions to change photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.cancelled) {
        setPhotoUri(result.uri);
        // Persist photo to profile
        await updateProfile({ photo: result.uri });
        Alert.alert('Profile', 'Profile photo updated');
      }
    } catch (err) {
      console.error('ImagePicker error', err);
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const handleUpdate = async () => {
    try {
      const profileData = {
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        emergencyName: emergencyName.trim(),
        emergencyPhone: emergencyPhone.trim(),
        // Save settings under preferences
        preferences: {
          notifications: notificationsEnabled,
          language,
          privacyStrict,
        },
        // Keep photo if set
        photo: photoUri,
      };

      const res = await updateProfile(profileData);
      if (res?.success) {
        Alert.alert('Success', 'Profile updated');
      } else {
        Alert.alert('Error', res?.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update profile error', err);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    
    // For now, we'll use a simple approach to change password
    // In a real app, you'd navigate to a proper password change screen
    Alert.alert(
      'Change Password',
      'Would you like to change your password?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change',
          onPress: () => {
            // Navigate to a proper password change screen
            Alert.alert('Info', 'Please contact support to change your password or use the forgot password feature on login screen');
          },
        },
      ]
    );
  };

  const handleDownloadProfile = () => {
    Alert.alert('Feature Coming Soon', 'Medical profile download is not yet implemented in this version.');
  };

  const handleLogout = async () => {
    await logout();
    // Replace with login route
    router.replace('/LoginScreen');
  };

  const ageText = user?.age ? `${user.age} yrs` : '—';
  const mrn = user?.mrn || user?.mrnNumber || 'MRN-000';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileLeft}>
            <TouchableOpacity onPress={pickImage} style={styles.photoWrapper} accessibilityLabel="Change profile photo">
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Text style={styles.name}>{user?.name || 'Patient Name'}</Text>
              <Text style={styles.mrn}>{mrn}</Text>
              <Text style={styles.demographics}>
                {ageText} • {user?.bloodType ?? 'Blood: —'} • {user?.gender ?? 'Gender: —'}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity onPress={handleUpdate}>
              <Text style={styles.sectionAction}>Update</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput value={phone} onChangeText={setPhone} style={styles.input} keyboardType="phone-pad" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Address</Text>
            <TextInput value={address} onChangeText={setAddress} style={styles.input} />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Emergency Contact</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput value={emergencyName} onChangeText={setEmergencyName} style={[styles.input, { flex: 2 }]} placeholder="Name" />
              <TextInput value={emergencyPhone} onChangeText={setEmergencyPhone} style={[styles.input, { flex: 1 }]} placeholder="Phone" keyboardType="phone-pad" />
            </View>
          </View>

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>Update</Text>
          </TouchableOpacity>
        </View>

        {/* Medical Information (read-only) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
          </View>

          <View style={styles.readRow}>
            <Text style={styles.label}>Allergies</Text>
            <View style={styles.allergyRow}>
              {medical.allergies && medical.allergies.length > 0 ? (
                <>
                  <Text style={styles.warning}>⚠️</Text>
                  <Text style={styles.value}>{medical.allergies.join(', ')}</Text>
                </>
              ) : (
                <Text style={styles.value}>None</Text>
              )}
            </View>
          </View>

          <View style={styles.readRow}>
            <Text style={styles.label}>Chronic Conditions</Text>
            <Text style={styles.value}>{medical.chronicConditions?.join(', ') || '—'}</Text>
          </View>

          <View style={styles.readRow}>
            <Text style={styles.label}>Blood Type</Text>
            <Text style={styles.value}>{medical.bloodType || '—'}</Text>
          </View>

          <View style={styles.readRow}>
            <Text style={styles.label}>Current Medications</Text>
            <Text style={styles.value}>{medical.currentMedications?.join(', ') || '—'}</Text>
          </View>
        </View>

        {/* Insurance Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Insurance</Text>
          </View>

          <View style={styles.readRow}>
            <Text style={styles.label}>Provider</Text>
            <Text style={styles.value}>{insurance.provider}</Text>
          </View>

          <View style={styles.readRow}>
            <Text style={styles.label}>Policy #</Text>
            <Text style={styles.value}>{insurance.policyNumber}</Text>
          </View>

          <View style={styles.readRow}>
            <Text style={styles.label}>Expiry</Text>
            <Text style={styles.value}>{insurance.expiry}</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={handleChangePassword}>
            <Text style={styles.settingLabel}>Change password</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Language</Text>
            <View style={styles.langRow}>
              <TouchableOpacity onPress={() => setLanguage('English')} style={[styles.langButton, language === 'English' && styles.langActive]}>
                <Text style={[styles.langText, language === 'English' && styles.langTextActive]}>English</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLanguage('Arabic')} style={[styles.langButton, language === 'Arabic' && styles.langActive]}>
                <Text style={[styles.langText, language === 'Arabic' && styles.langTextActive]}>Arabic</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Privacy settings</Text>
            <Switch value={privacyStrict} onValueChange={setPrivacyStrict} />
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownloadProfile}>
            <MaterialCommunityIcons name="file-download-outline" size={20} color="#007BFF" />
            <Text style={styles.downloadText}>Download Medical Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  scroll: { paddingBottom: 24 },

  header: {
    backgroundColor: '#007BFF',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  profileLeft: { flexDirection: 'row', alignItems: 'center' },
  photoWrapper: { marginRight: 12 },
  photo: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: '#fff' },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#EAF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 34, color: '#007BFF', fontWeight: '800' },

  headerInfo: { marginLeft: 8 },
  name: { color: '#fff', fontSize: 20, fontWeight: '700' },
  mrn: { color: '#EAF4FF', fontSize: 13, marginTop: 4 },
  demographics: { color: '#EAF4FF', marginTop: 6 },

  section: {
    marginTop: 12,
    marginHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  sectionAction: { color: '#007BFF', fontWeight: '700' },

  field: { marginBottom: 10 },
  label: { fontSize: 13, color: '#666', marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },

  updateButton: {
    marginTop: 8,
    minHeight: 50,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonText: { color: '#fff', fontWeight: '700' },

  readRow: { marginBottom: 8 },
  allergyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  warning: { fontSize: 16 },
  value: { fontSize: 14, color: '#333' },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingLabel: { fontSize: 14, color: '#333', fontWeight: '600' },

  langRow: { flexDirection: 'row', gap: 8 },
  langButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F5F7FA' },
  langActive: { backgroundColor: '#E8F3FF' },
  langText: { color: '#666', fontWeight: '700' },
  langTextActive: { color: '#007BFF' },

  bottomActions: { marginHorizontal: 12, marginTop: 14 },
  downloadButton: {
    minHeight: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  downloadText: { color: '#007BFF', fontWeight: '700' },

  logoutButton: {
    minHeight: 50,
    backgroundColor: '#DC3545',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: { color: '#fff', fontWeight: '700' },
});

export default PatientProfileScreen;