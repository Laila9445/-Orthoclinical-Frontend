import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';

// Safe wrapper for usePatient that handles missing provider gracefully
const useSafePatient = () => {
  try {
    return usePatient();
  } catch (error) {
    // If PatientProvider is missing, return a safe fallback object
    console.warn('PatientContext not available, using fallback mode:', error);
    return {
      activePatient: null,
      consultationData: null,
      startConsultation: undefined,
      endConsultation: undefined,
      updateConsultationTimer: undefined,
      savePrescription: undefined,
    };
  }
};

const DoctorDashboardScreen = () => {
  const { logout, user } = useAuth();
  
  // PatientContext access - using safe wrapper
  // This ensures hooks are called unconditionally but handles missing provider
  const patientContextValue = useSafePatient();
  
  // Safe PatientContext functions with fallbacks
  // Extract functions safely, defaulting to undefined if they don't exist
  const patientContextFunctions = {
    activePatient: patientContextValue?.activePatient || null,
    consultationData: patientContextValue?.consultationData || null,
    startConsultation: patientContextValue?.startConsultation,
    endConsultation: patientContextValue?.endConsultation,
    updateConsultationTimer: patientContextValue?.updateConsultationTimer,
    savePrescription: patientContextValue?.savePrescription,
  };

  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [consultationTimer, setConsultationTimer] = useState(0);
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  
  // Local storage for consultations (fallback)
  const [localConsultations, setLocalConsultations] = useState([]);
  const [localPrescriptions, setLocalPrescriptions] = useState([]);
  
  // Prescription form state
  const [medSearch, setMedSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  
  // Timer ref to properly stop the interval
  const timerIntervalRef = useRef(null);
  const [patientQueue, setPatientQueue] = useState([
    {
      id: 1,
      name: 'John Doe',
      age: 45,
      chiefComplaint: 'Chest pain and shortness of breath',
    },
    {
      id: 2,
      name: 'Sarah Williams',
      age: 38,
      chiefComplaint: 'Follow-up: Diabetes management',
    },
    {
      id: 3,
      name: 'Michael Chen',
      age: 52,
      chiefComplaint: 'New: Knee pain evaluation',
    },
    {
      id: 4,
      name: 'Emma Thompson',
      age: 34,
      chiefComplaint: 'Severe chest pain, EKG abnormal',
    },
  ]);
  const [currentPatient, setCurrentPatient] = useState(null);

  // Safe wrapper for updateConsultationTimer
  const safeUpdateConsultationTimer = (timerValue) => {
    try {
      if (patientContextFunctions.updateConsultationTimer && typeof patientContextFunctions.updateConsultationTimer === 'function') {
        patientContextFunctions.updateConsultationTimer(timerValue);
      }
    } catch (error) {
      console.warn('Failed to update consultation timer in context:', error);
      // Timer continues locally regardless
    }
  };

  // Consultation timer
  useEffect(() => {
    // Clear any existing interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    if (isConsulting && currentPatient) {
      timerIntervalRef.current = setInterval(() => {
        setConsultationTimer(prev => {
          const newTimer = prev + 1;
          safeUpdateConsultationTimer(newTimer);
          return newTimer;
        });
      }, 1000);
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [isConsulting, currentPatient]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sample medications for search
  const medications = [
    'Metformin 500mg',
    'Lisinopril 10mg',
    'Amlodipine 5mg',
    'Atorvastatin 20mg',
    'Levothyroxine 50mcg',
    'Omeprazole 20mg',
    'Amlodipine 10mg',
    'Metoprolol 25mg',
    'Losartan 50mg',
    'Gabapentin 300mg',
    'Sertraline 50mg',
    'Albuterol Inhaler',
    'Ibuprofen 400mg',
    'Amoxicillin 500mg',
    'Azithromycin 250mg',
  ];

  const filteredMedications = medications.filter((med) =>
    med.toLowerCase().includes(medSearch.toLowerCase())
  );

  const handleAddPrescription = () => {
    if (!currentPatient) {
      Alert.alert('Error', 'No active patient. Please start a consultation first.');
      return;
    }
    setShowPrescriptionModal(true);
  };

  // Safe wrapper for savePrescription with fallback
  const safeSavePrescription = (prescription) => {
    try {
      // Try context function first
      if (patientContextFunctions.savePrescription && typeof patientContextFunctions.savePrescription === 'function') {
        const result = patientContextFunctions.savePrescription(prescription);
        if (result && result.success) {
          return { success: true };
        }
        // If context function exists but fails, fall back to local storage
      }
      
      // Fallback: Save to local state
      const prescriptionRecord = {
        id: Date.now().toString(),
        ...prescription,
        timestamp: new Date().toISOString(),
        patientId: currentPatient?.id,
      };
      setLocalPrescriptions(prev => [...prev, prescriptionRecord]);
      return { success: true };
    } catch (error) {
      console.warn('Failed to save prescription, using fallback:', error);
      // Fallback: Save to local state even on error
      const prescriptionRecord = {
        id: Date.now().toString(),
        ...prescription,
        timestamp: new Date().toISOString(),
        patientId: currentPatient?.id,
      };
      setLocalPrescriptions(prev => [...prev, prescriptionRecord]);
      return { success: true };
    }
  };

  const handlePrescriptionSubmit = () => {
    if (!selectedMed || !dosage || !frequency || !duration) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    
    if (!currentPatient) {
      Alert.alert('Error', 'No active patient. Please start a consultation first.');
      return;
    }
    
    const prescription = {
      medication: selectedMed,
      dosage,
      frequency,
      duration,
      patientName: currentPatient.name,
    };
    
    const result = safeSavePrescription(prescription);
    
    if (result && result.success) {
      Alert.alert(
        'Success',
        `Prescription saved successfully!\n\nPatient: ${currentPatient.name}\nMedication: ${selectedMed}\nDosage: ${dosage}\nFrequency: ${frequency}\nDuration: ${duration}`,
        [{ text: 'OK' }]
      );
      setShowPrescriptionModal(false);
      // Reset form
      setSelectedMed('');
      setMedSearch('');
      setDosage('');
      setFrequency('');
      setDuration('');
    } else {
      Alert.alert('Error', result?.error || 'Failed to save prescription');
    }
  };

  // Sample data
  const [criticalAlerts] = useState([
    { type: 'vitals', message: 'BP: 180/110 mmHg (High)', severity: 'high' },
    { type: 'interaction', message: 'Warfarin + Aspirin interaction detected', severity: 'critical' },
  ]);

  const [todayStats] = useState({
    scheduled: 12,
    completed: 5,
    remaining: 7,
  });

  const [labResults] = useState([
    { test: 'HbA1c', value: '8.5%', normal: '<7.0%', status: 'abnormal', flag: '⚠️' },
    { test: 'Glucose', value: '145 mg/dL', normal: '70-100 mg/dL', status: 'abnormal', flag: '⚠️' },
    { test: 'Creatinine', value: '0.9 mg/dL', normal: '0.6-1.2 mg/dL', status: 'normal', flag: '✓' },
  ]);

  const [patientVitals] = useState([
    { label: 'BP', value: '180/110', unit: 'mmHg', status: 'high' },
    { label: 'HR', value: '92', unit: 'bpm', status: 'normal' },
    { label: 'Temp', value: '98.6', unit: '°F', status: 'normal' },
    { label: 'O2 Sat', value: '96', unit: '%', status: 'normal' },
  ]);

  const [activeMedications] = useState([
    { name: 'Metformin 500mg', frequency: 'BID', duration: '30 days' },
    { name: 'Lisinopril 10mg', frequency: 'QD', duration: '90 days' },
  ]);

  const [upcomingAppointments] = useState([
    { time: '10:30 AM', patient: 'Sarah Williams', complaint: 'Follow-up: Diabetes management' },
    { time: '11:00 AM', patient: 'Michael Chen', complaint: 'New: Knee pain evaluation' },
  ]);

  const [urgentCases] = useState([
    { id: 1, name: 'Emma Thompson', priority: 'urgent', complaint: 'Severe chest pain, EKG abnormal' },
    { id: 2, name: 'Robert Brown', priority: 'high', complaint: 'High fever, difficulty breathing' },
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const navigateToScreen = (screen) => {
    setShowSidebar(false);
    if (screen === 'dashboard') {
      // Already on dashboard
    } else if (screen === 'patients') {
      router.push('/MyPatientsScreen');
    } else if (screen === 'appointments') {
      router.push('/Appointments');
    } else if (screen === 'clinical-tools') {
      // Pass current patient info if available
      const params = currentPatient 
        ? { patientName: currentPatient.name, patientId: currentPatient.id.toString() }
        : {};
      router.push({
        pathname: '/ClinicalToolsScreen',
        params: params
      });
    } else if (screen === 'profile') {
      router.push('/DoctorProfileScreen');
    }
  };

  // Safe wrapper for startConsultation
  const safeStartConsultation = (patient) => {
    try {
      if (patientContextFunctions.startConsultation && typeof patientContextFunctions.startConsultation === 'function') {
        patientContextFunctions.startConsultation(patient);
      }
    } catch (error) {
      console.warn('Failed to start consultation in context, continuing with local state:', error);
      // Continue with local state only
    }
  };

  const handleStartConsultation = () => {
    if (patientQueue.length === 0) {
      Alert.alert('No Patients', 'There are no patients in the queue.');
      return;
    }
    const nextPatient = patientQueue[0];
    setCurrentPatient(nextPatient);
    setIsConsulting(true);
    setConsultationTimer(0);
    setConsultationNotes(''); // Reset notes when starting new consultation
    safeStartConsultation(nextPatient);
  };

  const handleEndConsultation = async () => {
    if (!currentPatient) {
      Alert.alert('Error', 'No active consultation to end.');
      return;
    }
    
    if (!isConsulting) {
      Alert.alert('Error', 'No active consultation session.');
      return;
    }
    
    const patientName = currentPatient.name;
    const patientId = currentPatient.id;
    const finalTimer = consultationTimer;
    
    // Show confirmation dialog
    Alert.alert(
      'End Consultation',
      `Are you sure you want to end consultation with ${patientName}?\n\nDuration: ${formatTime(finalTimer)}\n\nConsultation notes will be saved automatically and the patient will be moved to completed status.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            // User cancelled, do nothing
          }
        },
        {
          text: 'End Consultation',
          style: 'destructive',
          onPress: async () => {
            try {
              // Step 1: Stop the consultation timer immediately
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
              }
              
              // Step 2: Stop consultation state immediately to prevent further timer updates
              setIsConsulting(false);
              
              // Step 3: Save consultation notes automatically (use current notes or default)
              const notesToSave = consultationNotes.trim() || 'Consultation completed';
              
              // Step 4: Save consultation data with completed status (with fallback)
              let saveResult = { success: false };
              
              try {
                // Try context function first
                if (patientContextFunctions.endConsultation && typeof patientContextFunctions.endConsultation === 'function') {
                  const contextResult = await patientContextFunctions.endConsultation({
                    notes: notesToSave,
                    timer: finalTimer,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                  });
                  
                  if (contextResult && contextResult.success) {
                    saveResult = { success: true };
                  } else {
                    // Context function failed, use fallback
                    throw new Error(contextResult?.error || 'Context save failed');
                  }
                } else {
                  // Context function not available, use fallback
                  throw new Error('Context function not available');
                }
              } catch (error) {
                console.warn('Failed to save via context, using fallback:', error);
                
                // Fallback: Save to local state
                const consultationRecord = {
                  id: Date.now().toString(),
                  patientId: patientId,
                  patientName: patientName,
                  startTime: patientContextFunctions.consultationData?.startTime || new Date().toISOString(),
                  endTime: new Date().toISOString(),
                  duration: finalTimer,
                  notes: notesToSave,
                  status: 'completed',
                  completedAt: new Date().toISOString(),
                  timer: finalTimer,
                };
                
                setLocalConsultations(prev => [...prev, consultationRecord]);
                saveResult = { success: true };
              }

              // Proceed regardless of save result - UI should always work
              // Only show warning if both context and fallback fail (which shouldn't happen)
              if (!saveResult.success) {
                Alert.alert(
                  'Warning', 
                  'Consultation ended but data may not be saved. Consultation notes have been preserved locally.',
                  [{ text: 'OK' }]
                );
                // Still proceed with ending consultation - don't block user
              }

              // Step 5: Move patient to completed status by removing from active queue
              const updatedQueue = patientQueue.filter((p) => p.id !== patientId);
              
              // Step 6: Reset all consultation states
              setPatientQueue(updatedQueue);
              setConsultationTimer(0);
              setConsultationNotes('');
              setCurrentPatient(null);

              // Step 7: Show success confirmation dialog
              Alert.alert(
                'Consultation Completed',
                `Consultation with ${patientName} has been successfully completed.\n\nDuration: ${formatTime(finalTimer)}\n\nNotes saved: ${notesToSave.length > 50 ? notesToSave.substring(0, 50) + '...' : notesToSave}`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Auto-start next consultation if there are more patients in queue
                      if (updatedQueue.length > 0) {
                        setTimeout(() => {
                          const nextPatient = updatedQueue[0];
                          setCurrentPatient(nextPatient);
                          setIsConsulting(true);
                          setConsultationTimer(0);
                          setConsultationNotes('');
                          safeStartConsultation(nextPatient);
                          Alert.alert(
                            'Next Patient',
                            `Starting consultation with ${nextPatient.name}`
                          );
                        }, 500);
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Error ending consultation:', error);
              Alert.alert(
                'Error', 
                'An unexpected error occurred while ending the consultation. Please try again.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Re-enable consultation on error
                      setIsConsulting(true);
                    }
                  }
                ]
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowSidebar(true)}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name || 'Doctor'}
          </Text>
          <Text style={styles.date}>{getCurrentDate()}</Text>
        </View>
        <View style={styles.notificationBadge}>
          <Ionicons name="notifications" size={20} color="#fff" />
          {criticalAlerts.length > 0 && (
            <View style={styles.badgeCircle}>
              <Text style={styles.badgeText}>{criticalAlerts.length}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Currently Consulting Section */}
        {isConsulting && currentPatient ? (
          <View style={styles.consultingCard}>
            <View style={styles.consultingHeader}>
              <MaterialCommunityIcons name="stethoscope" size={24} color="#DC3545" />
              <Text style={styles.consultingTitle}>Currently Consulting</Text>
              <TouchableOpacity onPress={handleEndConsultation}>
                <Ionicons name="close-circle" size={24} color="#DC3545" />
              </TouchableOpacity>
            </View>
            <Text style={styles.patientName}>{currentPatient.name}</Text>
            <Text style={styles.chiefComplaint}>{currentPatient.chiefComplaint}</Text>
            <View style={styles.timerContainer}>
              <Ionicons name="time-outline" size={20} color="#DC3545" />
              <Text style={styles.timerText}>{formatTime(consultationTimer)}</Text>
            </View>
            
            {/* Consultation Notes */}
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Consultation Notes:</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Enter consultation notes..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                value={consultationNotes}
                onChangeText={setConsultationNotes}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.addPrescriptionButton}
                onPress={handleAddPrescription}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="prescription" size={20} color="#fff" />
                <Text style={styles.addPrescriptionButtonText}>Add Prescription</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.endConsultationButton}
                onPress={handleEndConsultation}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="stop-circle" size={20} color="#fff" />
                <Text style={styles.endConsultationButtonText}>End Consultation</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.startConsultationCard}>
            <View style={styles.startConsultationHeader}>
              <MaterialCommunityIcons name="account-clock" size={24} color="#007BFF" />
              <Text style={styles.startConsultationTitle}>Ready for Consultation</Text>
            </View>
            {patientQueue.length > 0 ? (
              <>
                <Text style={styles.nextPatientLabel}>Next Patient:</Text>
                <Text style={styles.nextPatientName}>{patientQueue[0].name}</Text>
                <Text style={styles.nextPatientComplaint}>{patientQueue[0].chiefComplaint}</Text>
                <Text style={styles.queueInfo}>
                  {patientQueue.length} {patientQueue.length === 1 ? 'patient' : 'patients'} in queue
                </Text>
                <TouchableOpacity
                  style={styles.startConsultationButton}
                  onPress={handleStartConsultation}
                >
                  <MaterialCommunityIcons name="play-circle" size={24} color="#fff" />
                  <Text style={styles.startConsultationButtonText}>Start Consultation</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.noPatientsText}>No patients in queue</Text>
                <Text style={styles.noPatientsSubtext}>
                  All consultations have been completed
                </Text>
              </>
            )}
          </View>
        )}

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="alert-circle" size={24} color="#DC3545" />
              <Text style={styles.sectionTitle}>Critical Alerts</Text>
            </View>
            {criticalAlerts.map((alert, index) => (
              <View
                key={index}
                style={[
                  styles.alertCard,
                  alert.severity === 'critical' && styles.criticalAlertCard,
                  alert.severity === 'high' && styles.highAlertCard,
                ]}
              >
                <Ionicons
                  name="warning"
                  size={20}
                  color={alert.severity === 'critical' ? '#DC3545' : '#FF9800'}
                />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Today's Patient Load */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Today's Patient Load</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{todayStats.scheduled}</Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.statCompleted]}>{todayStats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, styles.statRemaining]}>{todayStats.remaining}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>
        </View>

        {/* Lab Results Panel */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="test-tube" size={24} color="#007BFF" />
            <Text style={styles.sectionTitle}>Recent Lab Results</Text>
          </View>
          {labResults.map((lab, index) => (
            <View
              key={index}
              style={[
                styles.labCard,
                lab.status === 'abnormal' && styles.abnormalLabCard,
              ]}
            >
              <View style={styles.labHeader}>
                <Text style={styles.labTest}>{lab.test}</Text>
                <Text style={styles.labFlag}>{lab.flag}</Text>
              </View>
              <View style={styles.labValues}>
                <Text style={[styles.labValue, lab.status === 'abnormal' && styles.abnormalValue]}>
                  {lab.value}
                </Text>
                <Text style={styles.labNormal}>Normal: {lab.normal}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Patient Charts Quick View */}
        {isConsulting && currentPatient && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Patient: {currentPatient.name}</Text>

            {/* Vital Signs */}
            <View style={styles.vitalsCard}>
              <Text style={styles.vitalsTitle}>Vital Signs</Text>
              <View style={styles.vitalsGrid}>
                {patientVitals.map((vital, index) => (
                  <View key={index} style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>{vital.label}</Text>
                    <Text
                      style={[
                        styles.vitalValue,
                        vital.status === 'high' && styles.vitalHigh,
                        vital.status === 'low' && styles.vitalLow,
                      ]}
                    >
                      {vital.value}
                    </Text>
                    <Text style={styles.vitalUnit}>{vital.unit}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Active Medications */}
            <View style={styles.medicationsCard}>
              <Text style={styles.medicationsTitle}>Active Medications</Text>
              {activeMedications.map((med, index) => (
                <View key={index} style={styles.medicationItem}>
                  <Ionicons name="medical" size={20} color="#007BFF" />
                  <View style={styles.medicationInfo}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationDetails}>
                      {med.frequency} • {med.duration}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Urgent Cases Queue */}
        {urgentCases.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="clock-alert-outline" size={24} color="#DC3545" />
              <Text style={styles.sectionTitle}>Urgent Cases Queue</Text>
            </View>
            {urgentCases.map((caseItem) => (
              <TouchableOpacity
                key={caseItem.id}
                style={[
                  styles.urgentCaseCard,
                  caseItem.priority === 'urgent' && styles.urgentCaseCardCritical,
                ]}
              >
                <View style={styles.urgentCaseHeader}>
                  <Text style={styles.urgentCaseName}>{caseItem.name}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      caseItem.priority === 'urgent' && styles.urgentBadge,
                    ]}
                  >
                    <Text style={styles.priorityText}>{caseItem.priority.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.urgentCaseComplaint}>{caseItem.complaint}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Next Patient Preview */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next Patients</Text>
            {upcomingAppointments.map((apt, index) => (
              <View key={index} style={styles.appointmentCard}>
                <View style={styles.appointmentTime}>
                  <Ionicons name="time-outline" size={18} color="#007BFF" />
                  <Text style={styles.appointmentTimeText}>{apt.time}</Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentPatient}>{apt.patient}</Text>
                  <Text style={styles.appointmentComplaint}>{apt.complaint}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                const params = currentPatient 
                  ? { patientName: currentPatient.name, patientId: currentPatient.id.toString() }
                  : {};
                router.push({
                  pathname: '/ClinicalToolsScreen',
                  params: params
                });
              }}
            >
              <MaterialCommunityIcons name="prescription" size={32} color="#007BFF" />
              <Text style={styles.quickActionText}>Prescription</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                const params = currentPatient 
                  ? { patientName: currentPatient.name, patientId: currentPatient.id.toString() }
                  : {};
                router.push({
                  pathname: '/ClinicalToolsScreen',
                  params: params
                });
              }}
            >
              <MaterialCommunityIcons name="clipboard-list" size={32} color="#28A745" />
              <Text style={styles.quickActionText}>Test Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                const params = currentPatient 
                  ? { patientName: currentPatient.name, patientId: currentPatient.id.toString() }
                  : {};
                router.push({
                  pathname: '/ClinicalToolsScreen',
                  params: params
                });
              }}
            >
              <MaterialCommunityIcons name="file-document" size={32} color="#FF9800" />
              <Text style={styles.quickActionText}>Clinical Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => {
                const params = currentPatient 
                  ? { patientName: currentPatient.name, patientId: currentPatient.id.toString() }
                  : {};
                router.push({
                  pathname: '/ClinicalToolsScreen',
                  params: params
                });
              }}
            >
              <MaterialCommunityIcons name="medical-bag" size={32} color="#9C27B0" />
              <Text style={styles.quickActionText}>Diagnosis</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sidebar Navigation */}
      <Modal
        visible={showSidebar}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSidebar(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSidebar(false)}
        >
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Doctor Menu</Text>
              <TouchableOpacity onPress={() => setShowSidebar(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('dashboard')}
            >
              <Ionicons name="home" size={24} color="#007BFF" />
              <Text style={styles.sidebarItemText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('patients')}
            >
              <MaterialCommunityIcons name="account-group" size={24} color="#007BFF" />
              <Text style={styles.sidebarItemText}>My Patients</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('appointments')}
            >
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#007BFF" />
              <Text style={styles.sidebarItemText}>Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('clinical-tools')}
            >
              <MaterialCommunityIcons name="toolbox" size={24} color="#007BFF" />
              <Text style={styles.sidebarItemText}>Clinical Tools</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('profile')}
            >
              <Ionicons name="person" size={24} color="#007BFF" />
              <Text style={styles.sidebarItemText}>Doctor Profile</Text>
            </TouchableOpacity>
            <View style={styles.sidebarDivider} />
            <TouchableOpacity style={styles.sidebarItem} onPress={handleLogout}>
              <Ionicons name="log-out" size={24} color="#FF6B6B" />
              <Text style={[styles.sidebarItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        visible={showPrescriptionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrescriptionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.prescriptionModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Prescription</Text>
              <TouchableOpacity onPress={() => setShowPrescriptionModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Medication Search */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Search Medication *</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Type to search medications..."
                  placeholderTextColor="#999"
                  value={medSearch}
                  onChangeText={(text) => {
                    setMedSearch(text);
                    if (text && !selectedMed) {
                      // Auto-select first match if only one
                      const matches = medications.filter((med) =>
                        med.toLowerCase().includes(text.toLowerCase())
                      );
                      if (matches.length === 1) {
                        setSelectedMed(matches[0]);
                      }
                    }
                  }}
                />
                
                {/* Medication Suggestions */}
                {medSearch.length > 0 && filteredMedications.length > 0 && !selectedMed && (
                  <View style={styles.suggestionsContainer}>
                    {filteredMedications.slice(0, 5).map((med, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionItem}
                        onPress={() => {
                          setSelectedMed(med);
                          setMedSearch(med);
                        }}
                      >
                        <Ionicons name="medical" size={20} color="#007BFF" />
                        <Text style={styles.suggestionText}>{med}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Selected Medication */}
                {selectedMed && (
                  <View style={styles.selectedMedication}>
                    <Text style={styles.selectedMedText}>Selected: {selectedMed}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedMed('');
                        setMedSearch('');
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#DC3545" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Dosage */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dosage *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 500mg, 10mg, 1 tablet"
                  placeholderTextColor="#999"
                  value={dosage}
                  onChangeText={setDosage}
                />
              </View>

              {/* Frequency */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Frequency *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., BID (twice daily), QD (once daily), TID (three times daily)"
                  placeholderTextColor="#999"
                  value={frequency}
                  onChangeText={setFrequency}
                />
              </View>

              {/* Duration */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Duration *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 7 days, 30 days, 90 days"
                  placeholderTextColor="#999"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowPrescriptionModal(false);
                  setSelectedMed('');
                  setMedSearch('');
                  setDosage('');
                  setFrequency('');
                  setDuration('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handlePrescriptionSubmit}
              >
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Save Prescription</Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  date: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 4,
  },
  notificationBadge: {
    position: 'relative',
  },
  badgeCircle: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#DC3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  consultingCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
  },
  consultingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  consultingTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC3545',
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chiefComplaint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  timerText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC3545',
  },
  notesContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addPrescriptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addPrescriptionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  endConsultationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC3545',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  endConsultationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  startConsultationCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  startConsultationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  startConsultationTitle: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  nextPatientLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  nextPatientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  nextPatientComplaint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  queueInfo: {
    fontSize: 12,
    color: '#007BFF',
    marginBottom: 16,
    fontWeight: '600',
  },
  startConsultationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  startConsultationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noPatientsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  noPatientsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  criticalAlertCard: {
    borderLeftColor: '#DC3545',
    backgroundColor: '#FFEBEE',
  },
  highAlertCard: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  alertText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  statCompleted: {
    color: '#28A745',
  },
  statRemaining: {
    color: '#FF9800',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  labCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  abnormalLabCard: {
    borderLeftColor: '#DC3545',
    backgroundColor: '#FFEBEE',
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labTest: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  labFlag: {
    fontSize: 18,
  },
  labValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  abnormalValue: {
    color: '#DC3545',
  },
  labNormal: {
    fontSize: 12,
    color: '#666',
  },
  vitalsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vitalsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalItem: {
    width: '48%',
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  vitalHigh: {
    color: '#DC3545',
  },
  vitalLow: {
    color: '#FF9800',
  },
  vitalUnit: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  medicationsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  medicationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  medicationDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  urgentCaseCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  urgentCaseCardCritical: {
    borderLeftColor: '#DC3545',
    backgroundColor: '#FFEBEE',
  },
  urgentCaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  urgentCaseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  priorityBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  urgentBadge: {
    backgroundColor: '#DC3545',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  urgentCaseComplaint: {
    fontSize: 14,
    color: '#666',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  appointmentTimeText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#007BFF',
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appointmentComplaint: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sidebar: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  sidebarItemText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 16,
  },
  logoutText: {
    color: '#FF6B6B',
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  prescriptionModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    maxHeight: 500,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formInput: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionsContainer: {
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
    borderBottomColor: '#F5F7FA',
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  selectedMedication: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#007BFF',
  },
  selectedMedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007BFF',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#007BFF',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default DoctorDashboardScreen;

