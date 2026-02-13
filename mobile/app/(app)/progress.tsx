// Progress Screen - Elderly-Friendly Stats View
import { StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import {
    Target,
    ImageIcon,
    Brain,
    Users,
    Calendar,
    Smile,
    Meh,
    Frown,
    Lightbulb,
    TrendingUp,
    Heart
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
    return (
        <View style={styles.container}>
            {/* Mesh Background */}
            <Animated.View
                entering={FadeIn.duration(1200)}
                style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.08)', top: -100, left: -100 }]}
            />

            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.duration(800).springify()}
                    style={styles.header}
                >
                    <Text style={styles.title}>Your Progress</Text>
                    <Text style={styles.subtitle}>You are doing great! <Heart size={18} color="#EF4444" fill="#EF4444" /></Text>
                </Animated.View>

                {/* Big Stats Cards */}
                <View style={styles.statsGrid}>
                    <Animated.View
                        entering={FadeInUp.delay(200).duration(600).springify()}
                        style={[styles.statCard, styles.statBlue]}
                    >
                        <View style={styles.statHeader}>
                            <Target size={24} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statSubtext}>Outstanding details</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(300).duration(600).springify()}
                        style={[styles.statCard, styles.statGreen]}
                    >
                        <View style={styles.statHeader}>
                            <ImageIcon size={24} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.statLabel}>Photos</Text>
                        </View>
                        <Text style={styles.statValue}>48</Text>
                        <Text style={styles.statSubtext}>Memories viewed</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(400).duration(600).springify()}
                        style={[styles.statCard, styles.statOrange]}
                    >
                        <View style={styles.statHeader}>
                            <Brain size={24} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.statLabel}>Memory</Text>
                        </View>
                        <Text style={styles.statValue}>High</Text>
                        <Text style={styles.statSubtext}>Keep it up!</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(500).duration(600).springify()}
                        style={styles.statCardContainer}
                    >
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={Theme.colors.brandGradient as any}
                                style={styles.statCardGradient}
                            >
                                <View style={styles.statHeader}>
                                    <Users size={24} color="#FFFFFF" strokeWidth={2.5} />
                                    <Text style={styles.statLabel}>Family</Text>
                                </View>
                                <Text style={styles.statValue}>8</Text>
                                <Text style={styles.statSubtext}>People recognized</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Recent Activity */}
                <Animated.View
                    entering={FadeInUp.delay(600).duration(800)}
                    style={styles.section}
                >
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.emptyStateContainer}>
                        <LinearGradient
                            colors={['#FFFFFF', '#F5F3FF']}
                            style={styles.emptyState}
                        >
                            <View style={styles.emptyIconBg}>
                                <Calendar size={40} color={Theme.colors.textSecondary} opacity={0.5} />
                            </View>
                            <Text style={styles.emptyText}>
                                Your daily activity log will appear here.
                            </Text>
                        </LinearGradient>
                    </View>
                </Animated.View>

                {/* Mood History */}
                <Animated.View
                    entering={FadeInUp.delay(800).duration(800)}
                    style={styles.section}
                >
                    <Text style={styles.sectionTitle}>How You Felt</Text>
                    <View style={styles.moodRow}>
                        {[
                            { id: 'happy', icon: Smile, color: '#22C55E', label: 'Happy', count: 12, height: '60%', delay: 1000 },
                            { id: 'okay', icon: Meh, color: '#F59E0B', label: 'Okay', count: 5, height: '30%', delay: 1100 },
                            { id: 'sad', icon: Frown, color: '#EF4444', label: 'Sad', count: 2, height: '10%', delay: 1200 }
                        ].map((mood) => (
                            <Animated.View
                                key={mood.id}
                                entering={FadeInLeft.delay(mood.delay).duration(600).springify()}
                                style={styles.moodItemContainer}
                            >
                                <LinearGradient
                                    colors={['#FFFFFF', '#F5F3FF']}
                                    style={styles.moodItem}
                                >
                                    <mood.icon size={32} color={mood.color} strokeWidth={2.5} />
                                    <Text style={mood.label === 'Happy' ? styles.moodLabel : styles.moodLabel}>{mood.label}</Text>
                                    <View style={styles.moodBar}>
                                        <View style={[styles.moodFill, { height: mood.height as any, backgroundColor: mood.color }]} />
                                    </View>
                                    <Text style={styles.moodCount}>{mood.count}</Text>
                                </LinearGradient>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Encouragement */}
                <Animated.View
                    entering={FadeInUp.delay(1400).duration(800).springify()}
                    style={styles.encourageCard}
                >
                    <View style={styles.encourageContent}>
                        <View style={styles.encourageHeader}>
                            <TrendingUp size={18} color="#854D0E" strokeWidth={3} />
                            <Text style={styles.encourageTitle}>Top Tip</Text>
                        </View>
                        <Text style={styles.encourageText}>
                            "Reviewing photos before bed can help strengthen memory pathways."
                        </Text>
                    </View>
                    <View style={styles.encourageIconBg}>
                        <Lightbulb size={32} color="#EAB308" strokeWidth={2.5} fill="#FEF08A" />
                    </View>
                </Animated.View>
            </ScrollView>
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
        paddingBottom: 48,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    header: {
        marginTop: 20,
        marginBottom: 32,
    },
    title: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 36,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        width: '47.5%',
        borderRadius: 28,
        padding: 20,
        minHeight: 160,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    statCardContainer: {
        width: '47.5%',
        borderRadius: 28,
        minHeight: 160,
        overflow: 'hidden',
    },
    statCardGradient: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    statBlue: { backgroundColor: '#3B82F6' },
    statGreen: { backgroundColor: '#10B981' },
    statOrange: { backgroundColor: '#F59E0B' },

    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statLabel: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.9)',
    },
    statValue: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        marginVertical: 4,
        letterSpacing: -1,
    },
    statSubtext: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 13,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },

    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 22,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 20,
        letterSpacing: -0.5,
    },
    emptyStateContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        borderStyle: 'dashed',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: '600',
    },

    moodRow: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    moodItemContainer: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    moodItem: {
        flex: 1,
        padding: 16,
        alignItems: 'center',
    },
    moodLabel: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 14,
        fontWeight: '700',
        color: Theme.colors.textSecondary,
        marginBottom: 12,
        marginTop: 8,
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
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        fontWeight: '900',
        color: Theme.colors.text,
    },

    encourageCard: {
        backgroundColor: '#FEF9C3',
        borderRadius: 28,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        borderWidth: 1,
        borderColor: '#FEF08A',
        marginBottom: 40,
    },
    encourageContent: {
        flex: 1,
    },
    encourageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    encourageTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 20,
        fontWeight: '900',
        color: '#854D0E',
    },
    encourageText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: '#A16207',
        lineHeight: 24,
        fontStyle: 'italic',
        fontWeight: '600',
    },
    encourageIconBg: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
