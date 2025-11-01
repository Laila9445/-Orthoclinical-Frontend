import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Button,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const ContactUs = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        if (!name || !email || !message) {
            Alert.alert('خطأ', 'من فضلك املأ جميع الحقول');
            return;
        }
        Alert.alert('تم الإرسال', 'شكراً لتواصلك معنا!');
        setName('');
        setEmail('');
        setMessage('');
    };

    const ContactInfoItem = ({ icon, text }) => (
        <View style={styles.contactInfoItem}>
            <View style={styles.iconContainer}>
                <Text style={styles.iconText}>{icon}</Text>
            </View>
            <Text style={styles.contactInfoText}>{text}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" backgroundColor="#F6F8FB" />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Contact Us</Text>
                    <Text style={styles.subtitle}>We'd love to hear from you!</Text>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Send us a message</Text>

                    {/* Name Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor="#999999"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#999999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Message Field */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Write your message here…"
                            placeholderTextColor="#999999"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.submitButtonText}>Send Message</Text>
                    </TouchableOpacity>
                </View>

                {/* Contact Info Section */}
                <View style={styles.contactInfoSection}>
                    <ContactInfoItem icon="✉️" text="support@clinicms.com" />
                    <ContactInfoItem icon="📞" text="+20 100 123 4567" />
                    <ContactInfoItem icon="📍" text="Nile University, Giza, Egypt" />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>© 2025 Clinical Management System</Text>
                </View>

                {/* 👇 الزر الجديد هنا */}
                <View style={{ marginHorizontal: 40, marginTop: 10 }}>
                    <Button
                        title="Go to About Us"
                        onPress={() => router.push('/about')}
                        color="#3A7BD5"
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F6F8FB' },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 30 },
    header: {
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    title: { fontSize: 24, fontWeight: 'bold', color: '#3A7BD5', marginBottom: 4 },
    subtitle: { fontSize: 14, color: '#666666' },
    formCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    formTitle: { fontSize: 16, fontWeight: 'bold', color: '#444444', marginBottom: 20 },
    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, color: '#444444', marginBottom: 8, fontWeight: '500' },
    input: {
        backgroundColor: '#FBFCFE',
        borderWidth: 1,
        borderColor: '#E6E9EE',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#444444',
        height: 48,
    },
    textArea: { height: 120, paddingTop: 12 },
    submitButton: {
        backgroundColor: '#3A7BD5',
        height: 45,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    contactInfoSection: { marginTop: 32, marginHorizontal: 24 },
    contactInfoItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    iconContainer: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    iconText: { fontSize: 24 },
    contactInfoText: { fontSize: 14, color: '#444444', flex: 1 },
    footer: { alignItems: 'center', paddingVertical: 24, marginTop: 20 },
    footerText: { fontSize: 12, color: '#666666' },
});

export default ContactUs;

