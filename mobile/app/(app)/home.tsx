// Home Screen - Patient-Centric, Elderly-Friendly
import { useState, useEffect } from 'react';
import { Link, router } from 'expo-router';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../lib/api';

export default function HomeScreen() {
    const [patientName, setPatientName] = useState('');
    const [greeting, setGreeting] = useState('Hello');

    useEffect(() => {
        loadPatientInfo();
        updateGreeting();
    }, []);

    const loadPatientInfo = async () => {
        try {
            const patient = await AsyncStorage.getItem('patient');
            if (patient) {
                const parsed = JSON.parse(patient);
                setPatientName(parsed.name || 'Friend');
            }
        } catch (e) {
            setPatientName('Friend');
        }
    };

    const updateGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    };

    const handleLogout = () => {
        Alert.alert(
            'Exit App?',
            'Do you want to close Memora?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        api.setPatientId(''); // Clear API state
                        await AsyncStorage.removeItem('patient');
                        router.replace('/');
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Welcome Section */}
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.greeting}>{greeting},</Text>
                    <Text style={styles.patientName}>{patientName}</Text>
                </View>
                <Link href="/(app)/profile" asChild>
                    <TouchableOpacity style={styles.profileButton}>
                        <Text style={styles.profileIcon}>👤</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            {/* Today's Tip */}
            <View style={styles.tipCard}>
                <View style={styles.tipHeader}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <Text style={styles.tipTitle}>Daily Inspiration</Text>
                </View>
                <Text style={styles.tipText}>
                    "Looking at old photos can help strengthen memory pathways. Try the 'Memory Game' today!"
                </Text>
            </View>

            {/* Main Actions Grid */}
            <View style={styles.gridContainer}>
                <Link href="/(app)/recognize" asChild>
                    <TouchableOpacity style={[styles.card, styles.cardBlue]}>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardIcon}>👀</Text>
                            <View>
                                <Text style={styles.cardTitle}>Face Scan</Text>
                                <Text style={styles.cardSubtitle}>Who is this?</Text>
                            </View>
                        </View>
                        <View style={styles.cardArrow}>
                            <Text style={styles.arrowText}>→</Text>
                        </View>
                    </TouchableOpacity>
                </Link>

                <Link href="/(app)/session" asChild>
                    <TouchableOpacity style={[styles.card, styles.cardOrange]}>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardIcon}>🧩</Text>
                            <View>
                                <Text style={styles.cardTitle}>Play Game</Text>
                                <Text style={styles.cardSubtitle}>Memory exercises</Text>
                            </View>
                        </View>
                        <View style={styles.cardArrow}>
                            <Text style={styles.arrowText}>→</Text>
                        </View>
                    </TouchableOpacity>
                </Link>

                <Link href="/(app)/memories" asChild>
                    <TouchableOpacity style={[styles.card, styles.cardGreen]}>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardIcon}>📸</Text>
                            <View>
                                <Text style={styles.cardTitle}>Gallery</Text>
                                <Text style={styles.cardSubtitle}>View photos</Text>
                            </View>
                        </View>
                        <View style={styles.cardArrow}>
                            <Text style={styles.arrowText}>→</Text>
                        </View>
                    </TouchableOpacity>
                </Link>

                <Link href="/(app)/family" asChild>
                    <TouchableOpacity style={[styles.card, styles.cardPurple]}>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardIcon}>👨‍👩‍👧</Text>
                            <View>
                                <Text style={styles.cardTitle}>Family</Text>
                                <Text style={styles.cardSubtitle}>My loved ones</Text>
                            </View>
                        </View>
                        <View style={styles.cardArrow}>
                            <Text style={styles.arrowText}>→</Text>
                        </View>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Slate-50
    },
    content: {
        padding: 24,
        paddingTop: 80, // Increased to account for hidden header and status bar
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontSize: 18,
        color: '#64748B', // Slate-500
        fontWeight: '500',
    },
    patientName: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B', // Slate-800
        letterSpacing: -0.5,
    },
    profileButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileIcon: {
        fontSize: 24,
    },
    tipCard: {
        backgroundColor: '#FFFBEB', // Amber-50
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#FDE68A', // Amber-200
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    tipIcon: {
        fontSize: 24,
    },
    tipTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#92400E', // Amber-800
    },
    tipText: {
        fontSize: 18,
        color: '#B45309', // Amber-700
        lineHeight: 26,
    },
    gridContainer: {
        gap: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    cardBlue: { borderLeftWidth: 6, borderLeftColor: '#3B82F6' },
    cardOrange: { borderLeftWidth: 6, borderLeftColor: '#F97316' },
    cardGreen: { borderLeftWidth: 6, borderLeftColor: '#22C55E' },
    cardPurple: { borderLeftWidth: 6, borderLeftColor: '#A855F7' },

    cardIcon: {
        fontSize: 32,
    },
    cardTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    cardArrow: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9', // Slate-100
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowText: {
        fontSize: 20,
        color: '#94A3B8',
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: 40,
        alignSelf: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    logoutText: {
        fontSize: 18,
        color: '#EF4444', // Red-500
        fontWeight: '600',
    },
});
