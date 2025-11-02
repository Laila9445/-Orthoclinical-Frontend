import React, { useState, createContext, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';

// CONSTANTS

const DOCTOR = {
  name: 'Dr. Ahmed Nabil',
  specialty: 'Orthopedic Surgeon',
};

const CLINICS = [
  { id: 'sz', name: 'Zayed Clinic', address: ' Zayed, Giza' },
  { id: '6o', name: 'October Clinic', address: 'October City' },
  { id: 'dk', name: 'Dokki Clinic', address: 'Dokki, Giza' }
];

const TIME_SLOTS = {
  morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'],
  afternoon: ['1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30']
};

const BODY_PARTS = [
  'Shoulder', 'Elbow', 'Wrist', 'Hand', 'Hip', 'Knee', 'Ankle', 'Foot',
  'Neck', 'Back', 'Spine', 'Other'
];

const VISIT_TYPES = ['First Visit', 'Follow-up', 'Routine Check-up', 'Post-Surgery'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// CONTEXT

const AppointmentContext = createContext();

const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within AppointmentProvider');
  }
  return context;
};

const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);

  const addAppointment = (appointment) => {
    const newAppointment = {
      ...appointment,
      id: Date.now().toString(),
      status: 'upcoming'
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  const cancelAppointment = (id) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === id ? { ...apt, status: 'canceled' } : apt)
    );
  };

  const completeAppointment = (id) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === id ? { ...apt, status: 'completed' } : apt)
    );
  };

  return (
    <AppointmentContext.Provider value={{
      appointments,
      addAppointment,
      cancelAppointment,
      completeAppointment
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};

// COMPONENTS

// Clinic Selector Component
const ClinicSelector = ({ clinics, selectedClinic, onSelectClinic }) => {
  return (
    <View style={styles.card}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepNumber}>1</Text>
        <Text style={styles.sectionTitle}>Select Clinic Location</Text>
      </View>
      {clinics.map(clinic => (
        <TouchableOpacity
          key={clinic.id}
          onPress={() => onSelectClinic(clinic.id)}
          style={[
            styles.clinicOption,
            selectedClinic === clinic.id && styles.clinicSelected
          ]}
        >
          <View style={styles.clinicRadio}>
            {selectedClinic === clinic.id && <View style={styles.clinicRadioInner} />}
          </View>
          <View style={styles.clinicDetails}>
            <Text style={[
              styles.clinicName,
              selectedClinic === clinic.id && styles.clinicNameSelected
            ]}>
              {clinic.name}
            </Text>
            <Text style={styles.clinicAddress}>{clinic.address}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Date Picker Component
const DatePicker = ({ currentMonth, selectedDate, onDateSelect, onMonthChange }) => {
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return days;
  };

  const isDisabled = (day) => {
    if (!day) return true;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <View style={styles.card}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepNumber}>2</Text>
        <Text style={styles.sectionTitle}>Select Date</Text>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={() => onMonthChange(-1)} style={styles.navBtn}>
            <Text style={styles.navText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <TouchableOpacity onPress={() => onMonthChange(1)} style={styles.navBtn}>
            <Text style={styles.navText}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.daysHeader}>
          {DAYS.map(day => (
            <Text key={day} style={styles.dayName}>{day.slice(0, 3)}</Text>
          ))}
        </View>

        <View style={styles.calendar}>
          {getDaysInMonth().map((day, idx) => (
            <TouchableOpacity
              key={idx}
              disabled={isDisabled(day)}
              onPress={() => day && !isDisabled(day) && onDateSelect(day)}
              style={[
                styles.dayBtn,
                !day && styles.emptyDay,
                isDisabled(day) && styles.disabledDay,
                day === selectedDate && styles.selectedDay
              ]}
            >
              {day && (
                <Text style={[
                  styles.dayText,
                  isDisabled(day) && styles.disabledText,
                  day === selectedDate && styles.selectedText
                ]}>
                  {day}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

// Time Slot Picker Component
const TimeSlotPicker = ({ timeSlots, selectedSlot, onSelectSlot, bookedSlots = [] }) => {
  const isSlotBooked = (slot) => bookedSlots.includes(slot);

  const renderSlots = (slots, label) => (
    <>
      <Text style={styles.slotLabel}>{label}</Text>
      <View style={styles.slotsGrid}>
        {slots.map(slot => {
          const booked = isSlotBooked(slot);
          return (
            <TouchableOpacity
              key={slot}
              disabled={booked}
              onPress={() => !booked && onSelectSlot(slot)}
              style={[
                styles.slotBtn,
                slot === selectedSlot && !booked && styles.slotSelected,
                booked && styles.slotBooked
              ]}
            >
              <Text style={[
                styles.slotText,
                slot === selectedSlot && !booked && styles.slotTextSelected,
                booked && styles.slotTextBooked
              ]}>
                {slot}
              </Text>
              {booked && <View style={styles.strikethrough} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={styles.card}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepNumber}>3</Text>
        <Text style={styles.sectionTitle}>Select Time Slot</Text>
      </View>
      {renderSlots(timeSlots.morning, 'Morning')}
      {renderSlots(timeSlots.afternoon, 'Afternoon')}
    </View>
  );
};

// Patient Info Form Component
const PatientInfoForm = ({ formData, onFormChange }) => {
  const updateField = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <View style={styles.card}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepNumber}>4</Text>
        <Text style={styles.sectionTitle}>Patient Information</Text>
      </View>

      <Text style={styles.label}>Full Name *</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={(value) => updateField('name', value)}
        placeholder="Enter patient name"
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        value={formData.phone}
        onChangeText={(value) => updateField('phone', value)}
        placeholder="Enter phone number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Age *</Text>
      <TextInput
        style={styles.input}
        value={formData.age}
        onChangeText={(value) => updateField('age', value)}
        placeholder="Enter age"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Gender *</Text>
      <View style={styles.radioGroup}>
        {['Male', 'Female'].map(gender => (
          <TouchableOpacity
            key={gender}
            onPress={() => updateField('gender', gender)}
            style={styles.radioOption}
          >
            <View style={styles.radioCircle}>
              {formData.gender === gender && <View style={styles.radioSelected} />}
            </View>
            <Text style={styles.radioLabel}>{gender}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Visit Type *</Text>
      <View style={styles.chipGroup}>
        {VISIT_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => updateField('visitType', type)}
            style={[
              styles.chip,
              formData.visitType === type && styles.chipSelected
            ]}
          >
            <Text style={[
              styles.chipText,
              formData.visitType === type && styles.chipTextSelected
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Injured/Affected Body Part *</Text>
      <View style={styles.chipGroup}>
        {BODY_PARTS.map(part => (
          <TouchableOpacity
            key={part}
            onPress={() => updateField('bodyPart', part)}
            style={[
              styles.chip,
              formData.bodyPart === part && styles.chipSelected
            ]}
          >
            <Text style={[
              styles.chipText,
              formData.bodyPart === part && styles.chipTextSelected
            ]}>
              {part}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {formData.bodyPart === 'Other' && (
        <TextInput
          style={[styles.input, { marginTop: 12 }]}
          value={formData.bodyPartOther}
          onChangeText={(value) => updateField('bodyPartOther', value)}
          placeholder="Please specify the body part"
        />
      )}

      <Text style={styles.label}>Symptoms </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.symptoms}
        onChangeText={(value) => updateField('symptoms', value)}
        placeholder="Describe your symptoms (e.g., pain, swelling, limited movement)"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Previous Surgery/Treatment </Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.previousSurgery}
        onChangeText={(value) => updateField('previousSurgery', value)}
        placeholder="Any previous surgeries or treatments related to this condition"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>
  );
};

// Appointment Card Component
const AppointmentCard = ({ appointment, onCancel, onComplete, onReschedule }) => {
  return (
    <View style={styles.aptCard}>
      <View style={styles.aptHeader}>
        <Text style={styles.aptName}>{appointment.name}</Text>
        <View style={[
          styles.statusBadge,
          appointment.status === 'upcoming' && styles.statusUpcoming,
          appointment.status === 'completed' && styles.statusCompleted,
          appointment.status === 'canceled' && styles.statusCanceled
        ]}>
          <Text style={[
            styles.statusText,
            appointment.status === 'upcoming' && styles.statusTextUpcoming,
            appointment.status === 'completed' && styles.statusTextCompleted,
            appointment.status === 'canceled' && styles.statusTextCanceled
          ]}>
            {appointment.status}
          </Text>
        </View>
      </View>

      <View style={styles.aptInfoGrid}>
        <View style={styles.aptInfoRow}>
          <Text style={styles.aptInfo}>📅 {appointment.date}</Text>
          <Text style={styles.aptInfo}>🕐 {appointment.time}</Text>
        </View>
        <View style={styles.aptInfoRow}>
          <Text style={styles.aptInfo}>📞 {appointment.phone}</Text>
          <Text style={styles.aptInfo}>👤 {appointment.gender}, {appointment.age}y</Text>
        </View>
        <Text style={styles.aptInfo}>📍 {appointment.clinic.name}</Text>
        <Text style={styles.aptInfo}>🏥 {appointment.visitType}</Text>
        <Text style={styles.aptInfo}>🦴 {appointment.bodyPart === 'Other' ? appointment.bodyPartOther : appointment.bodyPart}</Text>
        {appointment.symptoms && (
          <Text style={styles.aptInfoDetail}>💬 {appointment.symptoms}</Text>
        )}
        {appointment.previousSurgery && (
          <Text style={styles.aptInfoDetail}>⚕️ Previous: {appointment.previousSurgery}</Text>
        )}
      </View>

      {appointment.status === 'upcoming' && (
        <View style={styles.aptActions}>
          <TouchableOpacity onPress={onComplete} style={styles.completeBtn}>
            <Text style={styles.completeText}>Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onReschedule} style={styles.rescheduleBtn}>
            <Text style={styles.rescheduleText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ visible, message, title }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

// Cancel Modal Component
const CancelModal = ({ visible, onCancel, onKeep }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Cancel Appointment?</Text>
          <Text style={styles.modalText}>
            Are you sure you want to cancel this appointment?
          </Text>
          <View style={styles.modalActions}>
            <TouchableOpacity onPress={onKeep} style={styles.modalKeepBtn}>
              <Text style={styles.modalKeepText}>Keep</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} style={styles.modalCancelBtn}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// SCREENS

// Booking Screen
const BookingScreen = ({ onBack }) => {
  const { addAppointment, appointments } = useAppointments();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [clinic, setClinic] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    phone: '',
    age: '',
    gender: '',
    visitType: '',
    bodyPart: '',
    bodyPartOther: '',
    symptoms: '',
    previousSurgery: ''
  });

  const handleMonthChange = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleDateSelect = (day) => {
    setSelectedDate(day);
    setSelectedSlot(null);
  };

  const handleClinicChange = (clinicId) => {
    setClinic(clinicId);
    setSelectedSlot(null);
    setSelectedDate(null);
  };

  const getBookedSlots = () => {
    if (!selectedDate || !clinic) return [];
    const dateStr = `${MONTHS[currentMonth.getMonth()]} ${selectedDate}, ${currentMonth.getFullYear()}`;
    return appointments
      .filter(apt =>
        apt.date === dateStr &&
        apt.clinic.id === clinic &&
        apt.status === 'upcoming'
      )
      .map(apt => apt.time);
  };

  const validateForm = () => {
    const { name, phone, age, gender, visitType, bodyPart, bodyPartOther } = patientInfo;
    if (!selectedDate || !selectedSlot || !clinic) {
      Alert.alert('Error', 'Please select clinic, date and time');
      return false;
    }
    if (!name || !phone || !age || !gender || !visitType || !bodyPart) {
      Alert.alert('Error', 'Please fill all required fields');
      return false;
    }
    if (bodyPart === 'Other' && !bodyPartOther) {
      Alert.alert('Error', 'Please specify the body part');
      return false;
    }
    return true;
  };

  const handleBooking = () => {
    if (!validateForm()) return;

    const bookedSlots = getBookedSlots();
    if (bookedSlots.includes(selectedSlot)) {
      Alert.alert('Error', 'This slot has already been booked. Please select another time.');
      setSelectedSlot(null);
      return;
    }

    const selectedClinic = CLINICS.find(c => c.id === clinic);
    const appointmentData = {
      date: `${MONTHS[currentMonth.getMonth()]} ${selectedDate}, ${currentMonth.getFullYear()}`,
      time: selectedSlot,
      clinic: selectedClinic,
      ...patientInfo
    };

    addAppointment(appointmentData);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

  const isFormComplete = () => {
    const { name, phone, age, gender, visitType, bodyPart, bodyPartOther } = patientInfo;
    const bodyPartValid = bodyPart === 'Other' ? bodyPartOther : bodyPart;
    return selectedDate && selectedSlot && clinic && name && phone && age && gender && visitType && bodyPartValid;
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{DOCTOR.name}</Text>
            <Text style={styles.doctorSpecialty}>{DOCTOR.specialty}</Text>
          </View>
        </View>

        <ClinicSelector
          clinics={CLINICS}
          selectedClinic={clinic}
          onSelectClinic={handleClinicChange}
        />

        {clinic && (
          <DatePicker
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
        )}

        {selectedDate && clinic && (
          <TimeSlotPicker
            timeSlots={TIME_SLOTS}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            bookedSlots={getBookedSlots()}
          />
        )}

        <PatientInfoForm
          formData={patientInfo}
          onFormChange={setPatientInfo}
        />

        {isFormComplete() && (
          <TouchableOpacity onPress={handleBooking} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>Confirm Appointment</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ConfirmationModal
        visible={showSuccess}
        title="✓ Confirmed!"
        message="Appointment booked successfully"
      />
    </View>
  );
};

// Appointments Screen
const AppointmentsScreen = ({ onBookNew }) => {
  const { appointments, cancelAppointment, completeAppointment } = useAppointments();
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('upcoming');
  const [cancelId, setCancelId] = useState(null);

  const getFilteredAppointments = () => {
    return appointments.filter(apt => {
      const clinicMatch = selectedClinic === 'all' || apt.clinic.id === selectedClinic;
      const statusMatch = apt.status === selectedStatus;
      return clinicMatch && statusMatch;
    });
  };

  const getAppointmentsByClinic = () => {
    const filtered = getFilteredAppointments();
    const grouped = {};

    CLINICS.forEach(clinic => {
      grouped[clinic.id] = filtered.filter(apt => apt.clinic.id === clinic.id);
    });

    return grouped;
  };

  const handleCancelConfirm = () => {
    if (cancelId) {
      cancelAppointment(cancelId);
      setCancelId(null);
    }
  };

  const handleReschedule = (id) => {
    cancelAppointment(id);
    onBookNew();
  };

  const appointmentsByClinic = getAppointmentsByClinic();
  const totalCount = getFilteredAppointments().length;

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.doctorName}>My Appointments</Text>
            <Text style={styles.doctorSpecialty}>{DOCTOR.name}</Text>
          </View>
          <TouchableOpacity onPress={onBookNew} style={styles.addBtn}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filters}>
          {['upcoming', 'completed', 'canceled'].map(status => (
            <TouchableOpacity
              key={status}
              onPress={() => setSelectedStatus(status)}
              style={[
                styles.filterBtn,
                selectedStatus === status && styles.filterActive
              ]}
            >
              <Text style={[
                styles.filterText,
                selectedStatus === status && styles.filterTextActive
              ]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.clinicFilters}>
          <TouchableOpacity
            onPress={() => setSelectedClinic('all')}
            style={[
              styles.clinicFilterBtn,
              selectedClinic === 'all' && styles.clinicFilterActive
            ]}
          >
            <Text style={[
              styles.clinicFilterText,
              selectedClinic === 'all' && styles.clinicFilterTextActive
            ]}>
              All Clinics
            </Text>
          </TouchableOpacity>
          {CLINICS.map(clinic => (
            <TouchableOpacity
              key={clinic.id}
              onPress={() => setSelectedClinic(clinic.id)}
              style={[
                styles.clinicFilterBtn,
                selectedClinic === clinic.id && styles.clinicFilterActive
              ]}
            >
              <Text style={[
                styles.clinicFilterText,
                selectedClinic === clinic.id && styles.clinicFilterTextActive
              ]}>
                {clinic.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {totalCount === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {selectedStatus} appointments</Text>
            {selectedStatus === 'upcoming' && (
              <TouchableOpacity onPress={onBookNew} style={styles.bookBtn}>
                <Text style={styles.bookText}>Book Appointment</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {selectedClinic === 'all' ? (
              CLINICS.map(clinic => {
                const clinicApts = appointmentsByClinic[clinic.id];
                if (clinicApts.length === 0) return null;

                return (
                  <View key={clinic.id}>
                    <View style={styles.clinicSectionHeader}>
                      <Text style={styles.clinicSectionTitle}>📍 {clinic.name}</Text>
                      <Text style={styles.clinicSectionCount}>{clinicApts.length}</Text>
                    </View>
                    {clinicApts.map(apt => (
                      <AppointmentCard
                        key={apt.id}
                        appointment={apt}
                        onCancel={() => setCancelId(apt.id)}
                        onComplete={() => completeAppointment(apt.id)}
                        onReschedule={() => handleReschedule(apt.id)}
                      />
                    ))}
                  </View>
                );
              })
            ) : (
              appointmentsByClinic[selectedClinic].map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onCancel={() => setCancelId(apt.id)}
                  onComplete={() => completeAppointment(apt.id)}
                  onReschedule={() => handleReschedule(apt.id)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      <CancelModal
        visible={!!cancelId}
        onCancel={handleCancelConfirm}
        onKeep={() => setCancelId(null)}
      />
    </View>
  );
};

// MAIN APP

export default function App() {
  const [screen, setScreen] = useState('appointments');

  return (
    <AppointmentProvider>
      <View style={styles.safeArea}>
        {screen === 'appointments' ? (
          <AppointmentsScreen onBookNew={() => setScreen('booking')} />
        ) : (
          <BookingScreen onBack={() => setScreen('appointments')} />
        )}
      </View>
    </AppointmentProvider>
  );
}

// STYLES

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    margin: 16,
    marginTop: 40
  },
  backBtn: { padding: 8 },
  backText: { color: '#fff', fontSize: 24 },
  doctorInfo: { flex: 1, marginLeft: 12 },
  doctorName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  doctorSpecialty: { fontSize: 14, color: '#dbeafe', marginTop: 4 },
  addBtn: {
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addText: { color: '#2563eb', fontSize: 24, fontWeight: 'bold' },

  card: { 
    backgroundColor: '#fff', 
    margin: 16, 
    padding: 20, 
    borderRadius: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%'
  },

  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  stepNumber: {
    backgroundColor: '#2563eb',
    color: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },

  clinicOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  clinicSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  clinicRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  clinicRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb'
  },
  clinicDetails: { flex: 1 },
  clinicName: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  clinicNameSelected: { color: '#2563eb' },
  clinicAddress: { fontSize: 13, color: '#6b7280' },

  calendarContainer: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%'
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16
  },
  navBtn: { padding: 8 },
  navText: { fontSize: 20, color: '#374151' },
  monthText: { fontSize: 18, fontWeight: '600', color: '#111827' },

  daysHeader: { flexDirection: 'row', marginBottom: 8 },
  dayName: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#6b7280', paddingVertical: 8 },
  calendar: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  dayBtn: {
    width: '14.28%',
    aspectRatio: 1,
    maxWidth: 50,
    maxHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4
  },
  emptyDay: { opacity: 0 },
  disabledDay: { backgroundColor: '#f9fafb' },
  selectedDay: { backgroundColor: '#2563eb' },
  dayText: { fontSize: 14, color: '#111827' },
  disabledText: { color: '#d1d5db' },
  selectedText: { color: '#fff', fontWeight: 'bold' },

  slotLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 12
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  slotBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    position: 'relative'
  },
  slotSelected: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  slotBooked: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    opacity: 0.6
  },
  slotText: { fontSize: 14, color: '#374151' },
  slotTextSelected: { color: '#fff', fontWeight: '600' },
  slotTextBooked: {
    color: '#991b1b',
    opacity: 0.5
  },
  strikethrough: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#dc2626'
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827'
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12
  },

  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563eb'
  },
  radioLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500'
  },

  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  chipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  chipText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500'
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600'
  },

  confirmBtn: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    marginBottom: 32,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%'
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },

  filters: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    gap: 8
  },
  filterBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff'
  },
  filterActive: { backgroundColor: '#2563eb' },
  filterText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280'
  },
  filterTextActive: { color: '#fff' },

  clinicFilters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
    flexWrap: 'wrap'
  },
  clinicFilterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  clinicFilterActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#2563eb'
  },
  clinicFilterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7280'
  },
  clinicFilterTextActive: {
    color: '#2563eb',
    fontWeight: '600'
  },

  clinicSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12
  },
  clinicSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827'
  },
  clinicSectionCount: {
    backgroundColor: '#2563eb',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 'bold'
  },

  emptyState: { alignItems: 'center', padding: 48 },
  emptyText: { fontSize: 16, color: '#6b7280', marginBottom: 16 },
  bookBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12
  },
  bookText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  aptCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb'
  },
  aptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  aptName: { fontSize: 18, fontWeight: 'bold', color: '#111827', flex: 1 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  statusUpcoming: { backgroundColor: '#dbeafe' },
  statusCompleted: { backgroundColor: '#d1fae5' },
  statusCanceled: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusTextUpcoming: { color: '#1e40af' },
  statusTextCompleted: { color: '#065f46' },
  statusTextCanceled: { color: '#991b1b' },
  aptInfoGrid: {
    gap: 8
  },
  aptInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  aptInfo: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1
  },
  aptInfoDetail: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 18
  },
  aptActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8
  },
  completeBtn: {
    flex: 1,
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8
  },
  completeText: {
    color: '#065f46',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13
  },
  rescheduleBtn: {
    flex: 1,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8
  },
  rescheduleText: {
    color: '#2563eb',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8
  },
  cancelText: {
    color: '#dc2626',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: '80%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center'
  },
  modalText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalKeepBtn: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8
  },
  modalKeepText: {
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center'
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8
  },
  modalCancelText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center'
  }
});