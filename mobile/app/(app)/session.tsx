import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { generateTherapyQuestions, GeneratedQuestion } from '../../lib/gemini';

type FlowStep = 'START' | 'SELECT_MEMORY' | 'THERAPY' | 'FEEDBACK' | 'SUMMARY';

export default function SessionScreen() {
    // Flow State
    const [step, setStep] = useState<FlowStep>('START');
    const [loading, setLoading] = useState(false);

    // Data State
    const [memories, setMemories] = useState<any[]>([]);
    const [selectedMemory, setSelectedMemory] = useState<any>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [questions, setQuestions] = useState<GeneratedQuestion | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Results State
    const [photoResults, setPhotoResults] = useState<any[]>([]);
    const [sessionMood, setSessionMood] = useState('happy');

    // Load available memories for the patient
    useEffect(() => {
        if (step === 'SELECT_MEMORY') {
            loadMemories();
        }
    }, [step]);

    const loadMemories = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get the first patient for this caregiver (demo limitation)
            const { data: patient } = await supabase
                .from('Patient')
                .select('id')
                .eq('caregiverId', user.id)
                .limit(1)
                .single();

            if (patient) {
                const { data: memoriesData, error } = await supabase
                    .from('Memory')
                    .select(`
                        *,
                        MemoryPhoto (*)
                    `)
                    .eq('patientId', patient.id)
                    .order('date', { ascending: false });

                if (!error) setMemories(memoriesData || []);
            }
        } catch (err) {
            console.error('Failed to load memories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMemory = async (memory: any) => {
        if (!memory.MemoryPhoto || memory.MemoryPhoto.length === 0) {
            Alert.alert("No Photos", "This memory has no photos for therapy.");
            return;
        }
        setSelectedMemory(memory);
        startTherapyForPhoto(memory, 0);
    };

    const startTherapyForPhoto = async (memory: any, photoIdx: number) => {
        setLoading(true);
        setStep('THERAPY');
        setCurrentPhotoIndex(photoIdx);
        setCurrentQuestionIndex(0);

        const photo = memory.MemoryPhoto[photoIdx];

        const photoData = {
            title: memory.title,
            event: memory.event,
            location: memory.location,
            people: photo.people || [],
            description: photo.description || '',
            setting: photo.setting || '',
            activities: photo.activities || '',
            facialExpressions: photo.facialExpressions || ''
        };

        const result = await generateTherapyQuestions(photoData);
        if (result) {
            setQuestions(result);
        } else {
            setQuestions({
                questions: ["What can you tell me about this photo?", "Who is in this picture with you?"],
                hints: ["Look at the background", "They seem to be smiling"],
                difficulty: ["easy", "medium"]
            });
        }
        setLoading(false);
    };

    const handleNextQuestion = () => {
        if (!questions) return;
        if (currentQuestionIndex < questions.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setStep('FEEDBACK');
        }
    };

    const handlePhotoScore = (score: number) => {
        const result = {
            photoId: selectedMemory.MemoryPhoto[currentPhotoIndex].id,
            score
        };
        const newResults = [...photoResults, result];
        setPhotoResults(newResults);

        if (currentPhotoIndex < selectedMemory.MemoryPhoto.length - 1) {
            startTherapyForPhoto(selectedMemory, currentPhotoIndex + 1);
        } else {
            setStep('SUMMARY');
        }
    };

    const saveSession = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data: sessionData, error: sessionErr } = await supabase
                .from('TherapySession')
                .insert({
                    patientId: selectedMemory.patientId,
                    caregiverId: user?.id,
                    date: new Date().toISOString(),
                    duration: 5,
                    mood: sessionMood,
                    notes: `Completed therapy for memory: ${selectedMemory.title}`
                })
                .select()
                .single();

            if (sessionErr) throw sessionErr;

            const avgScore = photoResults.reduce((acc, r) => acc + r.score, 0) / photoResults.length;

            const { error: memErr } = await supabase
                .from('SessionMemory')
                .insert({
                    sessionId: sessionData.id,
                    memoryId: selectedMemory.id,
                    recallScore: Math.round(avgScore),
                    photoScores: photoResults
                });

            if (memErr) throw memErr;

            Alert.alert("Success", "Clinic therapy data saved!");
            resetSession();
        } catch (err) {
            console.error('Save failed:', err);
            Alert.alert("Error", "Failed to save session results.");
        } finally {
            setLoading(false);
        }
    };

    const resetSession = () => {
        setStep('START');
        setSelectedMemory(null);
        setPhotoResults([]);
        setCurrentPhotoIndex(0);
        setQuestions(null);
    };

    // UI Renders
    if (step === 'START') {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Session Therapy</Text>
                    <Text style={styles.subtitle}>Digital Reminiscence Aid</Text>
                </View>
                <View style={styles.startCard}>
                    <View style={styles.iconCircle}><Text style={styles.startIcon}>🧠</Text></View>
                    <Text style={styles.startTitle}>Ready for a session?</Text>
                    <Text style={styles.startSubtitle}>Pick a memory and let AI guide the conversation.</Text>
                    <TouchableOpacity style={styles.startButton} onPress={() => setStep('SELECT_MEMORY')}>
                        <Text style={styles.startButtonText}>Select Memory</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    if (step === 'SELECT_MEMORY') {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Choose a Memory</Text>
                {loading ? <ActivityIndicator size="large" color="#3B82F6" /> : (
                    <View style={styles.memoryGrid}>
                        {memories.map(m => (
                            <TouchableOpacity key={m.id} style={styles.memoryCardSmall} onPress={() => handleSelectMemory(m)}>
                                <Image source={{ uri: m.photoUrls?.[0] }} style={styles.memoryThumb} />
                                <View style={styles.memoryInfo}>
                                    <Text style={styles.memoryCardTitle}>{m.title}</Text>
                                    <Text style={styles.memoryCardSub}>{m.MemoryPhoto?.length || 0} Photos</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <TouchableOpacity style={styles.backBtn} onPress={() => setStep('START')}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>
            </ScrollView>
        );
    }

    if (step === 'THERAPY') {
        const currentPhoto = selectedMemory.MemoryPhoto[currentPhotoIndex];
        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${((currentPhotoIndex + 1) / selectedMemory.MemoryPhoto.length) * 100}%` }]} />
                        </View>
                        <Text style={styles.progressText}>Photo {currentPhotoIndex + 1} of {selectedMemory.MemoryPhoto.length}</Text>
                    </View>

                    <View style={styles.mainPhotoCard}>
                        {currentPhoto.photoUrl ? (
                            <Image source={{ uri: currentPhoto.photoUrl }} style={styles.mainPhoto} />
                        ) : (
                            <View style={styles.mainPhotoPlaceholder}><Text>🖼️</Text></View>
                        )}
                        <View style={styles.photoLabelsRow}>
                            {currentPhoto.people && currentPhoto.people.length > 0 && (
                                <View style={styles.tag}><Text style={styles.tagText}>👥 {currentPhoto.people.join(', ')}</Text></View>
                            )}
                            {currentPhoto.setting && (
                                <View style={styles.tag}><Text style={styles.tagText}>📍 {currentPhoto.setting}</Text></View>
                            )}
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loadingBubble}>
                            <ActivityIndicator color="white" />
                            <Text style={styles.loadingText}>Gemini is thinking...</Text>
                        </View>
                    ) : (
                        <View style={styles.promptBubble}>
                            <Text style={styles.promptLabel}>AI QUESTION</Text>
                            <Text style={styles.promptText}>{questions?.questions[currentQuestionIndex]}</Text>
                            {questions?.hints[currentQuestionIndex] && (
                                <View style={styles.hintBox}>
                                    <Text style={styles.hintText}>💡 {questions.hints[currentQuestionIndex]}</Text>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
                <View style={styles.stickyActions}>
                    <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
                        <Text style={styles.nextButtonText}>
                            {currentQuestionIndex < (questions?.questions.length || 0) - 1 ? 'Next Question' : 'Done with Photo'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (step === 'FEEDBACK') {
        return (
            <View style={[styles.container, styles.center]}>
                <View style={styles.feedbackCard}>
                    <Text style={styles.feedbackIcon}>⭐</Text>
                    <Text style={styles.feedbackTitle}>Photo Recall</Text>
                    <Text style={styles.feedbackSubtitle}>How well did they remember this specific photo?</Text>
                    <View style={styles.scoreRow}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <TouchableOpacity key={s} style={styles.scoreCircle} onPress={() => handlePhotoScore(s)}>
                                <Text style={styles.scoreVal}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.scoreLabels}>
                        <Text style={styles.scoreLabelText}>Forgot</Text>
                        <Text style={styles.scoreLabelText}>Full Recall</Text>
                    </View>
                </View>
            </View>
        );
    }

    if (step === 'SUMMARY') {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.feedbackCard}>
                    <Text style={styles.feedbackIcon}>🎉</Text>
                    <Text style={styles.feedbackTitle}>Session Complete!</Text>
                    <Text style={styles.feedbackSubtitle}>Final thoughts on their emotional state during the session.</Text>

                    <Text style={styles.inputLabel}>Overall Mood</Text>
                    <View style={styles.moodButtons}>
                        {['happy', 'neutral', 'sad', 'confused'].map(m => (
                            <TouchableOpacity
                                key={m}
                                style={[styles.moodButton, sessionMood === m && styles.moodButtonActive]}
                                onPress={() => setSessionMood(m)}
                            >
                                <Text style={styles.moodEmoji}>{m === 'happy' ? '😊' : m === 'neutral' ? '😐' : m === 'sad' ? '😢' : '😕'}</Text>
                                <Text style={styles.moodLabelText}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={saveSession} disabled={loading}>
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitButtonText}>Save Session Results</Text>}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelLink} onPress={resetSession}><Text style={styles.cancelLinkText}>Cancel</Text></TouchableOpacity>
                </View>
            </ScrollView>
        );
    }
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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        marginTop: 40,
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 18,
        color: '#64748B',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 40,
        marginBottom: 20,
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
        marginTop: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EFF6FF',
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
        color: '#1E3A8A',
        marginBottom: 12,
    },
    startSubtitle: {
        fontSize: 16,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    startButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderRadius: 16,
        width: '100%',
        alignItems: 'center',
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
    memoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    memoryCardSmall: {
        width: '47%',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    memoryThumb: {
        width: '100%',
        height: 120,
        backgroundColor: '#F1F5F9',
    },
    memoryInfo: {
        padding: 12,
    },
    memoryCardTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    memoryCardSub: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 4,
    },
    backBtn: {
        marginTop: 30,
        padding: 12,
    },
    backBtnText: {
        color: '#64748B',
        fontWeight: '600',
    },
    progressContainer: {
        marginBottom: 20,
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
    },
    progressText: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        textAlign: 'right',
    },
    mainPhotoCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    mainPhoto: {
        width: '100%',
        height: 300,
        borderRadius: 16,
    },
    mainPhotoPlaceholder: {
        width: '100%',
        height: 300,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoLabelsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    tag: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 12,
        color: '#1E40AF',
        fontWeight: '600',
    },
    loadingBubble: {
        backgroundColor: '#1E3A8A',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    loadingText: {
        color: 'white',
        fontWeight: '600',
    },
    promptBubble: {
        backgroundColor: '#1E3A8A',
        borderRadius: 24,
        padding: 24,
        borderBottomLeftRadius: 4,
    },
    promptLabel: {
        fontSize: 10,
        color: '#93C5FD',
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: 8,
    },
    promptText: {
        fontSize: 22,
        color: 'white',
        fontWeight: '600',
        lineHeight: 30,
    },
    hintBox: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    hintText: {
        color: '#93C5FD',
        fontSize: 15,
        fontStyle: 'italic',
    },
    stickyActions: {
        padding: 24,
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    nextButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    nextButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    feedbackCard: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 32,
        width: '90%',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    feedbackIcon: {
        fontSize: 48,
        textAlign: 'center',
        marginBottom: 16,
    },
    feedbackTitle: {
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        color: '#1E293B',
    },
    feedbackSubtitle: {
        fontSize: 15,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    scoreCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    scoreVal: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    scoreLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    scoreLabelText: {
        fontSize: 12,
        color: '#94A3B8',
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    moodButtons: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    moodButton: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    moodButtonActive: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
    },
    moodEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    moodLabelText: {
        fontSize: 10,
        color: '#64748B',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    submitButton: {
        backgroundColor: '#10B981',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
    },
    cancelLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    cancelLinkText: {
        color: '#64748B',
        fontWeight: '600',
    }
});
