// Profile Screen - Patient Details and Settings
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../lib/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            // Ensure API is initialized with patientId
            await api.init();

            // Fetch fresh data from API
            const { data, error } = await api.getPatient();

            if (data) {
                setPatient(data);
                // Update cache
                await AsyncStorage.setItem('patient', JSON.stringify(data));
            } else if (error) {
                // Fallback to cache
                const cached = await AsyncStorage.getItem('patient');
                if (cached) {
                    setPatient(JSON.parse(cached));
                }
            }
        } catch (e) {
            // Fallback to cache on error
            const cached = await AsyncStorage.getItem('patient');
            if (cached) {
                setPatient(JSON.parse(cached));
            }
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to exit Memora?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        api.setPatientId('');
                        await AsyncStorage.removeItem('patient');
                        router.replace('/');
                    }
                }
            ]
        );
    };

    if (!patient) return <View style={styles.container} />;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header / Back */}
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <Ionicons name="close-circle" size={36} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    {patient.photoUrl ? (
                        <Image source={{ uri: patient.photoUrl }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={64} color="#CBD5E1" />
                        </View>
                    )}
                </View>
                <Text style={styles.name}>{patient.name}</Text>
                {patient.diagnosis && <Text style={styles.subtitle}>{patient.diagnosis}</Text>}
            </View>

            <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Age</Text>
                    <Text style={styles.value}>{patient.age || 'N/A'} years old</Text>
                </View>
                {patient.caregiverName && (
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Caregiver</Text>
                        <Text style={styles.value}>{patient.caregiverName}</Text>
                    </View>
                )}
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Member Since</Text>
                    <Text style={styles.value}>
                        {patient.createdAt ? new Date(patient.createdAt).getFullYear() : new Date().getFullYear()}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
                <Text style={styles.version}>Memora v1.0.0</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    content: {
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        right: 24,
        zIndex: 10,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    avatarContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
    },
    avatarPlaceholder: {
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 18,
        color: '#64748B',
        fontWeight: '500',
    },
    infoCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    label: {
        fontSize: 18,
        color: '#64748B',
    },
    value: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
    },
    actions: {
        width: '100%',
        alignItems: 'center',
        gap: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FEE2E2',
    },
    logoutText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#EF4444',
    },
    version: {
        fontSize: 14,
        color: '#CBD5E1',
    },
});
