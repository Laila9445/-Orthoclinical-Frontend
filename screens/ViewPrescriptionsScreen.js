import { StyleSheet, Text, View } from 'react-native';

export default function ViewPrescriptionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>View Prescriptions</Text>
      <Text style={styles.text}>List will appear here...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', marginBottom: 20 },
  text: { fontSize: 16, color: '#555' },
});