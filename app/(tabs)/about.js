import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function AboutUs() {
    const router = useRouter();
    
    const teamMembers = [
        { id: 1, name: 'Laila Sarg', emoji: '🩺' },
        { id: 2, name: 'Malak Ayman', emoji: '🩺' },
        { id: 3, name: 'Nada Hassan', emoji: '🩺' },
        { id: 4, name: 'Nada Mohamed', emoji: '🩺' },
        { id: 5, name: 'Hagar Hashim', emoji: '🩺' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.homeButton}
                    onPress={() => router.push('/Home')}
                >
                    <MaterialCommunityIcons name="home" size={24} color="#121417" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>About Us</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Who We Are */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Who We Are</Text>
                    <Text style={styles.cardText}>
                        We are dedicated to revolutionizing clinical management through innovative
                        technology, providing healthcare professionals with the tools they need to
                        deliver exceptional patient care efficiently and effectively.
                    </Text>
                </View>

                {/* Mission & Vision */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Mission & Vision</Text>

                    <View style={styles.missionItem}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.iconText}>🎯</Text>
                        </View>
                        <View style={styles.missionContent}>
                            <Text style={styles.missionTitle}>Our Mission</Text>
                            <Text style={styles.missionText}>
                                To empower healthcare providers with a seamless, intuitive, and
                                comprehensive management system that enhances productivity and
                                improves patient outcomes.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.missionItem}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.iconText}>👁️</Text>
                        </View>
                        <View style={styles.missionContent}>
                            <Text style={styles.missionTitle}>Our Vision</Text>
                            <Text style={styles.missionText}>
                                To be the leading platform in clinical management, setting new
                                standards for innovation, reliability, and user-centric design in
                                healthcare technology.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Our Team */}
                <View style={styles.card}>
                    <Text style={styles.teamTitle}>Our Team</Text>
                    <View style={styles.teamGrid}>
                        {teamMembers.map((member) => (
                            <View key={member.id} style={styles.teamMember}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarEmoji}>{member.emoji}</Text>
                                </View>
                                <Text style={styles.memberName}>{member.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2025 Clinical Management System — All Rights Reserved
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6f7f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    homeButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#f6f7f8',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#121417',
    },
    placeholder: {
        width: 48,
    },
    scrollView: {
        flex: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 16,
        marginTop: 16,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#121417',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 15,
        lineHeight: 22,
        color: '#666',
    },
    missionItem: {
        flexDirection: 'row',
        marginTop: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#3d85d133',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconText: {
        fontSize: 24,
    },
    missionContent: {
        flex: 1,
    },
    missionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#121417',
        marginBottom: 4,
    },
    missionText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#666',
    },
    teamTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#121417',
        textAlign: 'center',
        marginBottom: 24,
    },
    teamGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    teamMember: {
        width: '30%',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f6f7f8',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarEmoji: {
        fontSize: 28,
    },
    memberName: {
        fontSize: 13,
        fontWeight: '500',
        color: '#121417',
        textAlign: 'center',
    },
    footer: {
        paddingVertical: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});