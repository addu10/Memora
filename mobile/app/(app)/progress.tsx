// Progress Screen - Elderly-Friendly Stats View
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function ProgressScreen() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Your Progress</Text>
                <Text style={styles.subtitle}>You are doing great! 🌟</Text>
            </View>

            {/* Big Stats Cards */}
            <View style={styles.statsGrid}>
                <View style={[styles.statCard, styles.statBlue]}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statIcon}>🎯</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                    </View>
                    <Text style={styles.statValue}>12</Text>
                    <Text style={styles.statSubtext}>Outstanding details</Text>
                </View>

                <View style={[styles.statCard, styles.statGreen]}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statIcon}>📷</Text>
                        <Text style={styles.statLabel}>Photos</Text>
                    </View>
                    <Text style={styles.statValue}>48</Text>
                    <Text style={styles.statSubtext}>Memories viewed</Text>
                </View>

                <View style={[styles.statCard, styles.statOrange]}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statIcon}>🧠</Text>
                        <Text style={styles.statLabel}>Memory</Text>
                    </View>
                    <Text style={styles.statValue}>High</Text>
                    <Text style={styles.statSubtext}>Keep it up!</Text>
                </View>

                <View style={[styles.statCard, styles.statPurple]}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statIcon}>👨‍👩‍👧</Text>
                        <Text style={styles.statLabel}>Family</Text>
                    </View>
                    <Text style={styles.statValue}>8</Text>
                    <Text style={styles.statSubtext}>People recognized</Text>
                </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>

                {/* List items would go here, using empty state for now */}
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyText}>
                        Your daily activity log will appear here.
                    </Text>
                </View>
            </View>

            {/* Mood History */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How You Felt</Text>
                <View style={styles.moodRow}>
                    <View style={styles.moodItem}>
                        <Text style={styles.moodEmoji}>😊</Text>
                        <Text style={styles.moodLabel}>Happy</Text>
                        <View style={styles.moodBar}>
                            <View style={[styles.moodFill, { height: '60%', backgroundColor: '#22C55E' }]} />
                        </View>
                        <Text style={styles.moodCount}>12</Text>
                    </View>
                    <View style={styles.moodItem}>
                        <Text style={styles.moodEmoji}>😐</Text>
                        <Text style={styles.moodLabel}>Okay</Text>
                        <View style={styles.moodBar}>
                            <View style={[styles.moodFill, { height: '30%', backgroundColor: '#F59E0B' }]} />
                        </View>
                        <Text style={styles.moodCount}>5</Text>
                    </View>
                    <View style={styles.moodItem}>
                        <Text style={styles.moodEmoji}>😢</Text>
                        <Text style={styles.moodLabel}>Sad</Text>
                        <View style={styles.moodBar}>
                            <View style={[styles.moodFill, { height: '10%', backgroundColor: '#EF4444' }]} />
                        </View>
                        <Text style={styles.moodCount}>2</Text>
                    </View>
                </View>
            </View>

            {/* Encouragement */}
            <View style={styles.encourageCard}>
                <View style={styles.encourageContent}>
                    <Text style={styles.encourageTitle}>Top Tip</Text>
                    <Text style={styles.encourageText}>
                        "Reviewing photos before bed can help strengthen memory pathways."
                    </Text>
                </View>
                <Text style={styles.encourageIcon}>💡</Text>
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
        paddingBottom: 48,
    },
    header: {
        marginTop: 20,
        marginBottom: 32,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 18,
        color: '#64748B',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 40,
    },
    statCard: {
        width: '47%',
        borderRadius: 24,
        padding: 20,
        minHeight: 160,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statBlue: { backgroundColor: '#3B82F6' },
    statGreen: { backgroundColor: '#10B981' },
    statOrange: { backgroundColor: '#F59E0B' },
    statPurple: { backgroundColor: '#8B5CF6' },

    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statIcon: {
        fontSize: 24,
    },
    statLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
    },
    statValue: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FFFFFF',
        marginVertical: 4,
    },
    statSubtext: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },

    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 20,
    },
    emptyState: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 16,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 24,
    },

    moodRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    moodItem: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
    },
    moodEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    moodLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 12,
    },
    moodBar: {
        width: 8,
        height: 80,
        backgroundColor: '#F1F5F9',
        borderRadius: 4,
        justifyContent: 'flex-end',
        overflow: 'hidden',
        marginBottom: 12,
    },
    moodFill: {
        width: '100%',
        borderRadius: 4,
    },
    moodCount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
    },

    encourageCard: {
        backgroundColor: '#FEF9C3', // Yellow-100
        borderRadius: 24,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: '#FEF08A',
        shadowColor: '#EAB308',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 2,
    },
    encourageContent: {
        flex: 1,
    },
    encourageTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#854D0E', // Yellow-900
        marginBottom: 4,
    },
    encourageText: {
        fontSize: 16,
        color: '#A16207', // Yellow-700
        lineHeight: 24,
        fontStyle: 'italic',
    },
    encourageIcon: {
        fontSize: 40,
    },
});
