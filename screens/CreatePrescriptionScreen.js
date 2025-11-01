// screens/CreatePrescriptionScreen.js
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CreatePrescriptionScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);

  // Step 1
  const [patient, setPatient] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // Step 2
  const [meds, setMeds] = useState([]);
  const [medSearch, setMedSearch] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  // Step 3
  const [signature, setSignature] = useState(false);

  // Add Medication
  const addMed = () => {
    if (!medSearch || !dosage || !frequency || !duration) {
      Alert.alert('Error', 'Fill all required fields');
      return;
    }
    setMeds([...meds, { name: medSearch, dosage, frequency, duration, instructions }]);
    setMedSearch(''); setDosage(''); setFrequency(''); setDuration(''); setInstructions('');
  };

  // Final Create
  const createPrescription = () => {
    if (!signature) return Alert.alert('Error', 'Please add signature');
    Alert.alert('Success', 'Prescription created successfully!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create New Prescription</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.stepText}>Step {step} of 3</Text>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 1 && styles.activeCircle]}>
              <Text style={[styles.stepNumber, step >= 1 && styles.activeNumber]}>1</Text>
            </View>
            <Text style={[styles.stepLabel, step >= 1 && styles.activeLabel]}>Patient Info</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 2 && styles.activeCircle]}>
              <Text style={[styles.stepNumber, step >= 2 && styles.activeNumber]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, step >= 2 && styles.activeLabel]}>Medications</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, step >= 3 && styles.activeCircle]}>
              <Text style={[styles.stepNumber, step >= 3 && styles.activeNumber]}>3</Text>
            </View>
            <Text style={[styles.stepLabel, step >= 3 && styles.activeLabel]}>Review & Sign</Text>
          </View>
        </View>

        {/* === STEP 1: Patient Info === */}
        {step === 1 && (
          <View style={styles.form}>
            <Text style={styles.label}>Select Patient *</Text>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownText}>Choose a patient...</Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Consultation ID</Text>
                <View style={styles.idBox}>
                  <Text style={styles.idText}>CON-2024-001</Text>
                </View>
              </View>
              <View style={styles.spacer} />
            </View>

            <Text style={styles.label}>Diagnosis *</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Enter primary diagnosis..."
              value={diagnosis}
              onChangeText={setDiagnosis}
              multiline
            />

            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Any additional notes or instructions..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={() => setStep(2)}
              >
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* === STEP 2: Medications === */}
        {step === 2 && (
          <View style={styles.form}>
            <View style={styles.medHeader}>
              <Text style={styles.sectionTitle}>Add Medications</Text>
              <Text style={styles.medCount}>{meds.length} medication(s) added</Text>
            </View>

            <View style={styles.medForm}>
              <Text style={styles.sectionTitle}>Add Medication</Text>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>Search Medication *</Text>
                  <View style={styles.searchBox}>
                    <TextInput
                      placeholder="Search by name or type..."
                      value={medSearch}
                      onChangeText={setMedSearch}
                      style={{ flex: 1 }}
                    />
                    <Ionicons name="search" size={18} color="#999" />
                  </View>
                </View>
                <View style={styles.spacer} />
                <View style={styles.half}>
                  <Text style={styles.label}>Dosage *</Text>
                  <TextInput
                    placeholder="e.g., 500mg"
                    value={dosage}
                    onChangeText={setDosage}
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>Frequency *</Text>
                  <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>Select frequency...</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </View>
                </View>
                <View style={styles.spacer} />
                <View style={styles.half}>
                  <Text style={styles.label}>Duration *</Text>
                  <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>Select duration...</Text>
                    <Ionicons name="chevron-down" size={20} color="#666" />
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Special Instructions</Text>
              <TextInput
                style={styles.textarea}
                placeholder="e.g., Take with food, Avoid alcohol..."
                value={instructions}
                onChangeText={setInstructions}
                multiline
              />

              <TouchableOpacity style={styles.addMedBtn} onPress={addMed}>
                <Text style={styles.addMedText}>+ Add Medication</Text>
              </TouchableOpacity>

              {/* List of added meds */}
              {meds.map((m, i) => (
                <View key={i} style={styles.medItem}>
                  <Text style={styles.medName}>{m.name}</Text>
                  <Text style={styles.medDetails}>
                    {m.dosage} • {m.frequency} • {m.duration}
                  </Text>
                  {m.instructions ? <Text style={styles.medInst}>{m.instructions}</Text> : null}
                </View>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(1)}>
                <Text style={styles.prevText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}>
                <Text style={styles.nextText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* === STEP 3: Review & Sign === */}
        {step === 3 && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Review Prescription</Text>

            <View style={styles.reviewCard}>
              <Text style={styles.hospitalTitle}>Clinical Hospital</Text>
              <Text style={styles.subTitle}>Digital Prescription</Text>

              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Patient:</Text>
                <Text style={styles.reviewValue}>John Smith</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Date:</Text>
                <Text style={styles.reviewValue}>10/31/2025</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Doctor:</Text>
                <Text style={styles.reviewValue}>Dr. Sarah Johnson</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Consultation:</Text>
                <Text style={styles.reviewValue}>2455</Text>
              </View>

              <Text style={styles.reviewLabel}>Diagnosis:</Text>
              <Text style={styles.reviewValue}>{diagnosis || 'Not specified'}</Text>

              <Text style={styles.reviewLabel}>Prescribed Medications:</Text>
              <View style={styles.medList}>
                {meds.length > 0 ? (
                  meds.map((m, i) => (
                    <View key={i} style={styles.medReview}>
                      <Text style={styles.medName}>{m.name}</Text>
                      <Text style={styles.medDetails}>
                        {m.dosage} • {m.frequency} • {m.duration}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noMed}>No medications added</Text>
                )}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Digital Signature</Text>
            <TouchableOpacity style={styles.signBtn} onPress={() => setSignature(true)}>
              <Ionicons name="pencil" size={16} color="#FFF" />
              <Text style={styles.signText}>Add Signature</Text>
            </TouchableOpacity>
            {signature && <Text style={styles.signed}>Signature Added</Text>}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.prevBtn} onPress={() => setStep(2)}>
                <Text style={styles.prevText}>Previous</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={createPrescription}>
                <Text style={styles.createText}>Create Prescription</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  stepText: { fontSize: 14, color: '#666', marginBottom: 16 },
  progressBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  activeCircle: { backgroundColor: '#007AFF' },
  stepNumber: { fontSize: 14, color: '#666', fontWeight: '600' },
  activeNumber: { color: '#FFF' },
  stepLabel: { fontSize: 12, color: '#666' },
  activeLabel: { color: '#007AFF', fontWeight: '600' },
  line: { height: 1, backgroundColor: '#DDD', flex: 1, marginHorizontal: 8 },
  form: {},
  label: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#DDD', marginBottom: 16 },
  dropdownText: { color: '#999' },
  row: { flexDirection: 'row', marginBottom: 16 },
  half: { flex: 1 },
  spacer: { width: 16 },
  idBox: { backgroundColor: '#FFF', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#DDD' },
  idText: { color: '#666', fontWeight: '600' },
  textarea: { backgroundColor: '#FFF', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#DDD', textAlignVertical: 'top', minHeight: 80, marginBottom: 16 },
  input: { backgroundColor: '#FFF', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#DDD' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 14, borderWidth: 1, borderColor: '#DDD' },
  medHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  medCount: { fontSize: 14, color: '#666' },
  medForm: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 24, elevation: 1 },
  addMedBtn: { backgroundColor: '#666', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  addMedText: { color: '#FFF', fontWeight: '600' },
  medItem: { backgroundColor: '#F0F8FF', padding: 12, borderRadius: 8, marginTop: 8 },
  medName: { fontWeight: '600', color: '#007AFF' },
  medDetails: { fontSize: 12, color: '#666', marginTop: 4 },
  medInst: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  reviewCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 20, marginBottom: 24, elevation: 1, alignItems: 'center' },
  hospitalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  subTitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  reviewLabel: { fontWeight: '600', color: '#1A1A1A' },
  reviewValue: { color: '#333' },
  medList: { width: '100%', marginTop: 8 },
  medReview: { backgroundColor: '#F0F8FF', padding: 12, borderRadius: 8, marginBottom: 8 },
  noMed: { color: '#999', fontStyle: 'italic' },
  signBtn: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8, gap: 8 },
  signText: { color: '#FFF', fontWeight: '600' },
  signed: { color: '#4CAF50', fontWeight: '600', marginTop: 8, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 24 },
  prevBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, flex: 1 },
  prevText: { color: '#666', fontWeight: '600' },
  cancelBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#DDD', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, flex: 1 },
  cancelText: { color: '#666', fontWeight: '600' },
  nextBtn: { backgroundColor: '#007AFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, flex: 1 },
  nextText: { color: '#FFF', fontWeight: '600' },
  createBtn: { backgroundColor: '#666', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, flex: 1 },
  createText: { color: '#FFF', fontWeight: '600' },
});

export default CreatePrescriptionScreen;