// screens/PrescriptionSystemScreen.js
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const PrescriptionSystemScreen = ({ navigation }) => {  // ← navigation موجود

  const stats = [
    { label: "Today's Prescriptions", value: 24, icon: "document-text", color: "#007AFF", bg: "#E3F2FD" },
    { label: "Active Prescriptions", value: 156, icon: "heart", color: "#4CAF50", bg: "#E8F5E9" },
    { label: "Pending Signatures", value: 8, icon: "create", color: "#FF9800", bg: "#FFF3E0" },
    { label: "This Month", value: 892, icon: "calendar", color: "#9C27B0", bg: "#F3E5F5" },
  ];

  const prescriptions = [
    {
      id: "RX-2024-001",
      status: "Active",
      signed: true,
      patient: "John Smith",
      date: "1/15/2024",
      diagnosis: "Upper respiratory infection",
      meds: ["Amoxicillin 500mg", "Ibuprofen 400mg"],
    },
    {
      id: "RX-2024-002",
      status: "Dispensed",
      signed: true,
      patient: "Emma Johnson",
      date: "1/14/2024",
      diagnosis: "Type 2 Diabetes management",
      meds: ["Metformin 500mg"],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.logoRow}>
              <View style={styles.logo} />
              <Text style={styles.hospital}>Clinical Hospital</Text>
            </View>
            <Text style={styles.system}>Prescription Management System</Text>
          </View>
          <View style={styles.doctorRow}>
            <Text style={styles.doctor}>Dr. Ahmed Amin</Text>
            <Ionicons name="person-circle-outline" size={28} color="#666" />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Ionicons name="medkit" size={16} color="#007AFF" />
            <Text style={styles.activeTabText}>Doctor Interface</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="eye" size={16} color="#666" />
            <Text style={styles.tabText}>Patient View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="shield-checkmark" size={16} color="#666" />
            <Text style={styles.tabText}>Admin View</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: stat.bg }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Title + New Prescription Button */}
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Prescription Management</Text>
            <Text style={styles.subtitle}>Create and manage digital prescriptions for your patients</Text>
          </View>

            {/* === زر New Prescription === */}
            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => navigation.navigate('CreatePrescription')}  // ← شغال 100%
            >
              <Text style={styles.newBtnText}>+ New Prescription</Text>
            </TouchableOpacity>
        </View>

        {/* Search + Filter */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#999" />
            <TextInput placeholder="Search prescriptions..." style={styles.searchInput} />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterText}>All Status</Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Recent Prescriptions */}
        <Text style={styles.recentTitle}>Recent Prescriptions</Text>

        {prescriptions.map((rx, i) => (
          <View key={i} style={styles.prescriptionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.idRow}>
                <Text style={styles.rxId}>{rx.id}</Text>
                <View style={[
                  styles.statusBadge,
                  rx.status === 'Active' ? styles.activeBadge : styles.dispensedBadge
                ]}>
                  <Text style={styles.statusText}>{rx.status}</Text>
                </View>
                {rx.signed && (
                  <View style={styles.signedRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.signedText}>Signed</Text>
                  </View>
                )}
              </View>
              <View style={styles.actions}>
                <Ionicons name="eye" size={20} color="#007AFF" />
                <Ionicons name="share-social" size={20} color="#666" />
                <Ionicons name="download" size={20} color="#4CAF50" />
                <Ionicons name="trash" size={20} color="#F44336" />
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Patient:</Text>
                <Text style={styles.infoValue}>{rx.patient}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Date:</Text>
                <Text style={styles.infoValue}>{rx.date}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Diagnosis:</Text>
                <Text style={styles.infoValue}>{rx.diagnosis}</Text>
              </View>
            </View>

            <View style={styles.medsRow}>
              <Text style={styles.medsLabel}>Medications:</Text>
              <View style={styles.medsList}>
                {rx.meds.map((med, j) => (
                  <View key={j} style={styles.medPill}>
                    <Text style={styles.medText}>{med}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  content: { padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 32, height: 32, backgroundColor: '#007AFF', borderRadius: 6 },
  hospital: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  system: { fontSize: 12, color: '#666' },
  doctorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doctor: { fontSize: 14, color: '#333' },
  tabs: { flexDirection: 'row', backgroundColor: '#E3F2FD', borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 8, gap: 6 },
  activeTab: { backgroundColor: '#fff' },
  activeTabText: { color: '#007AFF', fontWeight: '600' },
  tabText: { color: '#666' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, padding: 12, borderRadius: 12 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#666' },
  statValue: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  newBtn: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  newBtnText: { color: '#FFF', fontWeight: '600' },
  searchRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#EEE' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#EEE', gap: 4 },
  filterText: { color: '#666' },
  recentTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 12 },
  prescriptionCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rxId: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  activeBadge: { backgroundColor: '#E8F5E9' },
  dispensedBadge: { backgroundColor: '#FFF3E0' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#43A047' },
  signedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  signedText: { fontSize: 12, color: '#4CAF50' },
  actions: { flexDirection: 'row', gap: 16 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoCol: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#666' },
  infoValue: { fontSize: 14, color: '#333', marginTop: 2 },
  medsRow: { flexDirection: 'row', alignItems: 'flex-start' },
  medsLabel: { fontSize: 12, color: '#666', marginRight: 8 },
  medsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1 },
  medPill: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  medText: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
});

export default PrescriptionSystemScreen;