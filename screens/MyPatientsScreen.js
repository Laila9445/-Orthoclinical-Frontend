import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const MyPatientsScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);

  // Sample patient data
  const [patients] = useState([
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      gender: 'Male',
      mrn: 'MRN-001',
      lastVisit: '2024-01-15',
      primaryCondition: 'Type 2 Diabetes',
      riskFlags: ['Allergies: Penicillin', 'Hypertension'],
      vitalSigns: {
        bp: '180/110',
        hr: '92',
        temp: '98.6',
        o2sat: '96',
      },
      medications: [
        { name: 'Metformin 500mg', frequency: 'BID' },
        { name: 'Lisinopril 10mg', frequency: 'QD' },
      ],
      labResults: [
        { test: 'HbA1c', value: '8.5%', date: '2024-01-10', status: 'abnormal' },
        { test: 'Glucose', value: '145 mg/dL', date: '2024-01-10', status: 'abnormal' },
      ],
      appointments: [
        { date: '2024-01-20', time: '10:00 AM', type: 'Follow-up' },
      ],
    },
    {
      id: 2,
      name: 'Soha Mohamed',
      age: 38,
      gender: 'Female',
      mrn: 'MRN-002',
      lastVisit: '2024-01-14',
      primaryCondition: 'Osteoarthritis',
      riskFlags: ['Asthma'],
      vitalSigns: {
        bp: '120/80',
        hr: '78',
        temp: '98.4',
        o2sat: '98',
      },
      medications: [
        { name: 'Ibuprofen 400mg', frequency: 'TID' },
        { name: 'Celecoxib 200mg', frequency: 'BID' },
      ],
      labResults: [
        { test: 'ESR', value: '25 mm/hr', date: '2024-01-12', status: 'normal' },
        { test: 'CRP', value: '3.2 mg/L', date: '2024-01-12', status: 'normal' },
      ],
      appointments: [
        { date: '2024-01-20', time: '10:30 AM', type: 'Follow-up' },
      ],
    },
    {
      id: 3,
      name: 'Michael Chen',
      age: 52,
      gender: 'Male',
      mrn: 'MRN-003',
      lastVisit: '2024-01-13',
      primaryCondition: 'Chronic Back Pain',
      riskFlags: [],
      vitalSigns: {
        bp: '130/85',
        hr: '88',
        temp: '98.7',
        o2sat: '97',
      },
      medications: [
        { name: 'Gabapentin 300mg', frequency: 'TID' },
      ],
      labResults: [
        { test: 'CBC', value: 'Normal', date: '2024-01-11', status: 'normal' },
      ],
      appointments: [
        { date: '2024-01-20', time: '11:00 AM', type: 'New' },
      ],
    },
  ]);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.mrn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Patients</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or MRN..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {filteredPatients.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search" size={60} color="#ccc" />
            <Text style={styles.emptyStateText}>No patients found</Text>
          </View>
        ) : (
          filteredPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.patientCard}
              onPress={() => openPatientDetails(patient)}
            >
              <View style={styles.patientHeader}>
                <View style={styles.patientAvatar}>
                  <Text style={styles.patientAvatarText}>
                    {patient.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <Text style={styles.patientDetails}>
                    {patient.age} years, {patient.gender} • MRN: {patient.mrn}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#999" />
              </View>

              <View style={styles.patientTags}>
                <View style={styles.conditionTag}>
                  <MaterialCommunityIcons name="medical-bag" size={16} color="#007BFF" />
                  <Text style={styles.conditionText}>{patient.primaryCondition}</Text>
                </View>
                {patient.riskFlags.length > 0 && (
                  <View style={styles.riskTag}>
                    <Ionicons name="warning" size={16} color="#FF9800" />
                    <Text style={styles.riskText}>{patient.riskFlags.length} Risk Flag(s)</Text>
                  </View>
                )}
              </View>

              <View style={styles.patientMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.metaText}>Last Visit: {patient.lastVisit}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="pill" size={16} color="#666" />
                  <Text style={styles.metaText}>{patient.medications.length} Medications</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Patient Details Modal */}
      <Modal
        visible={showPatientDetails}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPatientDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedPatient && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Patient Details</Text>
                  <TouchableOpacity onPress={() => setShowPatientDetails(false)}>
                    <Ionicons name="close" size={28} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  {/* Patient Info */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Patient Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Name:</Text>
                      <Text style={styles.detailValue}>{selectedPatient.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Age:</Text>
                      <Text style={styles.detailValue}>{selectedPatient.age} years</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Gender:</Text>
                      <Text style={styles.detailValue}>{selectedPatient.gender}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>MRN:</Text>
                      <Text style={styles.detailValue}>{selectedPatient.mrn}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Primary Condition:</Text>
                      <Text style={styles.detailValue}>{selectedPatient.primaryCondition}</Text>
                    </View>
                  </View>

                  {/* Risk Flags */}
                  {selectedPatient.riskFlags.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Risk Flags</Text>
                      {selectedPatient.riskFlags.map((flag, index) => (
                        <View key={index} style={styles.riskFlagItem}>
                          <Ionicons name="warning" size={18} color="#FF9800" />
                          <Text style={styles.riskFlagText}>{flag}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Vital Signs */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Vital Signs</Text>
                    <View style={styles.vitalsGrid}>
                      <View style={styles.vitalBox}>
                        <Text style={styles.vitalLabel}>Blood Pressure</Text>
                        <Text style={styles.vitalValue}>{selectedPatient.vitalSigns.bp}</Text>
                      </View>
                      <View style={styles.vitalBox}>
                        <Text style={styles.vitalLabel}>Heart Rate</Text>
                        <Text style={styles.vitalValue}>{selectedPatient.vitalSigns.hr} bpm</Text>
                      </View>
                      <View style={styles.vitalBox}>
                        <Text style={styles.vitalLabel}>Temperature</Text>
                        <Text style={styles.vitalValue}>{selectedPatient.vitalSigns.temp}°F</Text>
                      </View>
                      <View style={styles.vitalBox}>
                        <Text style={styles.vitalLabel}>O2 Saturation</Text>
                        <Text style={styles.vitalValue}>{selectedPatient.vitalSigns.o2sat}%</Text>
                      </View>
                    </View>
                  </View>

                  {/* Medications */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Active Medications</Text>
                    {selectedPatient.medications.map((med, index) => (
                      <View key={index} style={styles.medicationItem}>
                        <MaterialCommunityIcons name="pill" size={20} color="#007BFF" />
                        <View style={styles.medicationInfo}>
                          <Text style={styles.medicationName}>{med.name}</Text>
                          <Text style={styles.medicationFrequency}>{med.frequency}</Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Lab Results */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Recent Lab Results</Text>
                    {selectedPatient.labResults.map((lab, index) => (
                      <View
                        key={index}
                        style={[
                          styles.labResultItem,
                          lab.status === 'abnormal' && styles.abnormalLabResult,
                        ]}
                      >
                        <View style={styles.labResultHeader}>
                          <Text style={styles.labResultTest}>{lab.test}</Text>
                          <Text
                            style={[
                              styles.labResultStatus,
                              lab.status === 'abnormal' && styles.abnormalStatus,
                            ]}
                          >
                            {lab.status === 'abnormal' ? '⚠️ Abnormal' : '✓ Normal'}
                          </Text>
                        </View>
                        <Text style={styles.labResultValue}>{lab.value}</Text>
                        <Text style={styles.labResultDate}>Date: {lab.date}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Appointments */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Upcoming Appointments</Text>
                    {selectedPatient.appointments.map((apt, index) => (
                      <View key={index} style={styles.appointmentItem}>
                        <MaterialCommunityIcons name="calendar-clock" size={20} color="#007BFF" />
                        <View style={styles.appointmentInfo}>
                          <Text style={styles.appointmentDate}>
                            {apt.date} at {apt.time}
                          </Text>
                          <Text style={styles.appointmentType}>{apt.type}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#007BFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  placeholder: {
    width: 28,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
  },
  patientTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  conditionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  conditionText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#007BFF',
    fontWeight: '600',
  },
  riskTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  riskText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  patientMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
  },
  riskFlagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  riskFlagText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalBox: {
    width: '48%',
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  medicationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  medicationFrequency: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  labResultItem: {
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  abnormalLabResult: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#DC3545',
  },
  labResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  labResultTest: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  labResultStatus: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: '600',
  },
  abnormalStatus: {
    color: '#DC3545',
  },
  labResultValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  labResultDate: {
    fontSize: 12,
    color: '#666',
  },
  appointmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  appointmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  appointmentType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default MyPatientsScreen;

