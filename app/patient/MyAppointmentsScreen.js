import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const mockAppointments = [
  {
    id: 1,
    patientId: 'P-2024-001',
    date: '2024-02-01',
    time: '10:00 AM',
    doctorName: 'Dr. Ahmed Nabel',
    specialty: 'Orthopedic Surgeon',
    clinic: 'Zayed Clinic',
    status: 'confirmed', // upcoming
  },
  {
    id: 2,
    patientId: 'P-2024-001',
    date: '2023-12-10',
    time: '02:00 PM',
    doctorName: 'Dr. Laila Hassan',
    specialty: 'General Practitioner',
    clinic: 'City Clinic',
    status: 'completed', // past
  },
  {
    id: 3,
    patientId: 'P-2024-001',
    date: '2024-01-15',
    time: '11:00 AM',
    doctorName: 'Dr. Samir Ali',
    specialty: 'Cardiology',
    clinic: 'Heart Center',
    status: 'cancelled',
  },
];

const TABS = ['upcoming', 'past', 'cancelled'];

const MyAppointmentsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const patientId = user?.patientId || 'P-2024-001';
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, [user?.userId]);

  const fetchAppointments = async () => {
    try {
      const response = await api.get(`/api/Appointments/my-appointments`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Handle 404 or empty response gracefully
      if (error.response?.status === 404) {
        setAppointments([]);
      } else {
        Alert.alert('Error', 'Failed to load appointments');
      }
    }
  };

  const filtered = appointments.filter((a) => {
    if (activeTab === 'upcoming') return a.status === 'confirmed' || a.status === 'pending';
    if (activeTab === 'past') return a.status === 'completed';
    if (activeTab === 'cancelled') return a.status === 'cancelled';
    return false;
  });

  const statusBadge = (status) => {
    if (status === 'confirmed') return { label: 'Confirmed', color: '#28A745' };
    if (status === 'pending') return { label: 'Pending', color: '#FF9800' };
    if (status === 'completed') return { label: 'Completed', color: '#6C757D' };
    if (status === 'cancelled') return { label: 'Cancelled', color: '#DC3545' };
    return { label: status, color: '#6C757D' };
  };

  const handleGetDirections = (apt) => {
    // Define clinic-specific Google Maps directions URLs
    // Map the clinic names to the appropriate URLs
    const clinicNameMap = {
      'Zayed Clinic': 'Zayed Clinic',
      'October Clinic': 'October Clinic',
      'Dokki Clinic': 'Dokki Clinic',
      'sz': 'Zayed Clinic',
      '6o': 'October Clinic',
      'dk': 'Dokki Clinic',
      'Zayed': 'Zayed Clinic',
      'October': 'October Clinic',
      'Dokki': 'Dokki Clinic',
    };
      
    const clinicDirections = {
      'Zayed Clinic': 'https://www.google.com/maps/dir/30.0283184,30.9761487/%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9+%D8%A7%D9%84%D8%B9%D8%B8%D8%A7%D9%85+%D9%88+%D8%A7%D9%84%D9%85%D9%81%D8%A7%D8%B5%D9%84+%D9%88+%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B8%D9%8A%D8%B1+%D8%AF+%D8%A3%D8%AD%D9%85%D8%AF+%D9%86%D8%A8%D9%8A%D9%84+%D8%B9%D9%85%D8%A7%D8%B1%D8%A9,+clinic+83,+Cairo+Medical+Center,+Al+Mehwar+Al+Markazi,+October,+Giza+Governorate+12573%E2%80%AD%E2%80%AD/@29.9944003,30.8774845,12z/data=!3m1!4b1!4m9!4m8!1m1!4e1!1m5!1m1!1s0x1458567250f336bf:0xb766a0f14591c5ba!2m2!1d30.9178161!2d29.9554748?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D',
      'October Clinic': 'https://www.google.com/maps/dir//%D8%B9%D9%8A%D8%A7%D8%AF%D8%A9+%D8%A7%D9%84%D8%B9%D8%B8%D8%A7%D9%85+%D9%88+%D8%A7%D9%84%D9%85%D9%81%D8%A7%D8%B5%D9%84+%D9%88+%D8%A7%D9%84%D9%85%D9%86%D8%A7%D8%B8%D9%8A%D8%B1+%D8%AF+%D8%A3%D8%AD%D9%85%D8%AF+%D9%86%D8%A8%D9%8A%D9%84+%D8%B9%D9%85%D8%A7%D8%B1%D8%A9,+clinic+83,+Cairo+Medical+Center,+Al+Mehwar+Al+Markazi,+October,+Giza+Governorate+12573%E2%80%AD/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x1458567250f336bf:0xb766a0f14591c5ba?sa=X&ved=1t:57443&ictx=111',
      'Dokki Clinic': 'https://www.google.com/search?q=Ahmed+nabil+clinic+location+in+doqi%3F&sca_esv=8e96b00d1f23abc8&sxsrf=AE3TifOy_GtX4f2MwlAcBiE2QPjrfFraLQ%3A1766912951534&ei=t_NQaeqWIO6M9u8PuIivQA&ved=0ahEKEwiqzszW99-RAxVuhv0HHTjECwgQ4dUDCBE&uact=5&oq=Ahmed+nabil+clinic+location+in+doqi%3F&gs_lpEgxnd3Mtd2l6LXNlcnAiJEFobWVkIG5hYmlsIGNsaW5pYyBsb2NhdGlvbiBpbiBkb3FpPzIIECEYoAEYwwQyCBAhGKABGMMEMggQIRigARjDBDIIECEYoAEYwwRI4CdQmQRYwAhwAXgAkAEAmAH8D6AB1iqqAQU4LTIuMbgBA8gBAPgBAZgCAqACjw3CAgsQABiABBiwAxiiBMICCBAAGLADGO8FwgILEAAYsAMYogQYiQWYAwCIBgGQBgWSBwUxLjctMaAH2wayBwM3LTG4B4oNwgcDMi0yyAcHgAgA&sclient=gws-wiz-serp&lqi=CiRBaG1lZCBuYWJpbCBjbGluaWMgbG9jYXRpb24gaW4gZG9xaT-SAQ5tZWRpY2FsX2NsaW5pYw#rlimm=6331493777668516663',
    };
      
    const mappedClinicName = clinicNameMap[apt.clinic] || 'Zayed Clinic'; // default to Zayed Clinic
    const directionsUrl = clinicDirections[mappedClinicName];
      
    Linking.openURL(directionsUrl).catch(err => console.error('An error occurred', err));
  };

  const handleReschedule = (apt) => {
    // Navigate to the booking screen to reschedule
    router.push(`/Appointments?appointmentId=${apt.id}`);
    
    // Store appointment data for rescheduling
    const appointmentData = {
      date: apt.date,
      time: apt.time,
      doctor: apt.doctorName,
      clinic: apt.clinic,
      patientName: apt.patientName || user?.firstName + ' ' + user?.lastName,
      patientPhone: apt.patientPhone || user?.phoneNumber
    };
    
    // Save appointment data for rescheduling (in case needed)
    AsyncStorage.setItem('reschedulingAppointment', JSON.stringify(appointmentData));
  };

  const handleCancel = (aptId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/api/Appointments/cancel`, {
                appointmentId: aptId
              }, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              setAppointments((prev) => prev.map((a) => (a.id === aptId ? { ...a, status: 'cancelled' } : a)));
              Alert.alert('Cancelled', 'Appointment has been cancelled.');
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Appointments</Text>

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() =>
            router.push('/Appointments')
          }
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.bookButtonText}>Book New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            style={[styles.tabItem, activeTab === t && styles.tabItemActive]}
          >
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No {activeTab} appointments</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push('/Appointments')
              }
            >
              <Text style={styles.primaryButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((apt) => {
            const badge = statusBadge(apt.status);
            const isUpcoming = apt.status === 'confirmed' || apt.status === 'pending';
            return (
              <View key={apt.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.aptDate}>{apt.date}</Text>
                    <Text style={styles.aptTime}>{apt.time}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.color }]}>
                    <Text style={styles.badgeText}>{badge.label}</Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.doctorName}>{apt.doctorName}</Text>
                  <Text style={styles.doctorMeta}>
                    {apt.specialty} � {apt.clinic}
                  </Text>
                </View>

                {isUpcoming && (
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleGetDirections(apt)}>
                      <Ionicons name="navigate" size={20} color="#007BFF" />
                      <Text style={styles.iconButtonText}>Get Directions</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.iconButton} onPress={() => handleReschedule(apt)}>
                      <Ionicons name="time" size={20} color="#007BFF" />
                      <Text style={styles.iconButtonText}>Reschedule</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.iconButton, styles.cancelButton]} onPress={() => handleCancel(apt.id)}>
                      <Ionicons name="close-circle" size={20} color="#DC3545" />
                      <Text style={[styles.iconButtonText, { color: '#DC3545' }]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const CARD_WIDTH = Math.min(720, width - 24);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F5F7FA',
    justifyContent: 'space-between',
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  tabItemActive: {
    backgroundColor: '#E8F3FF',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#007BFF',
  },
  content: {
    padding: 12,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    width: CARD_WIDTH,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aptDate: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  aptTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  cardBody: {
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  doctorMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
  },
  iconButtonText: {
    marginLeft: 8,
    color: '#007BFF',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#FFF5F5',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  primaryButton: {
    minHeight: 50,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default MyAppointmentsScreen;