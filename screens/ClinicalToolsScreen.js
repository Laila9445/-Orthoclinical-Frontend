import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { usePatient } from '../context/PatientContext';

const ClinicalToolsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    activePatient, 
    setActivePatient,
    savePrescription, 
    saveTestOrder, 
    saveDiagnosis, 
    saveClinicalNote,
    startConsultation 
  } = usePatient();
  
  // Try to set patient from params if provided and no active patient
  useEffect(() => {
    if (params?.patientId && params?.patientName && !activePatient) {
      const patient = {
        id: params.patientId,
        name: params.patientName,
        age: params.patientAge,
        mrn: params.patientMRN,
      };
      setActivePatient(patient);
      startConsultation(patient);
    }
  }, [params?.patientId, params?.patientName, activePatient, setActivePatient, startConsultation]);
  const [activeTab, setActiveTab] = useState('prescription');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showTestOrderModal, setShowTestOrderModal] = useState(false);
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showPatientSelectionModal, setShowPatientSelectionModal] = useState(false);
  
  // Sample patients for selection (in production, this would come from API)
  const [availablePatients] = useState([
    { id: 1, name: 'John Doe', age: 45, mrn: 'MRN-001' },
    { id: 2, name: 'Sarah Williams', age: 38, mrn: 'MRN-002' },
    { id: 3, name: 'Michael Chen', age: 52, mrn: 'MRN-003' },
    { id: 4, name: 'Emma Thompson', age: 34, mrn: 'MRN-004' },
  ]);

  // Prescription state
  const [medSearch, setMedSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');

  // Test order state
  const [testType, setTestType] = useState('');
  const [testPriority, setTestPriority] = useState('routine');
  const [testNotes, setTestNotes] = useState('');
  const [testDiagnosis, setTestDiagnosis] = useState('');

  // Diagnosis state
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');

  // Clinical notes state
  const [noteTemplate, setNoteTemplate] = useState('soap');
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Sample medications
  const medications = [
    'Metformin 500mg',
    'Lisinopril 10mg',
    'Ibuprofen 400mg',
    'Amoxicillin 500mg',
    'Aspirin 81mg',
    'Atorvastatin 20mg',
  ];

  // Sample ICD-10 codes
  const icd10Codes = [
    { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' },
    { code: 'M25.561', description: 'Pain in right knee' },
    { code: 'M25.562', description: 'Pain in left knee' },
    { code: 'M79.3', description: 'Panniculitis, unspecified' },
    { code: 'I10', description: 'Essential (primary) hypertension' },
    { code: 'M54.5', description: 'Low back pain' },
  ];

  const filteredMedications = medications.filter((med) =>
    med.toLowerCase().includes(medSearch.toLowerCase())
  );

  const filteredDiagnoses = icd10Codes.filter((diagnosis) =>
    diagnosis.code.toLowerCase().includes(diagnosisSearch.toLowerCase()) ||
    diagnosis.description.toLowerCase().includes(diagnosisSearch.toLowerCase())
  );

  const checkActivePatient = () => {
    if (!activePatient) {
      Alert.alert(
        'No Active Patient',
        'Please select a patient before using clinical tools.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Select Patient', onPress: () => setShowPatientSelectionModal(true) },
        ]
      );
      return false;
    }
    return true;
  };

  const handleSelectPatient = (patient) => {
    setActivePatient(patient);
    startConsultation(patient);
    setShowPatientSelectionModal(false);
    Alert.alert('Patient Selected', `Active patient set to: ${patient.name}`);
  };

  const handlePrescriptionSubmit = () => {
    if (!checkActivePatient()) return;
    
    if (!selectedMed || !dosage || !frequency || !duration) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    // Create prescription object with all data
    const prescription = {
      medication: selectedMed,
      dosage,
      frequency,
      duration,
      patientName: activePatient.name,
      date: new Date().toISOString(),
    };
    
    const result = savePrescription(prescription);
    
    if (result.success) {
      Alert.alert(
        'Success', 
        `Prescription saved successfully!\n\nPatient: ${activePatient.name}\nMedication: ${selectedMed}\nDosage: ${dosage}\nFrequency: ${frequency}\nDuration: ${duration}`
      );
      setShowPrescriptionModal(false);
      // Reset form
      setSelectedMed('');
      setMedSearch('');
      setDosage('');
      setFrequency('');
      setDuration('');
    } else {
      Alert.alert('Error', result.error || 'Failed to save prescription');
    }
  };

  const handleTestOrderSubmit = () => {
    if (!checkActivePatient()) return;
    
    if (!testType || !testPriority) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    // Create test order object with all data including diagnosis and notes
    const testOrder = {
      testType,
      testPriority,
      testNotes: testNotes.trim(),
      testDiagnosis: testDiagnosis.trim(),
      patientName: activePatient.name,
      patientId: activePatient.id,
      patientAge: activePatient.age,
      patientMRN: activePatient.mrn,
      date: new Date().toISOString(),
    };
    
    const result = saveTestOrder(testOrder);
    
    if (result.success) {
      Alert.alert(
        'Success', 
        `Test order submitted successfully!\n\nPatient: ${activePatient.name}\nTest: ${testType}\nPriority: ${testPriority}${testDiagnosis ? `\nDiagnosis: ${testDiagnosis}` : ''}${testNotes ? `\nNotes: ${testNotes}` : ''}`
      );
      setShowTestOrderModal(false);
      // Reset form
      setTestType('');
      setTestPriority('routine');
      setTestNotes('');
      setTestDiagnosis('');
    } else {
      Alert.alert('Error', result.error || 'Failed to save test order');
    }
  };

  const handleDiagnosisSubmit = () => {
    if (!checkActivePatient()) return;
    
    if (!selectedDiagnosis) {
      Alert.alert('Error', 'Please select a diagnosis code');
      return;
    }
    
    // Create diagnosis object with all data
    const diagnosis = {
      diagnosisCode: selectedDiagnosis,
      patientName: activePatient.name,
      patientId: activePatient.id,
      date: new Date().toISOString(),
    };
    
    const result = saveDiagnosis(diagnosis);
    
    if (result.success) {
      Alert.alert(
        'Success', 
        `Diagnosis code added successfully!\n\nPatient: ${activePatient.name}\nDiagnosis: ${selectedDiagnosis}`
      );
      setShowDiagnosisModal(false);
      // Reset form
      setSelectedDiagnosis('');
      setDiagnosisSearch('');
    } else {
      Alert.alert('Error', result.error || 'Failed to save diagnosis');
    }
  };

  const handleNotesSubmit = () => {
    if (!checkActivePatient()) return;
    
    if (!clinicalNotes.trim()) {
      Alert.alert('Error', 'Please enter clinical notes');
      return;
    }
    
    // Create notes object with all data - auto-assigned to active patient
    const notes = {
      noteTemplate,
      clinicalNotes: clinicalNotes.trim(),
      patientName: activePatient.name,
      patientId: activePatient.id,
      date: new Date().toISOString(),
    };
    
    const result = saveClinicalNote(notes);
    
    if (result.success) {
      Alert.alert(
        'Success', 
        `Clinical notes saved successfully!\n\nPatient: ${activePatient.name}\nTemplate: ${noteTemplate.toUpperCase()}\nNotes: ${clinicalNotes.substring(0, 50)}${clinicalNotes.length > 50 ? '...' : ''}`
      );
      setShowNotesModal(false);
      setClinicalNotes('');
    } else {
      Alert.alert('Error', result.error || 'Failed to save clinical notes');
    }
  };

  return (
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Clinical Tools</Text>
          {activePatient ? (
            <Text style={styles.patientNameHeader}>Current Patient: {activePatient.name}</Text>
          ) : (
            <TouchableOpacity onPress={() => setShowPatientSelectionModal(true)}>
              <Text style={styles.selectPatientLink}>Select Patient</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prescription' && styles.activeTab]}
          onPress={() => setActiveTab('prescription')}
        >
          <MaterialCommunityIcons
            name="prescription"
            size={20}
            color={activeTab === 'prescription' ? '#007BFF' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'prescription' && styles.activeTabText,
            ]}
          >
            Prescription
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'test' && styles.activeTab]}
          onPress={() => setActiveTab('test')}
        >
          <MaterialCommunityIcons
            name="clipboard-list"
            size={20}
            color={activeTab === 'test' ? '#007BFF' : '#666'}
          />
          <Text
            style={[styles.tabText, activeTab === 'test' && styles.activeTabText]}
          >
            Test Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'diagnosis' && styles.activeTab]}
          onPress={() => setActiveTab('diagnosis')}
        >
          <MaterialCommunityIcons
            name="medical-bag"
            size={20}
            color={activeTab === 'diagnosis' ? '#007BFF' : '#666'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'diagnosis' && styles.activeTabText,
            ]}
          >
            Diagnosis
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <MaterialCommunityIcons
            name="file-document"
            size={20}
            color={activeTab === 'notes' ? '#007BFF' : '#666'}
          />
          <Text
            style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}
          >
            Notes
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Prescription Tab */}
        {activeTab === 'prescription' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prescription Writer</Text>
              <Text style={styles.sectionDescription}>
                Search for medications and create prescriptions with dosage instructions
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (!activePatient) {
                    setShowPatientSelectionModal(true);
                  } else {
                    setShowPrescriptionModal(true);
                  }
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>New Prescription</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#007BFF" />
              <Text style={styles.infoText}>
                Quick tip: Use the search function to quickly find medications and check for drug interactions
              </Text>
            </View>
          </View>
        )}

        {/* Test Orders Tab */}
        {activeTab === 'test' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Test Orders</Text>
              <Text style={styles.sectionDescription}>
                Order laboratory tests, imaging studies, and other diagnostic procedures
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (!activePatient) {
                    setShowPatientSelectionModal(true);
                  } else {
                    setShowTestOrderModal(true);
                  }
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>New Test Order</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priorityInfo}>
              <Text style={styles.priorityTitle}>Priority Levels:</Text>
              <View style={styles.priorityItem}>
                <View style={[styles.priorityIndicator, { backgroundColor: '#DC3545' }]} />
                <Text style={styles.priorityText}>Urgent - Results needed immediately</Text>
              </View>
              <View style={styles.priorityItem}>
                <View style={[styles.priorityIndicator, { backgroundColor: '#FF9800' }]} />
                <Text style={styles.priorityText}>High - Results needed within 24 hours</Text>
              </View>
              <View style={styles.priorityItem}>
                <View style={[styles.priorityIndicator, { backgroundColor: '#007BFF' }]} />
                <Text style={styles.priorityText}>Routine - Standard processing time</Text>
              </View>
            </View>
          </View>
        )}

        {/* Diagnosis Tab */}
        {activeTab === 'diagnosis' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ICD-10 Diagnosis Codes</Text>
              <Text style={styles.sectionDescription}>
                Search and add diagnosis codes using ICD-10 classification
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (!activePatient) {
                    setShowPatientSelectionModal(true);
                  } else {
                    setShowDiagnosisModal(true);
                  }
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>Add Diagnosis Code</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#007BFF" />
              <Text style={styles.infoText}>
                ICD-10 codes are required for billing and medical documentation. Search by code or description.
              </Text>
            </View>
          </View>
        )}

        {/* Clinical Notes Tab */}
        {activeTab === 'notes' && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Clinical Notes</Text>
              <Text style={styles.sectionDescription}>
                Template-based note taking for patient encounters
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  if (!activePatient) {
                    setShowPatientSelectionModal(true);
                  } else {
                    setShowNotesModal(true);
                  }
                }}
              >
                <MaterialCommunityIcons name="plus-circle" size={24} color="#fff" />
                <Text style={styles.primaryButtonText}>New Clinical Note</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.templateInfo}>
              <Text style={styles.templateTitle}>Note Templates:</Text>
              <View style={styles.templateItem}>
                <Text style={styles.templateName}>SOAP</Text>
                <Text style={styles.templateDescription}>Subjective, Objective, Assessment, Plan</Text>
              </View>
              <View style={styles.templateItem}>
                <Text style={styles.templateName}>HPI</Text>
                <Text style={styles.templateDescription}>History of Present Illness</Text>
              </View>
              <View style={styles.templateItem}>
                <Text style={styles.templateName}>Physical Exam</Text>
                <Text style={styles.templateDescription}>Systematic physical examination</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Prescription Modal */}
      <Modal
        visible={showPrescriptionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrescriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Prescription</Text>
              <TouchableOpacity onPress={() => setShowPrescriptionModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {activePatient && (
              <View style={styles.currentPatientHeader}>
                <MaterialCommunityIcons name="account-circle" size={20} color="#007BFF" />
                <Text style={styles.currentPatientText}>
                  Current Patient: <Text style={styles.currentPatientName}>{activePatient.name}</Text>
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Search Medication</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter medication name..."
                  value={medSearch}
                  onChangeText={setMedSearch}
                />
                {medSearch.length > 0 && (
                  <View style={styles.suggestionsList}>
                    {filteredMedications.map((med, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setSelectedMed(med);
                          setMedSearch(med);
                        }}
                      >
                        <MaterialCommunityIcons name="pill" size={20} color="#007BFF" />
                        <Text style={styles.suggestionText}>{med}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Selected Medication</Text>
                <TextInput
                  style={styles.input}
                  value={selectedMed}
                  onChangeText={setSelectedMed}
                  placeholder="Medication name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dosage</Text>
                <TextInput
                  style={styles.input}
                  value={dosage}
                  onChangeText={setDosage}
                  placeholder="e.g., 500mg"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Frequency</Text>
                <TextInput
                  style={styles.input}
                  value={frequency}
                  onChangeText={setFrequency}
                  placeholder="e.g., BID, QD, TID"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="e.g., 30 days"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handlePrescriptionSubmit}
              >
                <Text style={styles.submitButtonText}>Save Prescription</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Test Order Modal */}
      <Modal
        visible={showTestOrderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTestOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Test Order</Text>
              <TouchableOpacity onPress={() => setShowTestOrderModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {activePatient && (
              <View style={styles.currentPatientHeader}>
                <MaterialCommunityIcons name="account-circle" size={20} color="#007BFF" />
                <Text style={styles.currentPatientText}>
                  Current Patient: <Text style={styles.currentPatientName}>{activePatient.name}</Text>
                  {activePatient.age && ` • Age: ${activePatient.age}`}
                  {activePatient.mrn && ` • MRN: ${activePatient.mrn}`}
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalScroll}>
              {/* Pre-filled Patient Info Section */}
              {activePatient && (
                <View style={styles.prefilledInfoCard}>
                  <Text style={styles.prefilledInfoTitle}>Patient Information</Text>
                  <View style={styles.prefilledInfoRow}>
                    <Text style={styles.prefilledInfoLabel}>Name:</Text>
                    <Text style={styles.prefilledInfoValue}>{activePatient.name}</Text>
                  </View>
                  {activePatient.age && (
                    <View style={styles.prefilledInfoRow}>
                      <Text style={styles.prefilledInfoLabel}>Age:</Text>
                      <Text style={styles.prefilledInfoValue}>{activePatient.age} years</Text>
                    </View>
                  )}
                  {activePatient.mrn && (
                    <View style={styles.prefilledInfoRow}>
                      <Text style={styles.prefilledInfoLabel}>MRN:</Text>
                      <Text style={styles.prefilledInfoValue}>{activePatient.mrn}</Text>
                    </View>
                  )}
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Test Type</Text>
                <TextInput
                  style={styles.input}
                  value={testType}
                  onChangeText={setTestType}
                  placeholder="e.g., Complete Blood Count, X-Ray, MRI"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Priority</Text>
                <View style={styles.priorityButtons}>
                  <TouchableOpacity
                    style={[
                      styles.priorityButton,
                      testPriority === 'urgent' && styles.priorityButtonActive,
                    ]}
                    onPress={() => setTestPriority('urgent')}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        testPriority === 'urgent' && styles.priorityButtonTextActive,
                      ]}
                    >
                      Urgent
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priorityButton,
                      testPriority === 'high' && styles.priorityButtonActive,
                    ]}
                    onPress={() => setTestPriority('high')}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        testPriority === 'high' && styles.priorityButtonTextActive,
                      ]}
                    >
                      High
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priorityButton,
                      testPriority === 'routine' && styles.priorityButtonActive,
                    ]}
                    onPress={() => setTestPriority('routine')}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        testPriority === 'routine' && styles.priorityButtonTextActive,
                      ]}
                    >
                      Routine
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Diagnosis (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={testDiagnosis}
                  onChangeText={setTestDiagnosis}
                  placeholder="Enter diagnosis or ICD-10 code..."
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={testNotes}
                  onChangeText={setTestNotes}
                  placeholder="Enter any special instructions..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleTestOrderSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Test Order</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Diagnosis Modal */}
      <Modal
        visible={showDiagnosisModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDiagnosisModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Diagnosis Code</Text>
              <TouchableOpacity onPress={() => setShowDiagnosisModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {activePatient && (
              <View style={styles.currentPatientHeader}>
                <MaterialCommunityIcons name="account-circle" size={20} color="#007BFF" />
                <Text style={styles.currentPatientText}>
                  Current Patient: <Text style={styles.currentPatientName}>{activePatient.name}</Text>
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Search ICD-10 Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Search by code or description..."
                  value={diagnosisSearch}
                  onChangeText={setDiagnosisSearch}
                />
                {diagnosisSearch.length > 0 && (
                  <View style={styles.suggestionsList}>
                    {filteredDiagnoses.map((diagnosis, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setSelectedDiagnosis(`${diagnosis.code} - ${diagnosis.description}`);
                          setDiagnosisSearch(`${diagnosis.code} - ${diagnosis.description}`);
                        }}
                      >
                        <MaterialCommunityIcons name="medical-bag" size={20} color="#007BFF" />
                        <View style={styles.suggestionContent}>
                          <Text style={styles.suggestionCode}>{diagnosis.code}</Text>
                          <Text style={styles.suggestionDescription}>{diagnosis.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Selected Diagnosis</Text>
                <TextInput
                  style={styles.input}
                  value={selectedDiagnosis}
                  onChangeText={setSelectedDiagnosis}
                  placeholder="Diagnosis code and description"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleDiagnosisSubmit}
              >
                <Text style={styles.submitButtonText}>Add Diagnosis</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Clinical Notes Modal */}
      <Modal
        visible={showNotesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Clinical Notes</Text>
              <TouchableOpacity onPress={() => setShowNotesModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {activePatient && (
              <View style={styles.currentPatientHeader}>
                <MaterialCommunityIcons name="account-circle" size={20} color="#007BFF" />
                <Text style={styles.currentPatientText}>
                  Current Patient: <Text style={styles.currentPatientName}>{activePatient.name}</Text>
                </Text>
                <Text style={styles.autoAssignNote}>
                  Note will be automatically assigned to this patient
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Note Template</Text>
                <View style={styles.templateButtons}>
                  <TouchableOpacity
                    style={[
                      styles.templateButton,
                      noteTemplate === 'soap' && styles.templateButtonActive,
                    ]}
                    onPress={() => setNoteTemplate('soap')}
                  >
                    <Text
                      style={[
                        styles.templateButtonText,
                        noteTemplate === 'soap' && styles.templateButtonTextActive,
                      ]}
                    >
                      SOAP
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.templateButton,
                      noteTemplate === 'hpi' && styles.templateButtonActive,
                    ]}
                    onPress={() => setNoteTemplate('hpi')}
                  >
                    <Text
                      style={[
                        styles.templateButtonText,
                        noteTemplate === 'hpi' && styles.templateButtonTextActive,
                      ]}
                    >
                      HPI
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.templateButton,
                      noteTemplate === 'physical' && styles.templateButtonActive,
                    ]}
                    onPress={() => setNoteTemplate('physical')}
                  >
                    <Text
                      style={[
                        styles.templateButtonText,
                        noteTemplate === 'physical' && styles.templateButtonTextActive,
                      ]}
                    >
                      Physical Exam
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Clinical Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={clinicalNotes}
                  onChangeText={setClinicalNotes}
                  placeholder={`Enter ${noteTemplate.toUpperCase()} notes...`}
                  multiline
                  numberOfLines={10}
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleNotesSubmit}
              >
                <Text style={styles.submitButtonText}>Save Clinical Notes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Patient Selection Modal */}
      <Modal
        visible={showPatientSelectionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPatientSelectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <TouchableOpacity onPress={() => setShowPatientSelectionModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.selectionDescription}>
                Select a patient to associate with clinical actions
              </Text>
              
              {availablePatients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={[
                    styles.patientSelectionItem,
                    activePatient?.id === patient.id && styles.patientSelectionItemActive,
                  ]}
                  onPress={() => handleSelectPatient(patient)}
                >
                  <View style={styles.patientSelectionAvatar}>
                    <Text style={styles.patientSelectionAvatarText}>
                      {patient.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.patientSelectionInfo}>
                    <Text style={styles.patientSelectionName}>{patient.name}</Text>
                    <Text style={styles.patientSelectionDetails}>
                      Age: {patient.age} • MRN: {patient.mrn}
                    </Text>
                  </View>
                  {activePatient?.id === patient.id && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#007BFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  patientNameHeader: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#E3F2FD',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#007BFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  priorityInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  priorityText: {
    fontSize: 14,
    color: '#666',
  },
  templateInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  templateItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  suggestionsList: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionContent: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  suggestionCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  priorityButtonActive: {
    borderColor: '#007BFF',
    backgroundColor: '#E3F2FD',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  priorityButtonTextActive: {
    color: '#007BFF',
  },
  templateButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  templateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  templateButtonActive: {
    borderColor: '#007BFF',
    backgroundColor: '#E3F2FD',
  },
  templateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  templateButtonTextActive: {
    color: '#007BFF',
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentPatientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  currentPatientText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  currentPatientName: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  selectPatientLink: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  prefilledInfoCard: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  prefilledInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  prefilledInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  prefilledInfoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  prefilledInfoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  autoAssignNote: {
    fontSize: 12,
    color: '#007BFF',
    marginTop: 4,
    fontStyle: 'italic',
  },
  selectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  patientSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  patientSelectionItemActive: {
    borderColor: '#007BFF',
    backgroundColor: '#E3F2FD',
  },
  patientSelectionAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientSelectionAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  patientSelectionInfo: {
    flex: 1,
  },
  patientSelectionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  patientSelectionDetails: {
    fontSize: 14,
    color: '#666',
  },
});

export default ClinicalToolsScreen;

