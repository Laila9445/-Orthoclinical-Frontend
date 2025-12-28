import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const { width } = Dimensions.get('window');

const mockPrescriptions = [
  {
    id: 1,
    patientId: 'P-2024-001',
    medication: 'Amoxicillin',
    dosage: '500mg',
    instructions: 'Take twice daily with food',
    doctor: 'Dr. Ahmed Nabil',
    startDate: '2024-01-20',
    durationDays: 7,
    daysRemaining: 3,
    refillsRemaining: 1,
    status: 'active',
  },
  {
    id: 2,
    patientId: 'P-2024-001',
    medication: 'Ibuprofen',
    dosage: '400mg',
    instructions: 'Take as needed for pain',
    doctor: 'Dr. Laila Hassan',
    startDate: '2023-11-10',
    durationDays: 5,
    daysRemaining: 0,
    refillsRemaining: 0,
    status: 'completed',
    endDate: '2023-11-15',
  },
];

const TABS = ['active', 'history'];
const CARD_WIDTH = Math.min(720, width - 24);

const MyPrescriptionsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const patientId = user?.patientId || 'P-2024-001';

  const [activeTab, setActiveTab] = useState('active');
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get(`/api/Prescriptions/patient/${user?.userId}`);
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      // Handle 404 or empty response gracefully
      if (error.response?.status === 404) {
        setPrescriptions([]);
      } else {
        Alert.alert('Error', 'Failed to load prescriptions');
      }
    }
  };

  const activeList = prescriptions.filter((p) => p.status === 'active');
  const historyList = prescriptions.filter((p) => p.status !== 'active');

  const openDetails = (presc) => {
    setSelected(presc);
    setModalVisible(true);
  };

  const requestRefill = async (presc) => {
    try {
      await api.post(`/api/Prescriptions/${presc.id}/refill`);
      Alert.alert('Success', 'Refill request sent successfully');
    } catch (error) {
      console.error('Error requesting refill:', error);
      Alert.alert('Error', 'Failed to send refill request');
    }
  };

  const downloadPdf = (presc) => {
    // For now, just show an alert - in a real app you would download the PDF
    Alert.alert('Download', 'Downloading prescription PDF...');
  };

  const renderProgress = (p) => {
    const duration = p.durationDays || 0;
    const daysRemaining = p.daysRemaining != null ? p.daysRemaining : 0;
    const daysTaken = Math.max(0, duration - daysRemaining);
    const pct = duration > 0 ? Math.round((daysTaken / duration) * 100) : 0;
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, Math.max(0, pct))}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{daysTaken}/{duration} days</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Prescriptions</Text>

        <View style={styles.headerRight} />
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
              {t === 'active' ? 'Active' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'active' && activeList.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pill-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No active prescriptions</Text>
          </View>
        )}

        {activeTab === 'history' && historyList.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pill-off" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No prescription history</Text>
          </View>
        )}

        {activeTab === 'active' &&
          activeList.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="pill" size={28} color="#007BFF" />
                <View style={styles.cardTitleWrap}>
                  <Text style={styles.medName}>
                    {p.medication} {p.dosage}
                  </Text>
                  <Text style={styles.instructions}>{p.instructions}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.meta}>Prescribed by: <Text style={styles.metaBold}>{p.doctor}</Text></Text>
                <Text style={styles.meta}>Start date: {p.startDate}</Text>
                <Text style={styles.meta}>Duration: {p.durationDays} days</Text>
                <Text style={styles.meta}>Refills remaining: {p.refillsRemaining != null ? p.refillsRemaining : '-'}</Text>

                {renderProgress(p)}
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => openDetails(p)}>
                  <Ionicons name="eye" size={18} color="#007BFF" />
                  <Text style={styles.actionText}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => requestRefill(p)}>
                  <Ionicons name="repeat" size={18} color="#007BFF" />
                  <Text style={styles.actionText}>Request Refill</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={() => downloadPdf(p)}>
                  <Ionicons name="download" size={18} color="#007BFF" />
                  <Text style={styles.actionText}>Download PDF</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

        {activeTab === 'history' &&
          historyList.map((p) => (
            <View key={p.id} style={[styles.card, styles.cardHistory]}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="pill" size={28} color="#999" />
                <View style={styles.cardTitleWrap}>
                  <Text style={[styles.medName, styles.historyText]}>
                    {p.medication} {p.dosage}
                  </Text>
                  <Text style={[styles.instructions, styles.historyText]}>{p.instructions}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={[styles.meta, styles.historyText]}>Prescribed by: <Text style={styles.metaBold}>{p.doctor}</Text></Text>
                <Text style={[styles.meta, styles.historyText]}>Start date: {p.startDate}</Text>
                <Text style={[styles.meta, styles.historyText]}>End date: {p.endDate || '-'}</Text>
              </View>
            </View>
          ))}
      </ScrollView>

      {/* Details Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Prescription Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selected && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalMed}>{selected.medication} {selected.dosage}</Text>
                <Text style={styles.modalText}>Instructions: {selected.instructions}</Text>
                <Text style={styles.modalText}>Prescribed by: {selected.doctor}</Text>
                <Text style={styles.modalText}>Start date: {selected.startDate}</Text>
                <Text style={styles.modalText}>Duration: {selected.durationDays} days</Text>
                <Text style={styles.modalText}>Refills remaining: {selected.refillsRemaining != null ? selected.refillsRemaining : '-'}</Text>
                <View style={{ height: 24 }} />
                <TouchableOpacity style={styles.primaryButton} onPress={() => { setModalVisible(false); requestRefill(selected); }}>
                  <Text style={styles.primaryButtonText}>Request Refill</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryButton, styles.secondaryButton]} onPress={() => { setModalVisible(false); downloadPdf(selected); }}>
                  <Text style={[styles.primaryButtonText, styles.secondaryButtonText]}>Download PDF</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 6 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerRight: { width: 36 },

  tabs: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F5F7FA' },
  tabItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, marginRight: 8 },
  tabItemActive: { backgroundColor: '#E8F3FF' },
  tabText: { color: '#666', fontSize: 14, fontWeight: '600' },
  tabTextActive: { color: '#007BFF' },

  content: { padding: 12, paddingBottom: 40 },

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
  cardHistory: { opacity: 0.6, backgroundColor: '#FBFBFB' },

  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardTitleWrap: { flex: 1 },
  medName: { fontSize: 16, fontWeight: '700', color: '#333' },
  instructions: { fontSize: 13, color: '#666', marginTop: 4 },

  cardBody: { marginTop: 10 },
  meta: { fontSize: 13, color: '#666', marginTop: 6 },
  metaBold: { color: '#333', fontWeight: '700' },

  progressContainer: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressBarBackground: { flex: 1, height: 8, backgroundColor: '#F0F0F0', borderRadius: 8, marginRight: 12 },
  progressBarFill: { height: 8, backgroundColor: '#007BFF', borderRadius: 8 },
  progressLabel: { fontSize: 12, color: '#666' },

  actionsRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  actionButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  actionText: { marginLeft: 6, color: '#007BFF', fontWeight: '700' },

  emptyState: { alignItems: 'center', marginTop: 48 },
  emptyText: { color: '#666', fontSize: 16, marginTop: 12 },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', paddingBottom: 24, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  modalBody: { padding: 16 },
  modalMed: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  modalText: { fontSize: 14, color: '#666', marginTop: 8 },

  primaryButton: { minHeight: 50, backgroundColor: '#007BFF', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12, marginHorizontal: 16 },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#007BFF' },
  secondaryButtonText: { color: '#007BFF' },

  historyText: { color: '#999' },
});

export default MyPrescriptionsScreen;
