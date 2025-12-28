import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;
const SIDEBAR_WIDTH = IS_TABLET ? 280 : 0;
const COLLAPSED_SIDEBAR_WIDTH = IS_TABLET ? 80 : 0;

// Safe wrapper for usePatient that handles missing provider gracefully
const useSafePatient = () => {
  try {
    return usePatient();
  } catch (error) {
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
  
  const patientContextValue = useSafePatient();
  
  const patientContextFunctions = {
    activePatient: patientContextValue?.activePatient || null,
    consultationData: patientContextValue?.consultationData || null,
    startConsultation: patientContextValue?.startConsultation,
    endConsultation: patientContextValue?.endConsultation,
    updateConsultationTimer: patientContextValue?.updateConsultationTimer,
    savePrescription: patientContextValue?.savePrescription,
  };

  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(IS_TABLET);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [consultationTimer, setConsultationTimer] = useState(0);
  const [isConsulting, setIsConsulting] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedPatientForPrescription, setSelectedPatientForPrescription] = useState(null);
  const [appointmentsSearch, setAppointmentsSearch] = useState('');
  const [labResultsSearch, setLabResultsSearch] = useState('');
  const [appointmentsStatusFilter, setAppointmentsStatusFilter] = useState('all');
  const [labStatusFilter, setLabStatusFilter] = useState('all');
  const [labPriorityFilter, setLabPriorityFilter] = useState('all');
  
  const [localConsultations, setLocalConsultations] = useState([]);
  const [localPrescriptions, setLocalPrescriptions] = useState([]);
  
  // Prescription form state
  const [medSearch, setMedSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  
  const timerIntervalRef = useRef(null);
  const [currentPatient, setCurrentPatient] = useState(null);

  // Today's appointments data (replacing patient queue)
  const [todayAppointments] = useState([
    { id: 1, time: '09:00 AM', patientName: 'Mohamed Ibrahim', patientId: '1001', status: 'completed' },
    { id: 2, time: '10:30 AM', patientName: 'Hassan Ali', patientId: '1002', status: 'cancelled' },
    { id: 3, time: '11:15 AM', patientName: 'Fatma Ahmed', patientId: '1003', status: 'completed' },
    { id: 4, time: '01:00 PM', patientName: 'Youssef Mohamed', patientId: '1004', status: 'upcoming' },
    { id: 5, time: '02:00 PM', patientName: 'Mona Ahmed', patientId: '1005', status: 'upcoming' },
    { id: 6, time: '03:30 PM', patientName: 'Nada Hassan', patientId: '1006', status: 'completed' },
  ]);

  const [todayStats] = useState({
    scheduled: 12,
    completed: 5,
    remaining: 7,
  });

  // Lab Results data with table structure
  const [labResultsData] = useState([
    { 
      id: 1,
      patientName: 'Fatma Ahmed', 
      patientId: 'P-2024-001',
      testType: 'Complete Blood Count (CBC)', 
      testId: 'LAB-001',
      category: 'Hematology', 
      status: 'Critical', 
      priority: 'high'
    },
    { 
      id: 2,
      patientName: 'Mohamed Ibrahim', 
      patientId: 'P-2024-002',
      testType: 'Lipid Panel', 
      testId: 'LAB-002',
      category: 'Chemistry', 
      status: 'Completed', 
      priority: 'medium'
    },
    { 
      id: 3,
      patientName: 'Mona Ahmed', 
      patientId: 'P-2024-003',
      testType: 'Thyroid Function Tests', 
      testId: 'LAB-003',
      category: 'Endocrinology', 
      status: 'Pending', 
      priority: 'medium'
    },
    { 
      id: 4,
      patientName: 'Youssef Mohamed', 
      patientId: 'P-2024-004',
      testType: 'Liver Function Tests', 
      testId: 'LAB-004',
      category: 'Chemistry', 
      status: 'Completed', 
      priority: 'low'
    },
  ]);

  // Today's Tasks data
  const [todayTasks, setTodayTasks] = useState([
    { id: 1, task: "Call Youssef Mohamed about test results", time: "10:30 AM", completed: false, highlighted: true },
    { id: 2, task: "Review Fatma Ahmed's MRI scan", time: "10:30 AM", completed: false, highlighted: false },
    { id: 3, task: "Follow up with family Clean prescription", time: "2:00 PM", completed: false, highlighted: false },
    { id: 4, task: "Complete weekly reports", time: "Due 8 days", completed: false, highlighted: false },
    { id: 5, task: "Check lab results for Nada Ahmed", time: "2:00 PM", completed: true, highlighted: false },
  ]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Today's Summary data
  const [todaySummary] = useState({
    appointments: 8,
    pendingResults: 3,
    newMessages: 2,
  });

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

  const safeUpdateConsultationTimer = (timerValue) => {
    try {
      if (patientContextFunctions.updateConsultationTimer && typeof patientContextFunctions.updateConsultationTimer === 'function') {
        patientContextFunctions.updateConsultationTimer(timerValue);
      }
    } catch (error) {
      console.warn('Failed to update consultation timer in context:', error);
    }
  };

  useEffect(() => {
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

  const handleAddPrescription = (patient = null) => {
    const patientToUse = patient || currentPatient;
    if (!patientToUse) {
      Alert.alert('Error', 'Please select a patient first.');
      return;
    }
    setSelectedPatientForPrescription(patientToUse);
    setShowPrescriptionModal(true);
  };

  const safeSavePrescription = (prescription) => {
    try {
      if (patientContextFunctions.savePrescription && typeof patientContextFunctions.savePrescription === 'function') {
        const result = patientContextFunctions.savePrescription(prescription);
        if (result && result.success) {
          return { success: true };
        }
      }
      
      const prescriptionRecord = {
        id: Date.now().toString(),
        ...prescription,
        timestamp: new Date().toISOString(),
        patientId: selectedPatientForPrescription?.id || currentPatient?.id,
      };
      setLocalPrescriptions(prev => [...prev, prescriptionRecord]);
      return { success: true };
    } catch (error) {
      console.warn('Failed to save prescription, using fallback:', error);
      const prescriptionRecord = {
        id: Date.now().toString(),
        ...prescription,
        timestamp: new Date().toISOString(),
        patientId: selectedPatientForPrescription?.id || currentPatient?.id,
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
    
    const patientToUse = selectedPatientForPrescription || currentPatient;
    if (!patientToUse) {
      Alert.alert('Error', 'No patient selected.');
      return;
    }
    
    const prescription = {
      medication: selectedMed,
      dosage,
      frequency,
      duration,
      patientName: typeof patientToUse === 'string' ? patientToUse : patientToUse.name || patientToUse.patientName,
    };
    
    const result = safeSavePrescription(prescription);
    
    if (result && result.success) {
      Alert.alert(
        'Success',
        `Prescription saved successfully!

Patient: ${prescription.patientName}
Medication: ${selectedMed}
Dosage: ${dosage}
Frequency: ${frequency}
Duration: ${duration}`,
        [{ text: 'OK' }]
      );
      setShowPrescriptionModal(false);
      setSelectedMed('');
      setMedSearch('');
      setDosage('');
      setFrequency('');
      setDuration('');
      setSelectedPatientForPrescription(null);
    } else {
      Alert.alert('Error', result?.error || 'Failed to save prescription');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  };

  const getCurrentDateFormatted = () => {
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleAddNewTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    const newTask = {
      id: Date.now(),
      task: newTaskTitle.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      completed: false,
      highlighted: false,
    };
    setTodayTasks([...todayTasks, newTask]);
    setNewTaskTitle('');
    setShowAddTaskModal(false);
    Alert.alert('Success', 'Task added successfully');
  };

  const handleToggleTaskComplete = (taskId) => {
    setTodayTasks(todayTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const navigateToScreen = (screen) => {
    setShowSidebar(false);
    setActiveScreen(screen);
    if (screen === 'dashboard') {
      // Already on dashboard
    } else if (screen === 'patients') {
      router.push('/MyPatientsScreen');
    } else if (screen === 'appointments') {
      router.push('/Appointments');
    } else if (screen === 'clinical-tools') {
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

  const safeStartConsultation = (patient) => {
    try {
      if (patientContextFunctions.startConsultation && typeof patientContextFunctions.startConsultation === 'function') {
        patientContextFunctions.startConsultation(patient);
      }
    } catch (error) {
      console.warn('Failed to start consultation in context, continuing with local state:', error);
    }
  };

  const handleStartConsultation = (appointment) => {
    const patient = {
      id: appointment.id,
      name: appointment.patientName,
      chiefComplaint: 'Appointment consultation',
    };
    setCurrentPatient(patient);
    setIsConsulting(true);
    setConsultationTimer(0);
    setConsultationNotes('');
    safeStartConsultation(patient);
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
    
    Alert.alert(
      'End Consultation',
      `Are you sure you want to end consultation with ${patientName}?

Duration: ${formatTime(finalTimer)}

Consultation notes will be saved automatically.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
        },
        {
          text: 'End Consultation',
          style: 'destructive',
          onPress: async () => {
            try {
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
              }
              
              setIsConsulting(false);
              
              const notesToSave = consultationNotes.trim() || 'Consultation completed';
              
              let saveResult = { success: false };
              
              try {
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
                    throw new Error(contextResult?.error || 'Context save failed');
                  }
                } else {
                  throw new Error('Context function not available');
                }
              } catch (error) {
                console.warn('Failed to save via context, using fallback:', error);
                
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

              if (!saveResult.success) {
                Alert.alert(
                  'Warning', 
                  'Consultation ended but data may not be saved. Consultation notes have been preserved locally.',
                  [{ text: 'OK' }]
                );
              }

              setConsultationTimer(0);
              setConsultationNotes('');
              setCurrentPatient(null);

              Alert.alert(
                'Consultation Completed',
                `Consultation with ${patientName} has been successfully completed.\n\nDuration: ${formatTime(finalTimer)}`,
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error ending consultation:', error);
              Alert.alert(
                'Error', 
                'An unexpected error occurred while ending the consultation. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { name: 'checkmark-circle', color: '#10b981' };
      case 'cancelled':
        return { name: 'close-circle', color: '#ef4444' };
      case 'upcoming':
        return { name: 'time', color: '#2563eb' };
      default:
        return { name: 'ellipse', color: '#6b7280' };
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      case 'upcoming':
        return '#2563eb';
      default:
        return '#6b7280';
    }
  };

  // Filter lab results
  const filteredLabResults = labResultsData.filter(result => {
    const matchesSearch = labResultsSearch === '' || 
      result.patientName.toLowerCase().includes(labResultsSearch.toLowerCase()) ||
      result.testType.toLowerCase().includes(labResultsSearch.toLowerCase());
    const matchesStatus = labStatusFilter === 'all' || result.status.toLowerCase() === labStatusFilter.toLowerCase();
    const matchesPriority = labPriorityFilter === 'all' || result.priority === labPriorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Filter appointments
  const filteredAppointments = todayAppointments.filter(apt => {
    const matchesSearch = appointmentsSearch === '' || 
      apt.patientName.toLowerCase().includes(appointmentsSearch.toLowerCase()) ||
      apt.patientId.toLowerCase().includes(appointmentsSearch.toLowerCase());
    const matchesStatus = appointmentsStatusFilter === 'all' || apt.status.toLowerCase() === appointmentsStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const renderSidebar = () => {
    const currentSidebarWidth = sidebarCollapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH;
    const sidebarContent = (
      <View style={[styles.sidebar, IS_TABLET && styles.sidebarFixed, sidebarCollapsed && styles.sidebarCollapsed]}>
        <View style={[styles.sidebarHeader, sidebarCollapsed && styles.sidebarHeaderCollapsed]}>
          <View style={[styles.logoContainer, sidebarCollapsed && styles.logoContainerCollapsed]}>
            <Image
              source={require('../assets/images/Logo.jpg')}
              style={sidebarCollapsed ? styles.logoImageCollapsed : styles.logoImage}
              resizeMode="contain"
            />
          </View>
          {IS_TABLET && !sidebarCollapsed && (
            <TouchableOpacity 
              onPress={() => setSidebarCollapsed(!sidebarCollapsed)} 
              style={styles.toggleSidebarBtn}
            >
              <Ionicons 
                name="chevron-back" 
                size={20} 
                color="#9ca3af" 
              />
            </TouchableOpacity>
          )}
          {!IS_TABLET && (
            <TouchableOpacity onPress={() => setShowSidebar(false)} style={styles.closeSidebarBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
        
        {sidebarCollapsed ? (
          <>
            {/* Collapsed: Icons Only */}
            <ScrollView style={styles.sidebarContentCollapsed}>
              <TouchableOpacity
                style={[styles.sidebarItemCollapsed, styles.sidebarItemActiveCollapsed]}
                onPress={() => navigateToScreen('dashboard')}
              >
                <Ionicons name="home" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItemCollapsed}
                onPress={() => navigateToScreen('appointments')}
              >
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItemCollapsed}
                onPress={() => navigateToScreen('patients')}
              >
                <MaterialCommunityIcons name="account-group" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItemCollapsed}
                onPress={() => navigateToScreen('clinical-tools')}
              >
                <MaterialCommunityIcons name="file-document" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItemCollapsed}
                onPress={() => {}}
              >
                <MaterialCommunityIcons name="test-tube" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItemCollapsed}
                onPress={() => {}}
              >
                <Ionicons name="bar-chart" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </ScrollView>
            
            {/* Utility Icons at Bottom */}
            <View style={styles.sidebarFooterCollapsed}>
              <TouchableOpacity
                style={styles.sidebarItemCollapsed}
                onPress={() => navigateToScreen('profile')}
              >
                <Ionicons name="settings-outline" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItemCollapsed}
                onPress={() => {}}
              >
                <Ionicons name="help-circle-outline" size={24} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItemCollapsed}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            
            {/* Toggle Button at Bottom */}
            {IS_TABLET && (
              <TouchableOpacity 
                onPress={() => setSidebarCollapsed(!sidebarCollapsed)} 
                style={styles.toggleSidebarBtnCollapsed}
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color="#9ca3af" 
                />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {/* Expanded: Full Sidebar */}
            <ScrollView style={styles.sidebarContent}>
              <TouchableOpacity
                style={[styles.sidebarItem, styles.sidebarItemActive]}
                onPress={() => navigateToScreen('dashboard')}
              >
                <Ionicons name="home" size={24} color="#fff" />
                <Text style={[styles.sidebarItemText, styles.sidebarItemTextActive]}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('appointments')}
              >
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#9ca3af" />
                <Text style={[styles.sidebarItemText, styles.sidebarItemTextInactive]}>My Appointments</Text>
                <View style={styles.sidebarBadge}>
                  <Text style={styles.sidebarBadgeText}>{todayAppointments.filter(a => a.status === 'upcoming').length}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('patients')}
              >
                <MaterialCommunityIcons name="account-group" size={24} color="#9ca3af" />
                <Text style={[styles.sidebarItemText, styles.sidebarItemTextInactive]}>Patients</Text>
                <View style={styles.sidebarBadge}>
                  <Text style={styles.sidebarBadgeText}>12</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('clinical-tools')}
              >
                <MaterialCommunityIcons name="file-document" size={24} color="#9ca3af" />
                <Text style={[styles.sidebarItemText, styles.sidebarItemTextInactive]}>Prescriptions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => {}}
              >
                <MaterialCommunityIcons name="test-tube" size={24} color="#9ca3af" />
                <Text style={[styles.sidebarItemText, styles.sidebarItemTextInactive]}>Lab Results</Text>
                <View style={styles.sidebarBadge}>
                  <Text style={styles.sidebarBadgeText}>{labResultsData.filter(r => r.status === 'Pending' || r.status === 'Critical').length}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sidebarItem}
                onPress={() => navigateToScreen('profile')}
              >
                <Ionicons name="settings-outline" size={24} color="#9ca3af" />
                <Text style={[styles.sidebarItemText, styles.sidebarItemTextInactive]}>Settings</Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.sidebarFooter}>
              <View style={styles.profileCard}>
                <View style={styles.profilePictureContainer}>
                  <Image
                    source={require('../assets/images/ahmed-nabel.jpg')}
                    style={styles.profilePicture}
                  />
                </View>
                <Text style={styles.profileName}>Dr. Ahmed Nabel</Text>
                <Text style={styles.profileTitle}>Super Admin</Text>
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.profileActionButton}
                    onPress={() => navigateToScreen('profile')}
                  >
                    <Ionicons name="settings-outline" size={22} color="#9ca3af" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.profileActionButton}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={22} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    );

    if (IS_TABLET) {
      const currentWidth = sidebarCollapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH;
      return (
        <View style={[styles.sidebarWrapper, { width: currentWidth }]}>
          {sidebarContent}
        </View>
      );
    } else {
      return (
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
            <View style={styles.sidebarMobile} onStartShouldSetResponder={() => true}>
              {sidebarContent}
            </View>
          </TouchableOpacity>
        </Modal>
      );
    }
  };

  const renderBottomNavigation = () => {
    const navItems = [
      {
        id: 'dashboard',
        icon: 'home',
        iconFamily: 'Ionicons',
        label: 'Dashboard',
      },
      {
        id: 'appointments',
        icon: 'calendar-clock',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Appointments',
      },
      {
        id: 'patients',
        icon: 'account-group',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Patients',
      },
      {
        id: 'clinical-tools',
        icon: 'file-document',
        iconFamily: 'MaterialCommunityIcons',
        label: 'Prescriptions',
      },
      {
        id: 'profile',
        icon: 'settings-outline',
        iconFamily: 'Ionicons',
        label: 'Settings',
      },
    ];

    return (
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          {navItems.map((item) => {
            const IconComponent = item.iconFamily === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
            const isActive = activeScreen === item.id;
            
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.bottomNavItem, isActive && styles.bottomNavItemActive]}
                onPress={() => navigateToScreen(item.id)}
                activeOpacity={0.7}
              >
                <IconComponent
                  name={item.icon}
                  size={22}
                  color={isActive ? '#fff' : '#9ca3af'}
                />
                {isActive && <View style={styles.bottomNavIndicator} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={!IS_TABLET && Platform.OS === 'ios' ? styles.containerMobileIOS : styles.container}>
      <View style={[styles.mainLayout, !IS_TABLET && styles.mainLayoutMobile]}>
        {/* Sidebar */}
        {IS_TABLET && renderSidebar()}
        
        {/* Main Content */}
        <View style={[
          styles.mainContent, 
          IS_TABLET && { marginLeft: sidebarCollapsed ? COLLAPSED_SIDEBAR_WIDTH : SIDEBAR_WIDTH },
          !IS_TABLET && styles.mainContentMobile
        ]}>
          {/* Header */}
          <View style={[styles.header, !IS_TABLET && styles.headerMobile]}>
            {/* Hamburger menu removed in mobile - bottom nav bar handles navigation */}
            <View style={[styles.headerContent, !IS_TABLET && styles.headerContentMobile]}>
              <Text 
                style={[styles.greeting, !IS_TABLET && styles.greetingMobile]}
                numberOfLines={IS_TABLET ? undefined : 2}
                ellipsizeMode="tail"
                allowFontScaling={true}
              >
                {`${getGreeting()}, Dr. Ahmed Nabel`}
              </Text>
              <Text 
                style={[styles.motivationalText, !IS_TABLET && styles.motivationalTextMobile]}
                numberOfLines={1}
                ellipsizeMode="tail"
                allowFontScaling={true}
              >
                Have a great and productive day
              </Text>
            </View>
            <View style={[styles.headerRight, !IS_TABLET && styles.headerRightMobile]}>
              <TouchableOpacity 
                onPress={() => setShowCalendar(!showCalendar)} 
                style={[styles.dateButton, !IS_TABLET && styles.dateButtonMobile]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="calendar-outline" size={IS_TABLET ? 20 : 18} color="#2563eb" />
                {IS_TABLET ? (
                  <Text style={styles.dateText}>{getCurrentDate()}</Text>
                ) : SCREEN_WIDTH > 360 ? (
                  <Text style={styles.dateTextMobile} numberOfLines={1} ellipsizeMode="tail">{getCurrentDate()}</Text>
                ) : null}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.notificationButton, !IS_TABLET && styles.notificationButtonMobile]}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="notifications-outline" size={24} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={[styles.content, !IS_TABLET && styles.contentMobile]} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={!IS_TABLET ? styles.contentContainerMobile : undefined}
            bounces={Platform.OS === 'ios'}
          >
            {/* Key Metrics Cards */}
            <View style={[styles.metricsRow, !IS_TABLET && styles.metricsRowMobile]}>
              {/* Write Prescription Card - Left */}
              <TouchableOpacity 
                style={[styles.metricCardBase, styles.prescriptionCardNew]}
                onPress={() => {
                  const params = currentPatient 
                    ? { patientName: currentPatient.name, patientId: currentPatient.id.toString() }
                    : {};
                  router.push({
                    pathname: '/ClinicalToolsScreen',
                    params: params
                  });
                }}
                activeOpacity={0.8}
              >
                <View style={styles.prescriptionCardContent}>
                  {/* Icon and Title Section */}
                  <View style={styles.prescriptionCardTopSection}>
                    <View style={styles.prescriptionIconContainer}>
                      <MaterialCommunityIcons name="prescription" size={32} color="#fff" />
                    </View>
                    <Text style={styles.prescriptionCardTitle}>WRITE PRESCRIPTION</Text>
                  </View>
                  
                  {/* Primary Action Button */}
                  <View style={styles.prescriptionCardButtonSection}>
                    <TouchableOpacity
                      style={styles.prescriptionCreateButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        const params = currentPatient 
                          ? { patientName: currentPatient.name, patientId: currentPatient.id.toString() }
                          : {};
                        router.push({
                          pathname: '/ClinicalToolsScreen',
                          params: params
                        });
                      }}
                    >
                      <Ionicons name="add-circle" size={28} color="#2563eb" />
                      <Text style={styles.prescriptionCreateButtonText}>NEW PRESCRIPTION</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Description */}
                  <View style={styles.prescriptionCardDescriptionSection}>
                    <Text style={styles.prescriptionCardDescription}>
                      Quickly create and manage patient prescriptions
                    </Text>
                  </View>
                </View>
                
                {/* Gradient Overlay Effect */}
                <View style={styles.prescriptionCardGradientOverlay} />
                
                {/* Decorative Medical Symbol */}
                <View style={styles.prescriptionCardDecoration}>
                  <MaterialCommunityIcons name="medical-bag" size={80} color="rgba(255, 255, 255, 0.08)" />
                </View>
              </TouchableOpacity>

              {/* Today's Tasks Card - Right */}
              <View style={[styles.metricCardBase, styles.tasksCard]}>
                <View style={styles.tasksCardHeader}>
                  <View style={styles.tasksCardTitleContainer}>
                    <MaterialCommunityIcons name="clipboard-check" size={20} color="#111827" />
                    <Text style={styles.tasksCardTitle}>Today's Tasks</Text>
                  </View>
                  <TouchableOpacity onPress={() => {
                    // Show all tasks - could navigate to a full tasks page or show in a modal
                    Alert.alert(
                      'All Tasks',
                      todayTasks.map((t, idx) => `${idx + 1}. ${t.task} (${t.time})`).join('\n'),
                      [{ text: 'OK' }]
                    );
                  }}>
                    <Text style={styles.tasksCardLink}>View All {'>'}</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.tasksCardBody}>
                  {todayTasks.slice(0, 2).map((task, index) => (
                    <TouchableOpacity 
                      key={task.id} 
                      style={styles.taskItem}
                      onPress={() => handleToggleTaskComplete(task.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.taskItemRow}>
                        <View style={styles.taskCheckbox}>
                          {task.completed ? (
                            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                          ) : (
                            <Ionicons name="ellipse-outline" size={20} color="#6b7280" />
                          )}
                        </View>
                        <View style={styles.taskContent}>
                          <Text 
                            style={[
                              styles.taskText,
                              task.completed && styles.taskTextCompleted
                            ]}
                            numberOfLines={2}
                          >
                            {task.task}
                          </Text>
                          <Text style={styles.taskTime}>{task.time}</Text>
                        </View>
                      </View>
                      {index < todayTasks.slice(0, 2).length - 1 && (
                        <View style={styles.taskDivider} />
                      )}
                    </TouchableOpacity>
                  ))}
                  {todayTasks.length === 0 && (
                    <View style={styles.emptyTasksContainer}>
                      <Text style={styles.emptyTasksText}>No tasks for today</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.tasksCardFooter}>
                  <TouchableOpacity
                    style={[styles.newTaskButton, !IS_TABLET && styles.newTaskButtonMobile]}
                    onPress={() => {
                      setShowAddTaskModal(true);
                    }}
                  >
                    <Ionicons name="add" size={20} color="#2563eb" />
                    <Text style={styles.newTaskButtonText}>Add New Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Currently Consulting Section */}
            {isConsulting && currentPatient ? (
              <View style={styles.consultingCard}>
                <View style={styles.consultingHeader}>
                  <MaterialCommunityIcons name="stethoscope" size={24} color="#2563eb" />
                  <Text style={styles.consultingTitle}>Currently Consulting</Text>
                  <TouchableOpacity onPress={handleEndConsultation}>
                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.patientName}>{currentPatient.name}</Text>
                <View style={styles.timerContainer}>
                  <Ionicons name="time-outline" size={20} color="#2563eb" />
                  <Text style={styles.timerText}>{formatTime(consultationTimer)}</Text>
                </View>
                
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Consultation Notes:</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Enter consultation notes..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    value={consultationNotes}
                    onChangeText={setConsultationNotes}
                  />
                </View>

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
            ) : null}

            {/* Two Column Layout */}
            <View style={styles.twoColumnLayout}>
              {/* Left Column - Appointments (50%) */}
              <View style={styles.leftColumn}>
                <View style={styles.section}>
                  <View style={styles.sectionHeaderWithSearch}>
                    <Text style={[styles.sectionTitle, !IS_TABLET && styles.sectionTitleMobile]}>Today's Appointments</Text>
                  </View>
                  
                  {/* Search and Filters */}
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInputSmall}
                      placeholder="Search appointments..."
                      placeholderTextColor="#9ca3af"
                      value={appointmentsSearch}
                      onChangeText={setAppointmentsSearch}
                    />
                  </View>
                  <View style={[styles.filterRow, !IS_TABLET && styles.filterRowMobile]}>
                    <TouchableOpacity 
                      style={[styles.filterButton, appointmentsStatusFilter !== 'all' && styles.filterButtonActive, !IS_TABLET && styles.filterButtonMobile]}
                      onPress={() => setAppointmentsStatusFilter(appointmentsStatusFilter === 'all' ? 'upcoming' : appointmentsStatusFilter === 'upcoming' ? 'completed' : appointmentsStatusFilter === 'completed' ? 'cancelled' : 'all')}
                    >
                      <Text style={[styles.filterButtonText, appointmentsStatusFilter !== 'all' && styles.filterButtonTextActive, !IS_TABLET && styles.filterButtonTextMobile]} numberOfLines={1}>
                        {appointmentsStatusFilter === 'all' ? 'All Status' : appointmentsStatusFilter.charAt(0).toUpperCase() + appointmentsStatusFilter.slice(1)}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={appointmentsStatusFilter !== 'all' ? "#2563eb" : "#6b7280"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterIconButton, !IS_TABLET && styles.filterIconButtonMobile]}>
                      <Ionicons name="filter" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterIconButton, !IS_TABLET && styles.filterIconButtonMobile]}>
                      <Ionicons name="download-outline" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  {IS_TABLET ? (
                    <View style={styles.appointmentsTable}>
                      <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Time</Text>
                        <Text style={styles.tableHeaderText}>Patient Name</Text>
                        <Text style={styles.tableHeaderText}>Patient ID</Text>
                        <Text style={styles.tableHeaderText}>Status</Text>
                      </View>
                      {filteredAppointments.map((appointment) => {
                        const statusIcon = getStatusIcon(appointment.status);
                        return (
                          <TouchableOpacity
                            key={appointment.id}
                            style={styles.tableRow}
                            onPress={() => {
                              if (appointment.status === 'upcoming') {
                                handleStartConsultation(appointment);
                              }
                            }}
                          >
                            <Text style={styles.tableCell}>{appointment.time}</Text>
                            <Text style={styles.tableCell}>{appointment.patientName}</Text>
                            <Text style={styles.tableCell}>{appointment.patientId}</Text>
                            <View style={styles.statusCell}>
                              <Ionicons name={statusIcon.name} size={16} color={statusIcon.color} />
                              <Text style={[styles.statusText, { color: getStatusTextColor(appointment.status) }]}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={true}
                      style={styles.tableScrollContainer}
                      contentContainerStyle={styles.tableScrollContent}
                    >
                      <View style={styles.appointmentsTable}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.tableHeaderText, styles.tableHeaderTextMobile]}>Time</Text>
                          <Text style={[styles.tableHeaderText, styles.tableHeaderTextMobile]}>Patient Name</Text>
                          <Text style={[styles.tableHeaderText, styles.tableHeaderTextMobile]}>Patient ID</Text>
                          <Text style={[styles.tableHeaderText, styles.tableHeaderTextMobile]}>Status</Text>
                        </View>
                        {filteredAppointments.map((appointment) => {
                          const statusIcon = getStatusIcon(appointment.status);
                          return (
                            <TouchableOpacity
                              key={appointment.id}
                              style={[styles.tableRow, styles.tableRowMobile]}
                              onPress={() => {
                                if (appointment.status === 'upcoming') {
                                  handleStartConsultation(appointment);
                                }
                              }}
                            >
                              <Text style={[styles.tableCell, styles.tableCellMobile]} numberOfLines={1}>{appointment.time}</Text>
                              <Text style={[styles.tableCell, styles.tableCellMobile]} numberOfLines={1}>{appointment.patientName}</Text>
                              <Text style={[styles.tableCell, styles.tableCellMobile]} numberOfLines={1}>{appointment.patientId}</Text>
                              <View style={[styles.statusCell, styles.statusCellMobile]}>
                                <Ionicons name={statusIcon.name} size={16} color={statusIcon.color} />
                                <Text style={[styles.statusText, { color: getStatusTextColor(appointment.status) }, styles.statusTextMobile]} numberOfLines={1}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  )}
                </View>
              </View>

              {/* Right Column - Lab Results (50%) */}
              <View style={styles.rightColumn}>
                {/* Lab Results Section */}
                <View style={styles.section}>
                  <View style={styles.sectionHeaderWithSearch}>
                    <Text style={[styles.sectionTitle, !IS_TABLET && styles.sectionTitleMobile]}>Lab Results</Text>
                  </View>
                  
                  {/* Search and Filters */}
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
                    <TextInput
                      style={styles.searchInputSmall}
                      placeholder="Search results..."
                      placeholderTextColor="#9ca3af"
                      value={labResultsSearch}
                      onChangeText={setLabResultsSearch}
                    />
                  </View>
                  <View style={[styles.filterRow, !IS_TABLET && styles.filterRowMobile]}>
                    <TouchableOpacity 
                      style={[styles.filterButton, labStatusFilter !== 'all' && styles.filterButtonActive, !IS_TABLET && styles.filterButtonMobile]}
                      onPress={() => setLabStatusFilter(labStatusFilter === 'all' ? 'critical' : labStatusFilter === 'critical' ? 'completed' : labStatusFilter === 'completed' ? 'pending' : 'all')}
                    >
                      <Text style={[styles.filterButtonText, labStatusFilter !== 'all' && styles.filterButtonTextActive, !IS_TABLET && styles.filterButtonTextMobile]} numberOfLines={1}>
                        {labStatusFilter === 'all' ? 'All Status' : labStatusFilter.charAt(0).toUpperCase() + labStatusFilter.slice(1)}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={labStatusFilter !== 'all' ? "#2563eb" : "#6b7280"} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.filterButton, labPriorityFilter !== 'all' && styles.filterButtonActive, !IS_TABLET && styles.filterButtonMobile]}
                      onPress={() => setLabPriorityFilter(labPriorityFilter === 'all' ? 'high' : labPriorityFilter === 'high' ? 'medium' : labPriorityFilter === 'medium' ? 'low' : 'all')}
                    >
                      <Text style={[styles.filterButtonText, labPriorityFilter !== 'all' && styles.filterButtonTextActive, !IS_TABLET && styles.filterButtonTextMobile]} numberOfLines={1}>
                        {labPriorityFilter === 'all' ? 'All Priority' : labPriorityFilter.charAt(0).toUpperCase() + labPriorityFilter.slice(1)}
                      </Text>
                      <Ionicons name="chevron-down" size={16} color={labPriorityFilter !== 'all' ? "#2563eb" : "#6b7280"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterIconButton, !IS_TABLET && styles.filterIconButtonMobile]}>
                      <Ionicons name="filter" size={20} color="#6b7280" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterIconButton, !IS_TABLET && styles.filterIconButtonMobile]}>
                      <Ionicons name="download-outline" size={20} color="#6b7280" />
                    </TouchableOpacity>
                  </View>

                  {IS_TABLET ? (
                    <View style={styles.labResultsTable}>
                      <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderText}>Patient</Text>
                        <Text style={styles.tableHeaderText}>Test Type</Text>
                        <Text style={styles.tableHeaderText}>Category</Text>
                        <Text style={styles.tableHeaderText}>Status</Text>
                        <Text style={styles.tableHeaderText}>Pri</Text>
                      </View>
                      {filteredLabResults.map((result) => {
                        const getStatusColor = (status) => {
                          switch (status) {
                            case 'Critical': return '#ef4444';
                            case 'Completed': return '#10b981';
                            case 'Pending': return '#f59e0b';
                            default: return '#6b7280';
                          }
                        };
                        const getPriorityColor = (priority) => {
                          switch (priority) {
                            case 'high': return '#ef4444';
                            case 'medium': return '#f59e0b';
                            case 'low': return '#10b981';
                            default: return '#6b7280';
                          }
                        };
                        return (
                          <TouchableOpacity
                            key={result.id}
                            style={styles.tableRow}
                            onPress={() => {
                              // Navigate to view lab results details
                              router.push({
                                pathname: '/ClinicalToolsScreen',
                                params: { 
                                  screen: 'lab-results',
                                  patientId: result.patientId,
                                  patientName: result.patientName,
                                  testType: result.testType,
                                  resultId: result.id
                                }
                              });
                            }}
                          >
                            <View style={styles.tableCell}>
                              <Text style={styles.tableCellText}>{result.patientName}</Text>
                              <Text style={styles.tableCellSubtext}>{result.patientId}</Text>
                            </View>
                            <View style={styles.tableCell}>
                              <Text style={styles.tableCellText}>{result.testType}</Text>
                              <Text style={styles.tableCellSubtext}>{result.testId}</Text>
                            </View>
                            <Text style={styles.tableCell}>{result.category}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) + '20' }]}>
                              <Text style={[styles.statusBadgeText, { color: getStatusColor(result.status) }]}>
                                {result.status}
                              </Text>
                            </View>
                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(result.priority) }]} />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={true}
                      style={styles.tableScrollContainer}
                      contentContainerStyle={styles.tableScrollContent}
                    >
                      <View style={styles.labResultsTable}>
                        <View style={styles.tableHeader}>
                          <Text style={[styles.tableHeaderText, styles.tableHeaderTextMobile]}>Patient</Text>
                          <Text style={[styles.tableHeaderText, styles.tableHeaderTextMobile]}>Test Type</Text>
                          <Text style={[styles.tableHeaderText, styles.tableHeaderTextMobile]}>Category</Text>
                          <Text style={[styles.tableHeaderText, styles.tableHeaderTextMobile]}>Status</Text>
                          <Text style={[styles.tableHeaderText, styles.tableHeaderTextMobile]}>Pri</Text>
                        </View>
                        {filteredLabResults.map((result) => {
                          const getStatusColor = (status) => {
                            switch (status) {
                              case 'Critical': return '#ef4444';
                              case 'Completed': return '#10b981';
                              case 'Pending': return '#f59e0b';
                              default: return '#6b7280';
                            }
                          };
                          const getPriorityColor = (priority) => {
                            switch (priority) {
                              case 'high': return '#ef4444';
                              case 'medium': return '#f59e0b';
                              case 'low': return '#10b981';
                              default: return '#6b7280';
                            }
                          };
                          return (
                            <TouchableOpacity
                              key={result.id}
                              style={[styles.tableRow, styles.tableRowMobile]}
                              onPress={() => {
                                // Navigate to view lab results details
                                router.push({
                                  pathname: '/ClinicalToolsScreen',
                                  params: { 
                                    screen: 'lab-results',
                                    patientId: result.patientId,
                                    patientName: result.patientName,
                                    testType: result.testType,
                                    resultId: result.id
                                  }
                                });
                              }}
                            >
                              <View style={[styles.tableCell, styles.tableCellMobile]}>
                                <Text style={[styles.tableCellText, styles.tableCellTextMobile]} numberOfLines={1}>{result.patientName}</Text>
                                <Text style={[styles.tableCellSubtext, styles.tableCellSubtextMobile]} numberOfLines={1}>{result.patientId}</Text>
                              </View>
                              <View style={[styles.tableCell, styles.tableCellMobile]}>
                                <Text style={[styles.tableCellText, styles.tableCellTextMobile]} numberOfLines={1}>{result.testType}</Text>
                                <Text style={[styles.tableCellSubtext, styles.tableCellSubtextMobile]} numberOfLines={1}>{result.testId}</Text>
                              </View>
                              <Text style={[styles.tableCell, styles.tableCellMobile]} numberOfLines={1}>{result.category}</Text>
                              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(result.status) + '20' }, styles.statusBadgeMobile]}>
                                <Text style={[styles.statusBadgeText, { color: getStatusColor(result.status) }, styles.statusBadgeTextMobile]} numberOfLines={1}>
                                  {result.status}
                                </Text>
                              </View>
                              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(result.priority) }, styles.priorityDotMobile]} />
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  )}
                </View>

              </View>
            </View>

            {/* Patient Statistics */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, !IS_TABLET && styles.sectionTitleMobile]}>Patient Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>12</Text>
                  <View style={styles.statTrend}>
                    <Ionicons name="arrow-down" size={14} color="#ef4444" />
                    <Text style={styles.statTrendText}>11% week</Text>
                  </View>
                  <Text style={styles.statLabel}>New patients</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>24</Text>
                  <Ionicons name="bar-chart-outline" size={20} color="#2563eb" style={styles.statIcon} />
                  <Text style={styles.statLabel}>Insurance patients</Text>
                </View>
              </View>
            </View>

            {/* Lab Results Panel */}
            {isConsulting && currentPatient && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="test-tube" size={24} color="#2563eb" />
                  <Text style={[styles.sectionTitle, !IS_TABLET && styles.sectionTitleMobile]}>Recent Lab Results</Text>
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
            )}

            {/* Patient Charts Quick View */}
            {isConsulting && currentPatient && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, !IS_TABLET && styles.sectionTitleMobile]} numberOfLines={2} ellipsizeMode="tail">Current Patient: {currentPatient.name}</Text>

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

                <View style={styles.medicationsCard}>
                  <Text style={styles.medicationsTitle}>Active Medications</Text>
                  {activeMedications.map((med, index) => (
                    <View key={index} style={styles.medicationItem}>
                      <Ionicons name="medical" size={20} color="#2563eb" />
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

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, !IS_TABLET && styles.sectionTitleMobile]}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity
                  style={[styles.quickActionButton, !IS_TABLET && styles.quickActionButtonMobile]}
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
                  <MaterialCommunityIcons name="prescription" size={32} color="#2563eb" />
                  <Text style={styles.quickActionText}>Prescription</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, !IS_TABLET && styles.quickActionButtonMobile]}
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
                  <MaterialCommunityIcons name="clipboard-list" size={32} color="#10b981" />
                  <Text style={styles.quickActionText}>Ontology</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, !IS_TABLET && styles.quickActionButtonMobile]}
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
                  <MaterialCommunityIcons name="file-document" size={32} color="#f59e0b" />
                  <Text style={styles.quickActionText}>Clinical Notes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickActionButton, !IS_TABLET && styles.quickActionButtonMobile]}
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
                  <MaterialCommunityIcons name="medical-bag" size={32} color="#8b5cf6" />
                  <Text style={styles.quickActionText}>Diagnosis</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Mobile Sidebar */}
      {!IS_TABLET && renderSidebar()}

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
              <TouchableOpacity onPress={() => {
                setShowPrescriptionModal(false);
                setSelectedPatientForPrescription(null);
              }}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Search Medication *</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Type to search medications..."
                  placeholderTextColor="#9ca3af"
                  value={medSearch}
                  onChangeText={(text) => {
                    setMedSearch(text);
                    if (text && !selectedMed) {
                      const matches = medications.filter((med) =>
                        med.toLowerCase().includes(text.toLowerCase())
                      );
                      if (matches.length === 1) {
                        setSelectedMed(matches[0]);
                      }
                    }
                  }}
                />
                
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
                        <Ionicons name="medical" size={20} color="#2563eb" />
                        <Text style={styles.suggestionText}>{med}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {selectedMed && (
                  <View style={styles.selectedMedication}>
                    <Text style={styles.selectedMedText}>Selected: {selectedMed}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedMed('');
                        setMedSearch('');
                      }}
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Dosage *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 500mg, 10mg, 1 tablet"
                  placeholderTextColor="#9ca3af"
                  value={dosage}
                  onChangeText={setDosage}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Frequency *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., BID (twice daily), QD (once daily), TID (three times daily)"
                  placeholderTextColor="#9ca3af"
                  value={frequency}
                  onChangeText={setFrequency}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Duration *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 7 days, 30 days, 90 days"
                  placeholderTextColor="#9ca3af"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
            </ScrollView>

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
                  setSelectedPatientForPrescription(null);
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

      {/* Add Task Modal */}
      <Modal
        visible={showAddTaskModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.prescriptionModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Task</Text>
              <TouchableOpacity onPress={() => {
                setShowAddTaskModal(false);
                setNewTaskTitle('');
              }}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Task Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter task title..."
                  placeholderTextColor="#9ca3af"
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddTaskModal(false);
                  setNewTaskTitle('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddNewTask}
              >
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Mobile Bottom Navigation Bar */}
      {!IS_TABLET && renderBottomNavigation()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  // Mobile-specific container styles
  containerMobileIOS: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: Platform.OS === 'ios' ? 0 : 0, // SafeAreaView handles this
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainLayoutMobile: {
    flexDirection: 'column',
  },
  sidebarWrapper: {
    width: SIDEBAR_WIDTH,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  sidebar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1f2937',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  sidebarFixed: {
    position: 'absolute',
  },
  sidebarMobile: {
    width: '85%',
    maxWidth: 320,
    height: '100%',
    backgroundColor: '#1f2937',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarHeaderCollapsed: {
    paddingHorizontal: 0,
    justifyContent: 'center',
    paddingBottom: 24,
    borderBottomWidth: 0,
  },
  sidebarCollapsed: {
    backgroundColor: '#1f2937',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  toggleSidebarBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  toggleSidebarBtnCollapsed: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    alignSelf: 'center',
    marginTop: 16,
  },
  sidebarItemActive: {
    backgroundColor: '#111827',
    borderRadius: 8,
    marginHorizontal: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  sidebarItemTextActive: {
    color: '#fff',
  },
  sidebarBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 'auto',
    minWidth: 24,
    alignItems: 'center',
  },
  sidebarBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  logoContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoContainerCollapsed: {
    width: '100%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 60,
  },
  logoImageCollapsed: {
    width: 60,
    height: 60,
  },
  closeSidebarBtn: {
    padding: 8,
  },
  sidebarContent: {
    flex: 1,
    paddingTop: 20,
  },
  sidebarContentCollapsed: {
    flex: 1,
    paddingTop: 8,
    width: '100%',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  sidebarItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: 16,
  },
  sidebarItemTextInactive: {
    color: '#9ca3af',
    fontWeight: '400',
  },
  sidebarItemCollapsed: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
    marginBottom: 4,
  },
  sidebarItemActiveCollapsed: {
    backgroundColor: 'transparent',
  },
  sidebarFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  sidebarFooterCollapsed: {
    paddingHorizontal: 0,
    paddingVertical: 16,
    borderTopWidth: 0,
    width: '100%',
    gap: 8,
  },
  profileCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profilePictureContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: -40,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  profileActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    color: '#ef4444',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  mainContentMobile: {
    paddingBottom: 80, // Add padding for bottom navigation on mobile
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'nowrap',
  },
  // Mobile-specific header styles
  headerMobile: {
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    paddingHorizontal: Platform.OS === 'ios' ? 16 : 20,
    minHeight: 44, // Ensure minimum touch target
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  headerContentMobile: {
    marginLeft: 8,
    flex: 1,
    flexShrink: 1,
  },
  // Mobile menu button with proper touch target
  mobileMenuButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  headerRightMobile: {
    flexShrink: 0,
    gap: Platform.OS === 'ios' ? 12 : 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    flexShrink: 1,
  },
  greetingMobile: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  motivationalText: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
    flexShrink: 1,
    fontWeight: '500',
  },
  motivationalTextMobile: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 0,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    gap: 8,
  },
  dateButtonMobile: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? 10 : 12,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  dateTextMobile: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    maxWidth: 90,
  },
  notificationButton: {
    padding: 8,
  },
  notificationButtonMobile: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 10 : 8,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0, // Remove top padding to merge with header
  },
  contentMobile: {
    padding: Platform.OS === 'ios' ? 16 : 20,
    paddingTop: 0, // Remove top padding to merge with header
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Space for bottom nav if added
  },
  contentContainerMobile: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  metricsRowMobile: {
    flexDirection: 'column',
    gap: Platform.OS === 'ios' ? 12 : 16,
    marginBottom: Platform.OS === 'ios' ? 20 : 24,
  },
  metricCardBase: {
    width: IS_TABLET ? '48%' : '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  metricNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  prescriptionCard: {
    backgroundColor: '#90ee90',
    minWidth: IS_TABLET ? 280 : '100%',
  },
  prescriptionCardNew: {
    backgroundColor: '#2563eb',
    height: IS_TABLET ? 320 : 280,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  prescriptionCardContent: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    zIndex: 2,
  },
  prescriptionCardTopSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  prescriptionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  prescriptionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  prescriptionCardButtonSection: {
    marginBottom: 20,
  },
  prescriptionCardDescriptionSection: {
    alignItems: 'center',
  },
  prescriptionCardDescription: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.95,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '400',
  },
  prescriptionCardGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1e40af',
    opacity: 0.3,
    zIndex: 1,
  },
  prescriptionCardDecoration: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    zIndex: 1,
    opacity: 0.3,
  },
  prescriptionCreateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  prescriptionCreateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563eb',
    letterSpacing: 0.5,
  },
  tasksCard: {
    height: IS_TABLET ? 320 : 280,
    justifyContent: 'space-between',
    padding: 16,
  },
  tasksCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tasksCardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tasksCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  tasksCardLink: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '600',
  },
  tasksCardBody: {
    flex: 1,
    marginBottom: 16,
    minHeight: 120,
  },
  taskItem: {
    marginBottom: 12,
  },
  taskItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskCheckbox: {
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 20,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
    opacity: 0.7,
  },
  taskTime: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '400',
    marginLeft: 0,
  },
  taskDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginTop: 12,
    marginLeft: 32,
  },
  tasksCardFooter: {
    marginTop: 'auto',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  emptyTasksContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyTasksText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  newTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 8,
    width: '100%',
  },
  // Ensure mobile buttons have proper touch targets
  newTaskButtonMobile: {
    minHeight: 44,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
  },
  newTaskButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  consultingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  consultingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  consultingTitle: {
    flex: 1,
    marginLeft: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  patientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  addPrescriptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  addPrescriptionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  endConsultationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  endConsultationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderWithSearch: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitleMobile: {
    fontSize: 18,
    marginBottom: 12,
  },
  twoColumnLayout: {
    flexDirection: IS_TABLET ? 'row' : 'column',
    gap: 20,
  },
  leftColumn: {
    flex: IS_TABLET ? 0.5 : 1,
  },
  rightColumn: {
    flex: IS_TABLET ? 0.5 : 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  searchInputSmall: {
    flex: 1,
    fontSize: 13,
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  filterRowMobile: {
    gap: 6,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  filterButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextMobile: {
    fontSize: 11,
  },
  filterButtonTextActive: {
    color: '#2563eb',
  },
  filterButtonMobile: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 36,
  },
  filterIconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterIconButtonMobile: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'ios' ? 10 : 8,
  },
  tableScrollContainer: {
    marginHorizontal: -4,
  },
  tableScrollContent: {
    paddingHorizontal: 4,
  },
  appointmentsTable: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minWidth: !IS_TABLET ? Math.max(SCREEN_WIDTH - 40, 600) : undefined,
  },
  labResultsTable: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minWidth: !IS_TABLET ? Math.max(SCREEN_WIDTH - 40, 600) : undefined,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusBadgeMobile: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 80,
    marginHorizontal: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusBadgeTextMobile: {
    fontSize: 10,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  priorityDotMobile: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
  },
  tasksList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskItemHighlighted: {
    backgroundColor: '#fce7f3',
  },
  taskItemCompleted: {
    opacity: 0.6,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  taskTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  taskCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    gap: 8,
  },
  addTaskButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  tasksListCompact: {
    marginBottom: 12,
  },
  taskItemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  taskTextCompact: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  taskTimeCompact: {
    fontSize: 11,
    color: '#6b7280',
  },
  taskCircleCompact: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  addTaskButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    gap: 6,
  },
  addTaskButtonTextCompact: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  tasksHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleCompact: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeaderTextMobile: {
    fontSize: 10,
    paddingHorizontal: 8,
    minWidth: 100,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableRowMobile: {
    minHeight: 44, // Ensure proper touch target
    paddingVertical: Platform.OS === 'ios' ? 14 : 16,
    paddingHorizontal: Platform.OS === 'ios' ? 12 : 16,
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  tableCellMobile: {
    fontSize: 12,
    paddingHorizontal: 8,
    minWidth: 100,
  },
  tableCellText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  tableCellTextMobile: {
    fontSize: 12,
  },
  tableCellSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  tableCellSubtextMobile: {
    fontSize: 10,
  },
  statusCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusCellMobile: {
    paddingHorizontal: 8,
    minWidth: 100,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextMobile: {
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: IS_TABLET ? 200 : '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  statTrendText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  statIcon: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  labCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  abnormalLabCard: {
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
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
    color: '#111827',
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
    color: '#111827',
    fontWeight: '600',
  },
  abnormalValue: {
    color: '#ef4444',
  },
  labNormal: {
    fontSize: 12,
    color: '#6b7280',
  },
  vitalsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vitalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  vitalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  vitalHigh: {
    color: '#ef4444',
  },
  vitalLow: {
    color: '#f59e0b',
  },
  vitalUnit: {
    fontSize: 12,
    color: '#9ca3af',
  },
  medicationsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  medicationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medicationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  medicationDetails: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: IS_TABLET ? 150 : '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionButtonMobile: {
    minHeight: 88, // Double the minimum for better mobile UX
    padding: Platform.OS === 'ios' ? 18 : 20,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  prescriptionModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
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
    color: '#111827',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  formInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  suggestionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  selectedMedication: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  selectedMedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Bottom Navigation Bar Styles (Mobile Only)
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 16,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  bottomNavItemActive: {
    // Active state styling handled by indicator
  },
  bottomNavIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 3,
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
});

export default DoctorDashboardScreen;
