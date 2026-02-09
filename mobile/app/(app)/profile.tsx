// Profile Screen - Patient Details and Settings
import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Modal, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../lib/api';
import { Theme } from '../../constants/Theme';
import { User, LogOut, X, Info, Calendar } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const [patient, setPatient] = useState<any>(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            await api.init();
            const { data, error } = await api.getPatient();

            if (data) {
                setPatient(data);
                await AsyncStorage.setItem('patient', JSON.stringify(data));
            } else {
                const cached = await AsyncStorage.getItem('patient');
                if (cached) setPatient(JSON.parse(cached));
            }
        } catch (e) {
            const cached = await AsyncStorage.getItem('patient');
            if (cached) setPatient(JSON.parse(cached));
        }
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        api.setPatientId('');
        await AsyncStorage.removeItem('patient');
        setShowLogoutModal(false);
        router.replace('/');
    };

    if (!patient) return <View style={styles.container} />;

    return (
        <View style={styles.container}>
            {/* Mesh Background */}
            <Animated.View
                entering={FadeIn.duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.08)', top: -100, left: -100, opacity: undefined }]}
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header / Back */}
                <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.7}>
                    <View style={styles.closeIconBg}>
                        <X size={24} color={Theme.colors.textSecondary} strokeWidth={2.5} />
                    </View>
                </TouchableOpacity>

                <Animated.View
                    entering={FadeInDown.duration(800).springify()}
                    style={styles.profileHeader}
                >
                    <View style={[styles.avatarContainer, styles.cardShadow]}>
                        {patient.photoUrl ? (
                            <Image source={{ uri: patient.photoUrl }} style={styles.avatar} />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <User size={64} color={Theme.colors.textSecondary} strokeWidth={1.5} />
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{patient.name}</Text>
                    {patient.diagnosis && <Text style={styles.diagnosisBadge}>{patient.diagnosis}</Text>}
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(200).duration(800).springify()}
                    style={[styles.infoCard, styles.cardShadow]}
                >
                    <View style={styles.infoRow}>
                        <View style={styles.infoLabelGroup}>
                            <Info size={18} color={Theme.colors.primary} />
                            <Text style={styles.label}>Age</Text>
                        </View>
                        <Text style={styles.value}>{patient.age || 'N/A'} years old</Text>
                    </View>

                    {patient.caregiverName && (
                        <View style={styles.infoRow}>
                            <View style={styles.infoLabelGroup}>
                                <User size={18} color={Theme.colors.primary} />
                                <Text style={styles.label}>Caregiver</Text>
                            </View>
                            <Text style={styles.value}>{patient.caregiverName}</Text>
                        </View>
                    )}

                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                        <View style={styles.infoLabelGroup}>
                            <Calendar size={18} color={Theme.colors.primary} />
                            <Text style={styles.label}>Member Since</Text>
                        </View>
                        <Text style={styles.value}>
                            {patient.createdAt ? new Date(patient.createdAt).getFullYear() : new Date().getFullYear()}
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View
                    entering={FadeInUp.delay(400).duration(800)}
                    style={styles.actions}
                >
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                        <LogOut size={20} color="#EF4444" strokeWidth={2.5} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                    <Text style={styles.version}>Memora v1.0.0</Text>
                </Animated.View>
            </ScrollView>

            {/* Luxurious Logout Modal */}
            <Modal
                visible={showLogoutModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowLogoutModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeInDown.springify().duration(600)}
                        style={[styles.modalContent, styles.cardShadow]}
                    >
                        <View style={styles.modalIconBg}>
                            <LogOut size={32} color="#EF4444" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.modalTitle}>Exit Memora?</Text>
                        <Text style={styles.modalSubtitle}>Are you sure you want to log out of your memory companion?</Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setShowLogoutModal(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelBtnText}>Stay Here</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={confirmLogout}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.confirmBtnText}>Log Out</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background,
    },
    meshGradient: {
        position: 'absolute',
        width: width * 1.2,
        height: width * 1.2,
        borderRadius: width * 0.6,
        opacity: 0.8,
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
    closeIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 20,
    },
    avatarContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        marginBottom: 20,
        backgroundColor: Theme.colors.surface,
        padding: 4,
    },
    cardShadow: {
        ...Platform.select({
            ios: {
                shadowColor: Theme.colors.secondary,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
            },
            android: {
                elevation: 6,
            }
        })
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
    },
    avatarPlaceholder: {
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 32,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 12,
        letterSpacing: -1,
    },
    diagnosisBadge: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 15,
        color: Theme.colors.primary,
        fontWeight: '700',
        backgroundColor: Theme.colors.primaryUltraLight,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    infoCard: {
        width: '100%',
        backgroundColor: Theme.colors.surface,
        borderRadius: 32,
        padding: 24,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: Theme.colors.background,
    },
    infoLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    label: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 17,
        fontWeight: '600',
        color: Theme.colors.textSecondary,
    },
    value: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 17,
        fontWeight: '700',
        color: Theme.colors.text,
    },
    actions: {
        width: '100%',
        alignItems: 'center',
        gap: 20,
        marginBottom: 40,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        paddingVertical: 18,
        paddingHorizontal: 40,
        borderRadius: 20,
        gap: 10,
        borderWidth: 1,
        borderColor: '#FEE2E2',
        width: '100%',
        justifyContent: 'center',
    },
    logoutText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        fontWeight: '800',
        color: '#EF4444',
    },
    version: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        color: Theme.colors.textSecondary,
        opacity: 0.5,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 36,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    modalIconBg: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 26,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    modalSubtitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 20,
        backgroundColor: Theme.colors.background,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cancelBtnText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        fontWeight: '800',
        color: Theme.colors.textSecondary,
    },
    confirmBtn: {
        flex: 1,
        paddingVertical: 18,
        borderRadius: 20,
        backgroundColor: '#EF4444',
        alignItems: 'center',
    },
    confirmBtnText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});
