import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Mock visit data for testing
const mockVisits = [
  {
    id: 1,
    patientId: 'P-2024-001',
    date: '2025-12-05',
    doctor: 'Dr. Ahmed Nabel',
    specialty: 'Orthopedics',
    reason: 'Knee pain after fall',
    diagnosis: 'Medial meniscus tear',
    notes:
      'Patient reports sharp pain on lateral movement. Exam: limited ROM, swelling. Ordered MRI. Advised rest and ice. Follow-up in 2 weeks.',
    medications: [{ name: 'Ibuprofen 400mg', frequency: 'TID' }],
    labs: [{ test: 'MRI Knee', status: 'ordered' }],
    followUp: 'Follow-up after MRI or sooner if worsening.',
  },
  {
    id: 2,
    patientId: 'P-2024-001',
    date: '2025-08-20',
    doctor: 'Dr. Laila Hassan',
    specialty: 'General Practice',
    reason: 'Cough and fever',
    diagnosis: 'Acute bronchitis',
    notes:
      'Symptoms for 5 days. Lungs: scattered wheeze. Started supportive care. Prescribed amoxicillin for suspected bacterial superinfection.',
    medications: [{ name: 'Amoxicillin 500mg', frequency: 'BID' }],
    labs: [{ test: 'CBC', status: 'normal' }],
    followUp: 'Return if fever persists beyond 72 hours.',
  },
  {
    id: 3,
    patientId: 'P-2024-001',
    date: '2024-11-10',
    doctor: 'Dr. Samir Ali',
    specialty: 'Cardiology',
    reason: 'Chest discomfort on exertion',
    diagnosis: 'Stable angina',
    notes:
      'Chest discomfort with exertion, ECG shows no acute changes. Started on low-dose aspirin and statin. Referred for stress test.',
    medications: [
      { name: 'Aspirin 81mg', frequency: 'QD' },
      { name: 'Atorvastatin 20mg', frequency: 'QD' },
    ],
    labs: [{ test: 'Lipid panel', status: 'abnormal' }],
    followUp: 'Cardiology clinic after stress test.',
  },
  {
    id: 4,
    patientId: 'P-2023-04-01',
    date: '2023-04-01',
    doctor: 'Dr. Rana Qassim',
    specialty: 'Dermatology',
    reason: 'Rash',
    diagnosis: 'Eczema',
    notes: 'Topical steroid prescribed. Avoid triggers.',
    medications: [{ name: 'Hydrocortisone cream', frequency: 'apply BID' }],
    labs: [],
    followUp: 'PRN.',
  },
];

const DATE_FILTERS = {
  MONTH: 'month',
  THREE_MONTHS: '3months',
  YEAR: 'year',
  ALL: 'all',
};

const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
};

const withinRange = (isoDate, filter) => {
  if (!isoDate) return false;
  const date = new Date(isoDate);
  const now = new Date();
  switch (filter) {
    case DATE_FILTERS.MONTH: {
      const past = new Date(now);
      past.setMonth(now.getMonth() - 1);
      return date >= past;
    }
    case DATE_FILTERS.THREE_MONTHS: {
      const past = new Date(now);
      past.setMonth(now.getMonth() - 3);
      return date >= past;
    }
    case DATE_FILTERS.YEAR: {
      const past = new Date(now);
      past.setFullYear(now.getFullYear() - 1);
      return date >= past;
    }
    case DATE_FILTERS.ALL:
    default:
      return true;
  }
};

const MyMedicalRecordsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const patientId = user?.patientId || 'P-2024-001';

  const [query, setQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS.THREE_MONTHS);
  const [expandedId, setExpandedId] = useState(null);

  // Filter mock data by patientId and the selected date range
  const visits = useMemo(() => {
    return mockVisits
      .filter((v) => v.patientId === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [patientId]);

  const visibleVisits = useMemo(() => {
    return visits.filter((v) => {
      // Date range filter
      if (!withinRange(v.date, dateFilter)) return false;

      // Search by diagnosis or doctor (case-insensitive)
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        (v.diagnosis && v.diagnosis.toLowerCase().includes(q)) ||
        (v.doctor && v.doctor.toLowerCase().includes(q)) ||
        (v.reason && v.reason.toLowerCase().includes(q))
      );
    });
  }, [visits, dateFilter, query]);

  const handleToggleDetails = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical Records</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search + Filters */}
      <View style={styles.controls}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#666" style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by diagnosis, doctor or reason..."
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterButton, dateFilter === DATE_FILTERS.MONTH && styles.filterButtonActive]}
            onPress={() => setDateFilter(DATE_FILTERS.MONTH)}
          >
            <Text style={[styles.filterText, dateFilter === DATE_FILTERS.MONTH && styles.filterTextActive]}>Last month</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, dateFilter === DATE_FILTERS.THREE_MONTHS && styles.filterButtonActive]}
            onPress={() => setDateFilter(DATE_FILTERS.THREE_MONTHS)}
          >
            <Text style={[styles.filterText, dateFilter === DATE_FILTERS.THREE_MONTHS && styles.filterTextActive]}>3 months</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, dateFilter === DATE_FILTERS.YEAR && styles.filterButtonActive]}
            onPress={() => setDateFilter(DATE_FILTERS.YEAR)}
          >
            <Text style={[styles.filterText, dateFilter === DATE_FILTERS.YEAR && styles.filterTextActive]}>Year</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, dateFilter === DATE_FILTERS.ALL && styles.filterButtonActive]}
            onPress={() => setDateFilter(DATE_FILTERS.ALL)}
          >
            <Text style={[styles.filterText, dateFilter === DATE_FILTERS.ALL && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {visibleVisits.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No medical records found</Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            {visibleVisits.map((v, idx) => {
              const isExpanded = expandedId === v.id;
              const isLast = idx === visibleVisits.length - 1;
              return (
                <View key={v.id} style={styles.timelineItem}>
                  {/* Left timeline indicator */}
                  <View style={styles.timelineLeft}>
                    <View style={styles.lineContainer}>
                      <View style={styles.circle} />
                      {!isLast && <View style={styles.verticalLine} />}
                    </View>
                  </View>

                  {/* Card */}
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.dateText}>{formatDate(v.date)}</Text>
                      <TouchableOpacity onPress={() => handleToggleDetails(v.id)} style={styles.viewBtn}>
                        <Text style={styles.viewBtnText}>{isExpanded ? 'Hide Details' : 'View Details'}</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.docText}>
                      {v.doctor} • <Text style={styles.specialty}>{v.specialty}</Text>
                    </Text>

                    <Text style={styles.reasonText}>{v.reason}</Text>

                    <View style={styles.metaRow}>
                      <Text style={styles.label}>Diagnosis:</Text>
                      <Text style={styles.value}>{v.diagnosis}</Text>
                    </View>

                    {isExpanded && (
                      <View style={styles.expanded}>
                        <Text style={styles.sectionTitle}>Consultation Notes</Text>
                        <Text style={styles.sectionText}>{v.notes}</Text>

                        <Text style={styles.sectionTitle}>Medications</Text>
                        {v.medications && v.medications.length > 0 ? (
                          v.medications.map((m, i) => (
                            <Text key={i} style={styles.sectionText}>• {m.name} — {m.frequency}</Text>
                          ))
                        ) : (
                          <Text style={styles.sectionText}>None</Text>
                        )}

                        <Text style={styles.sectionTitle}>Lab tests</Text>
                        {v.labs && v.labs.length > 0 ? (
                          v.labs.map((l, i) => (
                            <Text key={i} style={styles.sectionText}>• {l.test} — {l.status}</Text>
                          ))
                        ) : (
                          <Text style={styles.sectionText}>None</Text>
                        )}

                        <Text style={styles.sectionTitle}>Follow-up</Text>
                        <Text style={styles.sectionText}>{v.followUp}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: {
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 6 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerRight: { width: 36 },

  controls: { padding: 12 },
  searchRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  clearBtn: { marginLeft: 8 },

  filterRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  filterButtonActive: {
    backgroundColor: '#E8F3FF',
    borderColor: '#E8F3FF',
  },
  filterText: { color: '#666', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#007BFF' },

  content: { paddingHorizontal: 12, paddingBottom: 40 },

  timeline: { marginTop: 8 },
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  timelineLeft: { width: 36, alignItems: 'center' },
  lineContainer: { alignItems: 'center', width: 36 },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007BFF',
    marginTop: 6,
  },
  verticalLine: {
    position: 'absolute',
    top: 24,
    width: 2,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 16, fontWeight: '700', color: '#333' },
  viewBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  viewBtnText: { color: '#007BFF', fontWeight: '700' },

  docText: { marginTop: 6, fontSize: 14, color: '#333' },
  specialty: { color: '#666', fontWeight: '600' },
  reasonText: { marginTop: 8, fontSize: 14, color: '#666' },
  metaRow: { marginTop: 8, flexDirection: 'row', gap: 8, alignItems: 'center' },
  label: { fontSize: 13, color: '#666', fontWeight: '600' },
  value: { fontSize: 13, color: '#333' },

  expanded: { marginTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginTop: 8 },
  sectionText: { fontSize: 13, color: '#666', marginTop: 6 },

  emptyState: { alignItems: 'center', marginTop: 48 },
  emptyText: { color: '#666', fontSize: 16, marginTop: 12 },
});

export default MyMedicalRecordsScreen;