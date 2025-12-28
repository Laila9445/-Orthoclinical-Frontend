import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { usePatient } from '../context/PatientContext';

const { width: screenWidth } = Dimensions.get('window');

const ClinicalToolsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    activePatient, 
    setActivePatient,
    savePrescription, 
    startConsultation,
    prescriptions: contextPrescriptions,
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

  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPatientSelectionModal, setShowPatientSelectionModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  
  // Prescription form state
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState('');
  const [dosageInstructions, setDosageInstructions] = useState('');


  // Sample patients for selection
  const [availablePatients] = useState([
    { id: 1, name: 'John Smith', age: 45, mrn: 'MRN-001' },
    { id: 2, name: 'Emma Johnson', age: 38, mrn: 'MRN-002' },
    { id: 3, name: 'Michael Brown', age: 52, mrn: 'MRN-003' },
    { id: 4, name: 'Sara Ahmed', age: 34, mrn: 'MRN-004' },
    { id: 5, name: 'Robert Wilson', age: 41, mrn: 'MRN-005' },
    { id: 6, name: 'Emily Chen', age: 29, mrn: 'MRN-006' },
    { id: 7, name: 'David Martinez', age: 56, mrn: 'MRN-007' },
    { id: 8, name: 'Lisa Anderson', age: 42, mrn: 'MRN-008' },
  ]);

  // Sample prescription data
  const [prescriptions, setPrescriptions] = useState([
    {
      id: '1',
      rxCode: 'RX-2024-001',
      status: 'Active',
      patient: 'John Smith',
      date: '1/15/2024',
      diagnosis: 'Upper respiratory infection',
      medications: 'Amoxicillin 500mg, Ibuprofen 400mg',
      dosage: '500mg',
      frequency: 'BID',
      duration: '7 days',
    },
    {
      id: '2',
      rxCode: 'RX-2024-002',
      status: 'Dispensed',
      patient: 'Emma Johnson',
      date: '1/14/2024',
      diagnosis: 'Type 2 Diabetes management',
      medications: 'Metformin 500mg',
      dosage: '500mg',
      frequency: 'BID',
      duration: '30 days',
    },
    {
      id: '3',
      rxCode: 'RX-2024-003',
      status: 'Active',
      patient: 'Michael Brown',
      date: '1/13/2024',
      diagnosis: 'Hypertension',
      medications: 'Lisinopril 10mg, Amlodipine 5mg',
      dosage: '10mg, 5mg',
      frequency: 'QD',
      duration: '30 days',
    },
    {
      id: '4',
      rxCode: 'RX-2024-004',
      status: 'Pending',
      patient: 'Sara Ahmed',
      date: '1/12/2024',
      diagnosis: 'Gastroesophageal reflux disease',
      medications: 'Omeprazole 20mg',
      dosage: '20mg',
      frequency: 'QD',
      duration: '14 days',
    },
    {
      id: '5',
      rxCode: 'RX-2024-005',
      status: 'Active',
      patient: 'Robert Wilson',
      date: '1/11/2024',
      diagnosis: 'Allergic rhinitis',
      medications: 'Cetirizine 10mg, Fluticasone nasal spray',
      dosage: '10mg, 1 spray',
      frequency: 'QD',
      duration: '30 days',
    },
    {
      id: '6',
      rxCode: 'RX-2024-006',
      status: 'Active',
      patient: 'Emily Chen',
      date: '1/10/2024',
      diagnosis: 'Migraine',
      medications: 'Sumatriptan 50mg',
      dosage: '50mg',
      frequency: 'As needed',
      duration: '30 days',
    },
    {
      id: '7',
      rxCode: 'RX-2024-007',
      status: 'Dispensed',
      patient: 'David Martinez',
      date: '1/9/2024',
      diagnosis: 'Asthma',
      medications: 'Albuterol inhaler',
      dosage: '2 puffs',
      frequency: 'As needed',
      duration: '90 days',
    },
    {
      id: '8',
      rxCode: 'RX-2024-008',
      status: 'Pending',
      patient: 'Lisa Anderson',
      date: '1/8/2024',
      diagnosis: 'Osteoarthritis',
      medications: 'Naproxen 500mg',
      dosage: '500mg',
      frequency: 'BID',
      duration: '30 days',
    },
  ]);

  // Load prescriptions from context on mount
  useEffect(() => {
    if (contextPrescriptions) {
      const allPrescriptions = [];
      Object.keys(contextPrescriptions).forEach((patientId) => {
        contextPrescriptions[patientId].forEach((prescription) => {
          const patient = availablePatients.find(p => p.id.toString() === patientId);
          allPrescriptions.push({
            id: prescription.id || Date.now().toString(),
            rxCode: `RX-${new Date().getFullYear()}-${String(prescriptions.length + allPrescriptions.length + 1).padStart(3, '0')}`,
            status: prescription.status || 'Active',
            patient: patient?.name || prescription.patientName || 'Unknown',
            date: new Date(prescription.timestamp || prescription.date).toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric'
            }),
            diagnosis: prescription.diagnosis || 'Not specified',
            medications: `${prescription.medication || ''} ${prescription.dosage || ''}`.trim(),
            dosage: prescription.dosage || '',
            frequency: prescription.frequency || '',
            duration: prescription.duration || '',
          });
        });
      });
      if (allPrescriptions.length > 0) {
        setPrescriptions(prev => [...allPrescriptions, ...prev]);
      }
    }
  }, []);

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = 
      prescription.rxCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.medications.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || prescription.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const handleSelectPatient = (patient) => {
    setActivePatient(patient);
    setPatientName(patient.name);
    startConsultation(patient);
    setShowPatientSelectionModal(false);
  };

  const resetForm = () => {
    setPatientName('');
    setDiagnosis('');
    setMedications('');
    setDosageInstructions('');
    setEditingPrescription(null);
  };

  const openEditModal = (prescription) => {
    setEditingPrescription(prescription);
    setPatientName(prescription.patient);
    setDiagnosis(prescription.diagnosis);
    setMedications(prescription.medications || '');
    setDosageInstructions(prescription.dosageInstructions || `${prescription.frequency || ''}${prescription.duration ? `, ${prescription.duration}` : ''}`.trim());
    setShowEditModal(true);
  };

  const handlePrescriptionSubmit = () => {
    if (!patientName || !medications.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (editingPrescription) {
      // Update existing prescription
      const updatedPrescription = {
        ...editingPrescription,
        patient: patientName,
        diagnosis: diagnosis || 'Not specified',
        medications: medications.trim(),
        dosageInstructions: dosageInstructions.trim(),
      };

      setPrescriptions(prev => prev.map(p => 
        p.id === editingPrescription.id ? updatedPrescription : p
      ));
      
      Alert.alert('Success', 'Prescription updated successfully!');
      setShowEditModal(false);
      resetForm();
      return;
    } else {
      // Create new prescription
      const newPrescription = {
        id: Date.now().toString(),
        rxCode: `RX-${new Date().getFullYear()}-${String(prescriptions.length + 1).padStart(3, '0')}`,
        status: 'Active',
        patient: patientName,
        date: new Date().toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric'
        }),
        diagnosis: diagnosis || 'Not specified',
        medications: medications.trim(),
        dosageInstructions: dosageInstructions.trim(),
      };

      setPrescriptions(prev => [newPrescription, ...prev]);

      // Save to context if active patient exists
      if (activePatient) {
        const prescriptionData = {
          medication: medications.trim(),
          dosageInstructions: dosageInstructions.trim(),
          patientName: activePatient.name,
          diagnosis: diagnosis || 'Not specified',
          status: 'Active',
          date: new Date().toISOString(),
        };
        savePrescription(prescriptionData);
      }

      Alert.alert('Success', 'Prescription created successfully!');
      setShowPrescriptionModal(false);
    }
    
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return { backgroundColor: '#4CAF50', color: '#fff' };
      case 'dispensed':
        return { backgroundColor: '#FFFFFF', color: '#333333' };
      case 'pending':
        return { backgroundColor: '#FFC107', color: '#333333' };
      default:
        return { backgroundColor: '#9E9E9E', color: '#fff' };
    }
  };

  const handleViewPrescription = (prescription) => {
    Alert.alert(
      'Prescription Details', 
      `RX Code: ${prescription.rxCode}\n\n` +
      `Status: ${prescription.status}\n` +
      `Patient: ${prescription.patient}\n` +
      `Date: ${prescription.date}\n` +
      `Diagnosis: ${prescription.diagnosis}\n\n` +
      `Medications: ${prescription.medications}\n` +
      `Dosage: ${prescription.dosage || 'N/A'}\n` +
      `Frequency: ${prescription.frequency || 'N/A'}\n` +
      `Duration: ${prescription.duration || 'N/A'}`,
      [{ text: 'OK' }]
    );
  };

  const handlePrintPrescription = (prescription) => {
    Alert.alert('Print Prescription', `Printing prescription ${prescription.rxCode}...`);
    // In a real app, this would trigger a print dialog or PDF generation
  };

  const handleEditPrescription = (prescription) => {
    openEditModal(prescription);
  };

  const handleDeletePrescription = (prescription) => {
    Alert.alert(
      'Delete Prescription',
      `Are you sure you want to delete ${prescription.rxCode}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPrescriptions(prev => prev.filter(p => p.id !== prescription.id));
            Alert.alert('Success', 'Prescription deleted successfully');
          },
        },
      ]
    );
  };

  const renderPrescriptionRow = ({ item, index }) => {
    const statusStyle = getStatusColor(item.status);
    
    return (
      <View style={[styles.tableRow, index % 2 === 1 && styles.tableRowOdd]}>
        <View style={[styles.tableCell, styles.rxCodeCell]}>
          <Text style={styles.tableCellText} numberOfLines={1}>{item.rxCode}</Text>
        </View>
        <View style={[styles.tableCell, styles.statusCell]}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.color }]} numberOfLines={1}>
              {item.status}
            </Text>
          </View>
        </View>
        <View style={[styles.tableCell, styles.patientCell]}>
          <Text style={styles.tableCellText} numberOfLines={1}>{item.patient}</Text>
        </View>
        <View style={[styles.tableCell, styles.dateCell]}>
          <Text style={styles.tableCellText} numberOfLines={1}>{item.date}</Text>
        </View>
        <View style={[styles.tableCell, styles.diagnosisCell]}>
          <Text style={styles.tableCellText} numberOfLines={2}>{item.diagnosis}</Text>
        </View>
        <View style={[styles.tableCell, styles.medicationsCell]}>
          <Text style={styles.tableCellText} numberOfLines={2}>{item.medications}</Text>
        </View>
        <View style={[styles.tableCell, styles.actionsCell]}>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => handleViewPrescription(item)} style={styles.actionButton}>
              <Ionicons name="eye" size={18} color="#2196F3" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handlePrintPrescription(item)} style={styles.actionButton}>
              <MaterialCommunityIcons name="printer" size={18} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditPrescription(item)} style={styles.actionButton}>
              <Ionicons name="pencil" size={18} color="#FF9800" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeletePrescription(item)} style={styles.actionButton}>
              <Ionicons name="trash" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card Container */}
        <View style={styles.mainCard}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleLeft}>
              <Text style={styles.mainTitle}>Digital Prescriptions</Text>
              <Text style={styles.subtitle}>Create and manage digital prescriptions for your patients.</Text>
            </View>
            <TouchableOpacity
              style={styles.newPrescriptionButton}
              onPress={() => {
                resetForm();
                if (!activePatient) {
                  setShowPatientSelectionModal(true);
                } else {
                  setPatientName(activePatient.name);
                  setShowPrescriptionModal(true);
                }
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.newPrescriptionButtonText}>New Prescription</Text>
            </TouchableOpacity>
          </View>

          {/* Search and Filter Section */}
          <View style={styles.searchFilterSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search prescriptions..."
                placeholderTextColor="#9E9E9E"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.filterButtonContainer}>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowStatusFilter(!showStatusFilter)}
              >
                <Text style={styles.filterButtonText} numberOfLines={1}>
                  {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#fff" />
              </TouchableOpacity>
              {showStatusFilter && (
                <View style={styles.filterDropdown}>
                  <TouchableOpacity 
                    style={styles.filterOption}
                    onPress={() => {
                      setStatusFilter('all');
                      setShowStatusFilter(false);
                    }}
                  >
                    <Text style={styles.filterOptionText}>All Status</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.filterOption}
                    onPress={() => {
                      setStatusFilter('active');
                      setShowStatusFilter(false);
                    }}
                  >
                    <Text style={styles.filterOptionText}>Active</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.filterOption}
                    onPress={() => {
                      setStatusFilter('dispensed');
                      setShowStatusFilter(false);
                    }}
                  >
                    <Text style={styles.filterOptionText}>Dispensed</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.filterOption}
                    onPress={() => {
                      setStatusFilter('pending');
                      setShowStatusFilter(false);
                    }}
                  >
                    <Text style={styles.filterOptionText}>Pending</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Table Container with Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollContainer}>
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <View style={[styles.tableHeaderCell, styles.rxCodeCell]}>
                  <Text style={styles.tableHeaderText}>RX CODE</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.statusCell]}>
                  <Text style={styles.tableHeaderText}>STATUS</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.patientCell]}>
                  <Text style={styles.tableHeaderText}>PATIENT</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.dateCell]}>
                  <Text style={styles.tableHeaderText}>DATE</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.diagnosisCell]}>
                  <Text style={styles.tableHeaderText}>DIAGNOSIS</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.medicationsCell]}>
                  <Text style={styles.tableHeaderText}>MEDICATIONS</Text>
                </View>
                <View style={[styles.tableHeaderCell, styles.actionsCell]}>
                  <Text style={styles.tableHeaderText}>ACTIONS</Text>
                </View>
              </View>

              {/* Table Body */}
              <FlatList
                data={filteredPrescriptions}
                renderItem={({ item, index }) => renderPrescriptionRow({ item, index })}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Prescription Modal */}
      <Modal
        visible={showPrescriptionModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowPrescriptionModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Prescription</Text>
              <TouchableOpacity onPress={() => {
                setShowPrescriptionModal(false);
                resetForm();
              }}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>


            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={true}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Patient Name</Text>
                <TextInput
                  style={styles.input}
                  value={patientName}
                  onChangeText={setPatientName}
                  placeholder="Enter patient name"
                  placeholderTextColor="#9E9E9E"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Diagnosis</Text>
                <TextInput
                  style={styles.input}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Enter diagnosis"
                  placeholderTextColor="#9E9E9E"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Medications (comma separated)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={medications}
                  onChangeText={setMedications}
                  placeholder="e.g., Amoxicillin 500mg, Ibuprofen 400mg"
                  placeholderTextColor="#9E9E9E"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dosage Instructions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={dosageInstructions}
                  onChangeText={setDosageInstructions}
                  placeholder="e.g., Take twice daily with food"
                  placeholderTextColor="#9E9E9E"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowPrescriptionModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handlePrescriptionSubmit}
                >
                  <Text style={styles.createButtonText}>Create Prescription</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Prescription Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Prescription</Text>
              <TouchableOpacity onPress={() => {
                setShowEditModal(false);
                resetForm();
              }}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={true}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>RX Code</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={editingPrescription?.rxCode || ''}
                  editable={false}
                  placeholderTextColor="#9E9E9E"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Patient Name</Text>
                <TextInput
                  style={styles.input}
                  value={patientName}
                  onChangeText={setPatientName}
                  placeholder="Enter patient name"
                  placeholderTextColor="#9E9E9E"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Diagnosis</Text>
                <TextInput
                  style={styles.input}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                  placeholder="Enter diagnosis"
                  placeholderTextColor="#9E9E9E"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Medications (comma separated)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={medications}
                  onChangeText={setMedications}
                  placeholder="e.g., Amoxicillin 500mg, Ibuprofen 400mg"
                  placeholderTextColor="#9E9E9E"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dosage Instructions</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={dosageInstructions}
                  onChangeText={setDosageInstructions}
                  placeholder="e.g., Take twice daily with food"
                  placeholderTextColor="#9E9E9E"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Status</Text>
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[styles.statusButton, editingPrescription?.status === 'Active' && styles.statusButtonActive]}
                    onPress={() => {
                      if (editingPrescription) {
                        setEditingPrescription({ ...editingPrescription, status: 'Active' });
                      }
                    }}
                  >
                    <Text style={[styles.statusButtonText, editingPrescription?.status === 'Active' && styles.statusButtonTextActive]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusButton, editingPrescription?.status === 'Dispensed' && styles.statusButtonActive]}
                    onPress={() => {
                      if (editingPrescription) {
                        setEditingPrescription({ ...editingPrescription, status: 'Dispensed' });
                      }
                    }}
                  >
                    <Text style={[styles.statusButtonText, editingPrescription?.status === 'Dispensed' && styles.statusButtonTextActive]}>
                      Dispensed
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.statusButton, editingPrescription?.status === 'Pending' && styles.statusButtonActive]}
                    onPress={() => {
                      if (editingPrescription) {
                        setEditingPrescription({ ...editingPrescription, status: 'Pending' });
                      }
                    }}
                  >
                    <Text style={[styles.statusButtonText, editingPrescription?.status === 'Pending' && styles.statusButtonTextActive]}>
                      Pending
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handlePrescriptionSubmit}
                >
                  <Text style={styles.createButtonText}>Update Prescription</Text>
                </TouchableOpacity>
              </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  mainCard: {
    flex: 1,
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: screenWidth * 0.8,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  titleLeft: {
    flex: 1,
    marginRight: 16,
    minWidth: screenWidth * 0.5,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 20,
  },
  newPrescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  newPrescriptionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  searchFilterSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    paddingHorizontal: 12,
    minWidth: screenWidth * 0.4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 14,
  },
  filterButtonContainer: {
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    minWidth: 120,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 4,
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
  },
  filterOptionText: {
    color: '#fff',
    fontSize: 14,
  },
  tableScrollContainer: {
    flex: 1,
  },
  tableContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: Math.max(800, screenWidth * 0.95),
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#3A3A3A',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
  },
  tableHeaderCell: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#B0B0B0',
    textTransform: 'uppercase',
  },
  rxCodeHeader: {
    width: 100,
  },
  statusHeader: {
    width: 80,
  },
  patientHeader: {
    width: 120,
  },
  dateHeader: {
    width: 90,
  },
  diagnosisHeader: {
    width: 150,
  },
  medicationsHeader: {
    width: 150,
    flex: 1,
  },
  actionsHeader: {
    width: 120,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#3A3A3A',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4A4A4A',
    minHeight: 60,
  },
  tableRowOdd: {
    backgroundColor: '#333333',
  },
  tableCell: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  rxCodeCell: {
    width: 100,
  },
  statusCell: {
    width: 80,
  },
  patientCell: {
    width: 120,
  },
  dateCell: {
    width: 90,
  },
  diagnosisCell: {
    width: 150,
  },
  medicationsCell: {
    width: 150,
    flex: 1,
  },
  actionsCell: {
    width: 120,
  },
  tableCellText: {
    fontSize: 13,
    color: '#fff',
    lineHeight: 18,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    width: screenWidth * 0.9,
    maxWidth: 600,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3A',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#3A3A3A',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#3A3A3A',
    color: '#fff',
  },
  disabledInput: {
    backgroundColor: '#333333',
    color: '#9E9E9E',
    borderColor: '#4A4A4A',
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
  suggestionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4A4A4A',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
    minWidth: 100,
  },
  statusButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#3A3A3A',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#3A3A3A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
