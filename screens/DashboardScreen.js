import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const DashboardScreen = () => {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Prepare Room 3', completed: false },
    { id: 2, title: 'check the room ', completed: true },
    { id: 3, title: 'Follow-up Call with Mohamed Ibrahim', completed: false },
  ]);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [patientQueue, setPatientQueue] = useState([
    { id: 1, name: 'Soha fathi', doctor: 'Dr. Ahmed Nabil', waitTime: '15 min' },
    { id: 2, name: 'Aya Ali', doctor: 'Dr. Ahmed Nabil', waitTime: '25 min' },
  ]);
  
  // Calculate patients waiting count dynamically
  const patientsWaiting = patientQueue.length;
  
  // Remove patient from queue
  const removePatient = (patientId) => {
    setPatientQueue(patientQueue.filter(patient => patient.id !== patientId));
  };

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get formatted date
  const getCurrentDate = () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  };

  // Toggle task completion
  const toggleTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  // Add new task
  const addTask = () => {
    if (newTaskTitle.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        title: newTaskTitle,
        completed: false
      }]);
      setNewTaskTitle('');
      setShowAddTaskModal(false);
    }
  };

  // Delete task
  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Edit task
  const openEditTask = (task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setShowEditTaskModal(true);
  };

  // Save edited task
  const saveEditedTask = () => {
    if (newTaskTitle.trim()) {
      setTasks(tasks.map(task =>
        task.id === editingTask.id ? { ...task, title: newTaskTitle } : task
      ));
      setNewTaskTitle('');
      setShowEditTaskModal(false);
      setEditingTask(null);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  // Navigate to different screens
  const navigateToScreen = (screen) => {
    setShowSidebar(false);
    if (screen === 'dashboard') {
      // Already on dashboard
    } else if (screen === 'appointments') {
      router.push('/Appointments');
    } else if (screen === 'profile') {
      router.push('/NurseProfileScreen');
    }
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
            {getGreeting()}, {user?.name || 'Sara'}
          </Text>
          <Text style={styles.date}>{getCurrentDate()}</Text>
        </View>
        <View style={styles.notificationBadge}>
          <Ionicons name="notifications" size={20} color="#fff" />
          <View style={styles.badgeCircle}>
            <Text style={styles.badgeText}>{patientsWaiting}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Patients Waiting Counter */}
        <View style={styles.waitingCard}>
          <MaterialCommunityIcons name="clock-alert-outline" size={40} color="#FF6B6B" />
          <View style={styles.waitingInfo}>
            <Text style={styles.waitingNumber}>{patientsWaiting}</Text>
            <Text style={styles.waitingLabel}>Patients Waiting</Text>
          </View>
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <TouchableOpacity onPress={() => setShowAddTaskModal(true)}>
              <Ionicons name="add-circle" size={28} color="#007BFF" />
            </TouchableOpacity>
          </View>
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskItem}
              onPress={() => toggleTask(task.id)}
            >
              <View style={styles.taskLeft}>
                <View style={styles.taskCheckbox}>
                  {task.completed && (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.taskText,
                    task.completed && styles.taskTextCompleted,
                  ]}
                >
                  {task.title}
                </Text>
              </View>
              <View style={styles.taskActions}>
                <TouchableOpacity
                  onPress={() => openEditTask(task)}
                  style={styles.taskActionButton}
                >
                  <Ionicons name="create-outline" size={18} color="#007BFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteTask(task.id)}
                  style={styles.taskActionButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Patient Queue Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Queue</Text>
          <View style={styles.queueCard}>
            {patientQueue.length === 0 ? (
              <View style={styles.emptyQueue}>
                <MaterialCommunityIcons name="account-check-outline" size={60} color="#ccc" />
                <Text style={styles.emptyQueueText}>No patients waiting</Text>
              </View>
            ) : (
              patientQueue.map((patient) => (
                <View key={patient.id} style={styles.queueItem}>
                  <View style={styles.queueItemContent}>
                    <View style={styles.queueItemHeader}>
                      <Text style={styles.queueName}>{patient.name}</Text>
                      <View style={styles.waitBadge}>
                        <Text style={styles.waitText}>{patient.waitTime}</Text>
                      </View>
                    </View>
                    <View style={styles.queueItemDetails}>
                      <Ionicons name="medical" size={16} color="#007BFF" />
                      <Text style={styles.queueDoctor}>{patient.doctor}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => removePatient(patient.id)}
                    style={styles.queueRemoveButton}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))
            )}
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
              <Text style={styles.sidebarTitle}>Menu</Text>
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
              onPress={() => navigateToScreen('appointments')}
            >
              <MaterialCommunityIcons name="calendar-clock" size={24} color="#007BFF" />
              <Text style={styles.sidebarItemText}>Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sidebarItem}
              onPress={() => navigateToScreen('profile')}
            >
              <Ionicons name="person" size={24} color="#007BFF" />
              <Text style={styles.sidebarItemText}>Nurse Profile</Text>
            </TouchableOpacity>
            <View style={styles.sidebarDivider} />
            <TouchableOpacity style={styles.sidebarItem} onPress={handleLogout}>
              <Ionicons name="log-out" size={24} color="#FF6B6B" />
              <Text style={[styles.sidebarItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={showAddTaskModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Task</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowAddTaskModal(false);
                  setNewTaskTitle('');
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonAdd]}
                onPress={addTask}
              >
                <Text style={styles.modalButtonTextAdd}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        visible={showEditTaskModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditTaskModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowEditTaskModal(false);
                  setNewTaskTitle('');
                  setEditingTask(null);
                }}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonAdd]}
                onPress={saveEditedTask}
              >
                <Text style={styles.modalButtonTextAdd}>Save</Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
    backgroundColor: '#FF6B6B',
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
  waitingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  waitingInfo: {
    marginLeft: 16,
  },
  waitingNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  waitingLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#007BFF',
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  taskActionButton: {
    padding: 8,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  queueCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  queueItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  queueItemContent: {
    flex: 1,
  },
  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  waitBadge: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  waitText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#856404',
  },
  queueItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueDoctor: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  queueRemoveButton: {
    padding: 8,
  },
  emptyQueue: {
    alignItems: 'center',
    padding: 40,
  },
  emptyQueueText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
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
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonAdd: {
    backgroundColor: '#007BFF',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonTextAdd: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DashboardScreen;

