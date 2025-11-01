import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PatientContext = createContext({});

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};

export const PatientProvider = ({ children }) => {
  const [activePatient, setActivePatient] = useState(null);
  const [consultationData, setConsultationData] = useState(null);
  
  // Clinical records stored by patient ID
  const [prescriptions, setPrescriptions] = useState({});
  const [testOrders, setTestOrders] = useState({});
  const [diagnoses, setDiagnoses] = useState({});
  const [clinicalNotes, setClinicalNotes] = useState({});

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedPrescriptions = await AsyncStorage.getItem('prescriptions');
        const storedTestOrders = await AsyncStorage.getItem('testOrders');
        const storedDiagnoses = await AsyncStorage.getItem('diagnoses');
        const storedClinicalNotes = await AsyncStorage.getItem('clinicalNotes');

        if (storedPrescriptions) setPrescriptions(JSON.parse(storedPrescriptions));
        if (storedTestOrders) setTestOrders(JSON.parse(storedTestOrders));
        if (storedDiagnoses) setDiagnoses(JSON.parse(storedDiagnoses));
        if (storedClinicalNotes) setClinicalNotes(JSON.parse(storedClinicalNotes));
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };
    loadStoredData();
  }, []);

  // Save data to AsyncStorage whenever it changes
  useEffect(() => {
    const savePrescriptions = async () => {
      try {
        await AsyncStorage.setItem('prescriptions', JSON.stringify(prescriptions));
      } catch (error) {
        console.error('Error saving prescriptions:', error);
      }
    };
    if (prescriptions) {
      savePrescriptions();
    }
  }, [prescriptions]);

  useEffect(() => {
    const saveTestOrders = async () => {
      try {
        await AsyncStorage.setItem('testOrders', JSON.stringify(testOrders));
      } catch (error) {
        console.error('Error saving test orders:', error);
      }
    };
    if (testOrders) {
      saveTestOrders();
    }
  }, [testOrders]);

  useEffect(() => {
    const saveDiagnoses = async () => {
      try {
        await AsyncStorage.setItem('diagnoses', JSON.stringify(diagnoses));
      } catch (error) {
        console.error('Error saving diagnoses:', error);
      }
    };
    if (diagnoses) {
      saveDiagnoses();
    }
  }, [diagnoses]);

  useEffect(() => {
    const saveClinicalNotes = async () => {
      try {
        await AsyncStorage.setItem('clinicalNotes', JSON.stringify(clinicalNotes));
      } catch (error) {
        console.error('Error saving clinical notes:', error);
      }
    };
    if (clinicalNotes) {
      saveClinicalNotes();
    }
  }, [clinicalNotes]);

  // Start consultation with a patient
  const startConsultation = (patient) => {
    setActivePatient(patient);
    setConsultationData({
      startTime: new Date().toISOString(),
      timer: 0,
      isActive: true,
    });
  };

  // End consultation and save data
  const endConsultation = async (notes = {}) => {
    if (!activePatient || !consultationData) {
      return { success: false, error: 'No active consultation' };
    }

    const consultationRecord = {
      ...consultationData,
      endTime: new Date().toISOString(),
      duration: consultationData.timer,
      patientId: activePatient.id,
      patientName: activePatient.name,
      ...notes,
    };

    try {
      // Save consultation record
      const consultations = await AsyncStorage.getItem('consultations');
      let consultationsList = consultations ? JSON.parse(consultations) : [];
      consultationsList.push(consultationRecord);
      await AsyncStorage.setItem('consultations', JSON.stringify(consultationsList));

      // Clear active consultation
      setActivePatient(null);
      setConsultationData(null);

      return { success: true };
    } catch (error) {
      console.error('Error ending consultation:', error);
      return { success: false, error: 'Failed to save consultation' };
    }
  };

  // Save prescription
  const savePrescription = (prescription) => {
    if (!activePatient) {
      return { success: false, error: 'No active patient' };
    }

    const patientId = activePatient.id.toString();
    const updatedPrescriptions = { ...prescriptions };
    
    if (!updatedPrescriptions[patientId]) {
      updatedPrescriptions[patientId] = [];
    }
    
    updatedPrescriptions[patientId].push({
      id: Date.now().toString(),
      ...prescription,
      timestamp: new Date().toISOString(),
    });

    setPrescriptions(updatedPrescriptions);
    return { success: true };
  };

  // Save test order
  const saveTestOrder = (testOrder) => {
    if (!activePatient) {
      return { success: false, error: 'No active patient' };
    }

    const patientId = activePatient.id.toString();
    const updatedTestOrders = { ...testOrders };
    
    if (!updatedTestOrders[patientId]) {
      updatedTestOrders[patientId] = [];
    }
    
    updatedTestOrders[patientId].push({
      id: Date.now().toString(),
      ...testOrder,
      timestamp: new Date().toISOString(),
    });

    setTestOrders(updatedTestOrders);
    return { success: true };
  };

  // Save diagnosis
  const saveDiagnosis = (diagnosis) => {
    if (!activePatient) {
      return { success: false, error: 'No active patient' };
    }

    const patientId = activePatient.id.toString();
    const updatedDiagnoses = { ...diagnoses };
    
    if (!updatedDiagnoses[patientId]) {
      updatedDiagnoses[patientId] = [];
    }
    
    updatedDiagnoses[patientId].push({
      id: Date.now().toString(),
      ...diagnosis,
      timestamp: new Date().toISOString(),
    });

    setDiagnoses(updatedDiagnoses);
    return { success: true };
  };

  // Save clinical notes
  const saveClinicalNote = (note) => {
    if (!activePatient) {
      return { success: false, error: 'No active patient' };
    }

    const patientId = activePatient.id.toString();
    const updatedNotes = { ...clinicalNotes };
    
    if (!updatedNotes[patientId]) {
      updatedNotes[patientId] = [];
    }
    
    updatedNotes[patientId].push({
      id: Date.now().toString(),
      ...note,
      timestamp: new Date().toISOString(),
    });

    setClinicalNotes(updatedNotes);
    return { success: true };
  };

  // Get records for a specific patient
  const getPatientPrescriptions = (patientId) => {
    return prescriptions[patientId?.toString()] || [];
  };

  const getPatientTestOrders = (patientId) => {
    return testOrders[patientId?.toString()] || [];
  };

  const getPatientDiagnoses = (patientId) => {
    return diagnoses[patientId?.toString()] || [];
  };

  const getPatientClinicalNotes = (patientId) => {
    return clinicalNotes[patientId?.toString()] || [];
  };

  // Update consultation timer
  const updateConsultationTimer = (timerValue) => {
    if (consultationData) {
      setConsultationData({
        ...consultationData,
        timer: timerValue,
      });
    }
  };

  const value = {
    activePatient,
    consultationData,
    startConsultation,
    endConsultation,
    updateConsultationTimer,
    savePrescription,
    saveTestOrder,
    saveDiagnosis,
    saveClinicalNote,
    getPatientPrescriptions,
    getPatientTestOrders,
    getPatientDiagnoses,
    getPatientClinicalNotes,
    setActivePatient,
  };

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
};

