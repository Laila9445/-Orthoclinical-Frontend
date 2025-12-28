import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const PatientDashboardScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const mockAppointment = {
    date: 'February 1, 2025',
    time: '10:00 AM',
    doctor: 'Dr. Ahmed Nabel',
    clinic: 'Zayed Clinic'
  };

  const hasAppointment = true; // Set to true to show the appointment section

  const handleContactDoctor = () => {
    Alert.alert('Contact Doctor', 'Call +20 100 123 4567');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.patientName}>{user?.name || 'Patient'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/patient/PatientProfileScreen')}
          >
            <Ionicons name="person-circle-outline" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats Cards (Simple Row - 3 cards) */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/patient/MyAppointmentsScreen')}
          >
            <Ionicons name="calendar" size={28} color="#007BFF" />
            <Text style={styles.statValue}>Feb 1, 10:00 AM</Text>
            <Text style={styles.statLabel}>Next Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/patient/MyPrescriptionsScreen')}
          >
            <MaterialCommunityIcons name="pill" size={28} color="#007BFF" />
            <Text style={styles.statValue}>2 medications</Text>
            <Text style={styles.statLabel}>Active Medications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/patient/MyMedicalRecordsScreen')}
          >
            <MaterialCommunityIcons name="file-document" size={28} color="#007BFF" />
            <Text style={styles.statValue}>5 visits</Text>
            <Text style={styles.statLabel}>Medical Records</Text>
          </TouchableOpacity>
        </View>

        {/* Next Appointment Section */}
        {hasAppointment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
            <View style={styles.appointmentCard}>
              <Text style={styles.appointmentDate}>{mockAppointment.date}</Text>
              <Text style={styles.appointmentTime}>{mockAppointment.time}</Text>
              <Text style={styles.appointmentDoctor}>Doctor: {mockAppointment.doctor}</Text>
              <Text style={styles.appointmentClinic}>Location: {mockAppointment.clinic}</Text>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => router.push('/patient/MyAppointmentsScreen')}
              >
                <Text style={styles.detailsButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions (Simple 2x2 Grid) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/Appointments')}
              >
                <Text style={styles.actionButtonText}>Book Appointment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/patient/MyMedicalRecordsScreen')}
              >
                <Text style={styles.actionButtonText}>My Records</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gridRow}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleContactDoctor}
              >
                <Text style={styles.actionButtonText}>Contact Doctor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/patient/PatientProfileScreen')}
              >
                <Text style={styles.actionButtonText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#007BFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
  },
  patientName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007BFF',
    marginTop: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  appointmentTime: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  appointmentDoctor: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  appointmentClinic: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  detailsButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gridContainer: {

  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    flex: 0.48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
  },
});

export default PatientDashboardScreen;