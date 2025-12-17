// Therapy Session Screen
import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';

export default function SessionScreen() {
    const [sessionStarted, setSessionStarted] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [feedback, setFeedback] = useState<{ recallScore: number; mood: string } | null>(null);

    // Demo memory for session
    const sessionMemory = {
        id: 1,
        title: 'Onam 2023',
        date: '2023-08-29',
        event: 'Onam',
        location: 'Home',
        people: ['Amma', 'Achan', 'Priya'],
    };

    // AI-generated prompts (demo)
    const prompts = [
        "Who prepared the sadhya for this Onam celebration?",
        "What was your favorite dish at the feast?",
        "Who made the pookalam that year?",
        "Which family members visited for Onam?",
    ];

    const startSession = () => {
        setSessionStarted(true);
        setCurrentStep(0);
    };

    const nextPrompt = () => {
        if (currentStep < prompts.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setSessionStarted(false);
            setFeedback({ recallScore: 0, mood: '' });
        }
    };

    const submitFeedback = (recallScore: number, mood: string) => {
        if (recallScore === 0 || !mood) {
            Alert.alert("Please complete feedback", "Select a rating and a mood.");
            return;
        }
        setFeedback(null);
        Alert.alert("Session Saved", "Great job! Your progress has been recorded.");
        // In production, this would save to the database
    };

    if (feedback !== null) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.centerContent}>
                <View style={styles.feedbackCard}>
                    <Text style={styles.feedbackIcon}>🎉</Text>
                    <Text style={styles.feedbackTitle}>Session Complete!</Text>
                    <Text style={styles.feedbackSubtitle}>How well did they remember?</Text>

                    <Text style={styles.inputLabel}>Memory Recall</Text>
                    <View style={styles.scoreButtons}>
                        {[1, 2, 3, 4, 5].map(score => (
                            <TouchableOpacity
                                key={score}
                                style={[styles.scoreButton, feedback.recallScore === score && styles.scoreButtonActive]}
                                onPress={() => setFeedback({ ...feedback, recallScore: score })}
                            >
                                <Text style={[styles.scoreText, feedback.recallScore === score && styles.scoreTextActive]}>
                                    {score}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.scoreLabels}>
                        <Text style={styles.scoreLabelText}>Forgot</Text>
                        <Text style={styles.scoreLabelText}>Remembered Well</Text>
                    </View>

                    <Text style={styles.inputLabel}>Their Mood</Text>
                    <View style={styles.moodButtons}>
                        {[
                            { emoji: '😊', value: 'happy', label: 'Happy' },
                            { emoji: '😐', value: 'neutral', label: 'Neutral' },
                            { emoji: '😢', value: 'sad', label: 'Sad' },
                            { emoji: '😕', value: 'confused', label: 'Confused' },
                        ].map(mood => (
                            <TouchableOpacity
                                key={mood.value}
                                style={[styles.moodButton, feedback.mood === mood.value && styles.moodButtonActive]}
                                onPress={() => setFeedback({ ...feedback, mood: mood.value })}
                            >
                                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                                <Text style={styles.moodLabel}>{mood.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={() => submitFeedback(feedback.recallScore, feedback.mood)}
                    >
                        <Text style={styles.submitButtonText}>Save Progress</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    if (!sessionStarted) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Therapy Session</Text>
                    <Text style={styles.subtitle}>Daily memory exercises</Text>
                </View>

                <View style={styles.startCard}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.startIcon}>💬</Text>
                    </View>
                    <Text style={styles.startTitle}>Start New Session</Text>
                    <Text style={styles.startSubtitle}>
                        We have selected 4 photos for today.
                        Let's review them together.
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>⏱️</Text>
                        <Text style={styles.infoText}>~5 Minutes</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🧠</Text>
                        <Text style={styles.infoText}>Improves Recall</Text>
                    </View>

                    <TouchableOpacity style={styles.startButton} onPress={startSession}>
                        <Text style={styles.startButtonText}>Begin Session</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tipCard}>
                    <Text style={styles.tipIcon}>💡</Text>
                    <View>
                        <Text style={styles.tipTitle}>Caregiver Tip</Text>
                        <Text style={styles.tipText}>
                            Be patient. If they struggle, offer a small hint rather than the answer.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Progress */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((currentStep + 1) / prompts.length) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    Question {currentStep + 1} of {prompts.length}
                </Text>
            </View>

            {/* Memory Card */}
            <View style={styles.memoryCard}>
                <View style={styles.memoryImagePlaceholder}>
                    <Text style={styles.memoryPlaceholderIcon}>🖼️</Text>
                </View>
                <View style={styles.memoryDetails}>
                    <Text style={styles.memoryTitle}>{sessionMemory.title}</Text>
                    <Text style={styles.memoryMeta}>
                        {sessionMemory.event} • {sessionMemory.location}
                    </Text>
                    <View style={styles.peopleTag}>
                        <Text style={styles.peopleText}>👥 {sessionMemory.people.join(', ')}</Text>
                    </View>
                </View>
            </View>

            {/* AI Prompt */}
            <View style={styles.promptContainer}>
                <View style={styles.promptBubble}>
                    <Text style={styles.promptLabel}>🤖 AI Question</Text>
                    <Text style={styles.promptText}>{prompts[currentStep]}</Text>
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.skipButton} onPress={nextPrompt}>
                    <Text style={styles.skipButtonText}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.nextButton} onPress={nextPrompt}>
                    <Text style={styles.nextButtonText}>
                        {currentStep < prompts.length - 1 ? 'Next Question' : 'Finish Session'}
                    </Text>
                </TouchableOpacity>
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
        paddingBottom: 48,
    },
    centerContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    header: {
        marginTop: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 18,
        color: '#64748B',
    },
    startCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
        marginBottom: 24,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#eff6ff', // Blue-50
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    startIcon: {
        fontSize: 40,
    },
    startTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E3a8a',
        marginBottom: 12,
        textAlign: 'center',
    },
    startSubtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        width: '100%',
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
        width: '100%',
        paddingHorizontal: 12,
    },
    infoIcon: {
        fontSize: 20,
    },
    infoText: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
    },
    startButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
        marginTop: 12,
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    tipCard: {
        flexDirection: 'row',
        gap: 16,
        backgroundColor: '#FFFBEB', // Amber-50
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    tipIcon: {
        fontSize: 24,
    },
    tipTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#92400E',
        marginBottom: 4,
    },
    tipText: {
        fontSize: 15,
        color: '#B45309',
        lineHeight: 22,
        flex: 1,
    },

    // In-Session Styles
    progressContainer: {
        marginBottom: 24,
        marginTop: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E2E8F0',
        borderRadius: 4,
        marginBottom: 8,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '600',
        textAlign: 'right',
    },
    memoryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    memoryImagePlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    memoryPlaceholderIcon: {
        fontSize: 64,
        opacity: 0.5,
    },
    memoryDetails: {
        paddingHorizontal: 8,
    },
    memoryTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
    },
    memoryMeta: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 12,
        fontWeight: '500',
    },
    peopleTag: {
        backgroundColor: '#EFF6FF',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    peopleText: {
        fontSize: 14,
        color: '#1E40AF',
        fontWeight: '600',
    },
    promptContainer: {
        marginBottom: 32,
    },
    promptBubble: {
        backgroundColor: '#1E3A8A', // Dark Blue
        borderRadius: 24,
        padding: 24,
        borderBottomLeftRadius: 4,
    },
    promptLabel: {
        fontSize: 12,
        color: '#93C5FD',
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: 1,
    },
    promptText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#FFFFFF',
        lineHeight: 30,
    },
    actions: {
        flexDirection: 'row',
        gap: 16,
    },
    skipButton: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    skipButtonText: {
        color: '#64748B',
        fontWeight: '700',
        fontSize: 16,
    },
    nextButton: {
        flex: 2,
        backgroundColor: '#3B82F6',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    nextButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },

    // Feedback Styles
    feedbackCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    feedbackIcon: {
        fontSize: 64,
        textAlign: 'center',
        marginBottom: 20,
    },
    feedbackTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 8,
    },
    feedbackSubtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 12,
        marginTop: 8,
    },
    scoreButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 8,
    },
    scoreButton: {
        flex: 1,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    scoreButtonActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    scoreText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#64748B',
    },
    scoreTextActive: {
        color: '#3B82F6',
    },
    scoreLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        paddingHorizontal: 4,
    },
    scoreLabelText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    moodButtons: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 32,
    },
    moodButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    moodButtonActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    moodEmoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    moodLabel: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#10B981',
        paddingVertical: 20,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
