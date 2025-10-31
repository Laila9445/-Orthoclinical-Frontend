import React, { useState, createContext, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';

//constants
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// CONTEXT
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);

  const addAppointment = (apt) => {
    setAppointments(prev => [...prev, { ...apt, id: Date.now().toString(), status: 'upcoming' }]);
  };

  const cancelAppointment = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'canceled' } : a));
  };

  const completeAppointment = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a));
  };

  return (
    <AppContext.Provider value={{ appointments, addAppointment, cancelAppointment, completeAppointment }}>
      {children}
    </AppContext.Provider>
  );
};

// MAIN APP
export default function App() {
  const [screen, setScreen] = useState('appointments');
  
  return (
    <AppProvider>
      <View style={styles.safeArea}>
        {screen === 'appointments' ? (
          <AppointmentsScreen onBookNew={() => setScreen('booking')} />
        ) : (
          <BookingScreen onBack={() => setScreen('appointments')} />
        )}
      </View>
    </AppProvider>
  );
}

// BOOKING SCREEN
const BookingScreen = ({ onBack }) => {
  const { addAppointment, appointments } = useContext(AppContext);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [clinic, setClinic] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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

  const changeMonth = (delta) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + delta);
    setCurrentMonth(newMonth);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const isSlotBooked = (slot) => {
    if (!selectedDate || !clinic) return false;
    const dateStr = `${MONTHS[currentMonth.getMonth()]} ${selectedDate}, ${currentMonth.getFullYear()}`;
    return appointments.some(apt => 
      apt.date === dateStr && 
      apt.time === slot && 
      apt.clinic.id === clinic &&
      apt.status === 'upcoming'
    );
  };

  const handleBook = () => {
    if (!selectedDate || !selectedSlot || !name || !phone || !clinic) {
      alert('Please fill all required fields');
      return;
    }

    if (isSlotBooked(selectedSlot)) {
      alert('This slot has already been booked. Please select another time.');
      setSelectedSlot(null);
      return;
    }

    const selectedClinic = CLINICS.find(c => c.id === clinic);
    addAppointment({
      date: `${MONTHS[currentMonth.getMonth()]} ${selectedDate}, ${currentMonth.getFullYear()}`,
      time: selectedSlot,
      name,
      phone,
      clinic: selectedClinic
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

  const handleClinicChange = (clinicId) => {
    setClinic(clinicId);
    setSelectedSlot(null);
    setSelectedDate(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{DOCTOR.name}</Text>
            <Text style={styles.doctorSpecialty}>{DOCTOR.specialty}</Text>
          </View>
        </View>

        {/* Step 1: Clinic Selection */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.sectionTitle}>Select Clinic Location</Text>
          </View>
          {CLINICS.map(c => (
            <TouchableOpacity
              key={c.id}
              onPress={() => handleClinicChange(c.id)}
              style={[styles.clinicOption, clinic === c.id && styles.clinicSelected]}
            >
              <View style={styles.clinicRadio}>
                {clinic === c.id && <View style={styles.clinicRadioInner} />}
              </View>
              <View style={styles.clinicDetails}>
                <Text style={[styles.clinicName, clinic === c.id && styles.clinicNameSelected]}>
                  {c.name}
                </Text>
                <Text style={styles.clinicAddress}>{c.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 2: Date Selection - Only show if clinic is selected */}
        {clinic && (
          <View style={styles.card}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.sectionTitle}>Select Date</Text>
            </View>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                <Text style={styles.navText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navBtn}>
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
                  onPress={() => {
                    if (day && !isDisabled(day)) {
                      setSelectedDate(day);
                      setSelectedSlot(null);
                    }
                  }}
                  style={[
                    styles.dayBtn,
                    !day && styles.emptyDay,
                    isDisabled(day) && styles.disabledDay,
                    day === selectedDate && styles.selectedDay
                  ]}
                >
                  {day && <Text style={[
                    styles.dayText,
                    isDisabled(day) && styles.disabledText,
                    day === selectedDate && styles.selectedText
                  ]}>{day}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Time Slots - Only show if date is selected */}
        {selectedDate && clinic && (
          <View style={styles.card}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.sectionTitle}>Select Time Slot</Text>
            </View>
            
            <Text style={styles.slotLabel}>Morning</Text>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.morning.map(slot => {
                const booked = isSlotBooked(slot);
                return (
                  <TouchableOpacity
                    key={slot}
                    disabled={booked}
                    onPress={() => !booked && setSelectedSlot(slot)}
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

            <Text style={styles.slotLabel}>Afternoon</Text>
            <View style={styles.slotsGrid}>
              {TIME_SLOTS.afternoon.map(slot => {
                const booked = isSlotBooked(slot);
                return (
                  <TouchableOpacity
                    key={slot}
                    disabled={booked}
                    onPress={() => !booked && setSelectedSlot(slot)}
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
          </View>
        )}

        {/* Step 4: Patient Information */}
        <View style={styles.card}>
          <View style={styles.stepHeader}>
            <Text style={styles.stepNumber}>4</Text>
            <Text style={styles.sectionTitle}>Patient Information</Text>
          </View>
          
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder=""
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder=""
            keyboardType=""
          />
        </View>

        {/* Confirm Button */}
        {selectedDate && selectedSlot && name && phone && clinic && (
          <TouchableOpacity onPress={handleBook} style={styles.confirmBtn}>
            <Text style={styles.confirmText}>Confirm Appointment</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✓ Confirmed!</Text>
            <Text style={styles.modalText}>Appointment booked successfully</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// APPOINTMENTS SCREEN
const AppointmentsScreen = ({ onBookNew }) => {
  const { appointments, cancelAppointment, completeAppointment } = useContext(AppContext);
  const [selectedClinic, setSelectedClinic] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('upcoming');
  const [cancelId, setCancelId] = useState(null);

  const getFilteredAppointments = () => {
    return appointments.filter(a => {
      const clinicMatch = selectedClinic === 'all' || a.clinic.id === selectedClinic;
      const statusMatch = a.status === selectedStatus;
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

  const appointmentsByClinic = getAppointmentsByClinic();
  const totalCount = getFilteredAppointments().length;

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.doctorName}>My Appointments</Text>
            <Text style={styles.doctorSpecialty}>{DOCTOR.name}</Text>
          </View>
          <TouchableOpacity onPress={onBookNew} style={styles.addBtn}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter */}
        <View style={styles.filters}>
          {['upcoming', 'completed', 'canceled'].map(status => (
            <TouchableOpacity
              key={status}
              onPress={() => setSelectedStatus(status)}
              style={[styles.filterBtn, selectedStatus === status && styles.filterActive]}
            >
              <Text style={[styles.filterText, selectedStatus === status && styles.filterTextActive]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Clinic Filter */}
        <View style={styles.clinicFilters}>
          <TouchableOpacity
            onPress={() => setSelectedClinic('all')}
            style={[styles.clinicFilterBtn, selectedClinic === 'all' && styles.clinicFilterActive]}
          >
            <Text style={[styles.clinicFilterText, selectedClinic === 'all' && styles.clinicFilterTextActive]}>
              All Clinics
            </Text>
          </TouchableOpacity>
          {CLINICS.map(clinic => (
            <TouchableOpacity
              key={clinic.id}
              onPress={() => setSelectedClinic(clinic.id)}
              style={[styles.clinicFilterBtn, selectedClinic === clinic.id && styles.clinicFilterActive]}
            >
              <Text style={[styles.clinicFilterText, selectedClinic === clinic.id && styles.clinicFilterTextActive]}>
                {clinic.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Appointments List */}
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
              // Show appointments grouped by clinic
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
                        onReschedule={() => {
                          cancelAppointment(apt.id);
                          onBookNew();
                        }}
                      />
                    ))}
                  </View>
                );
              })
            ) : (
              // Show appointments for selected clinic only
              appointmentsByClinic[selectedClinic].map(apt => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onCancel={() => setCancelId(apt.id)}
                  onComplete={() => completeAppointment(apt.id)}
                  onReschedule={() => {
                    cancelAppointment(apt.id);
                    onBookNew();
                  }}
                />
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Cancel Modal */}
      <Modal visible={!!cancelId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Appointment?</Text>
            <Text style={styles.modalText}>Are you sure you want to cancel this appointment?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setCancelId(null)}
                style={styles.modalKeepBtn}
              >
                <Text style={styles.modalKeepText}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  cancelAppointment(cancelId);
                  setCancelId(null);
                }}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// APPOINTMENT CARD COMPONENT
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

      <Text style={styles.aptInfo}>📅 {appointment.date}</Text>
      <Text style={styles.aptInfo}>🕐 {appointment.time}</Text>
      <Text style={styles.aptInfo}>📞 {appointment.phone}</Text>
      <Text style={styles.aptInfo}>📍 {appointment.clinic.name}</Text>

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
  
  card: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 16 },
  
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
  calendar: { flexDirection: 'row', flexWrap: 'wrap' },
  dayBtn: { 
    width: '14.28%', 
    aspectRatio: 1, 
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
  
  confirmBtn: { 
    backgroundColor: '#2563eb', 
    padding: 16, 
    borderRadius: 12, 
    margin: 16,
    marginBottom: 32 
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
  aptInfo: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
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
    marginBottom: 24, 
    textAlign: 'center' 
  },
  modalActions: { flexDirection: 'row', gap: 12 },
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
