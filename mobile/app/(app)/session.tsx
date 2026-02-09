import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, Dimensions, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../../constants/Theme';
import { supabase } from '../../lib/supabase';
import { generateTherapyQuestions, GeneratedQuestion } from '../../lib/gemini';
import {
    Brain,
    ArrowRight,
    ChevronLeft,
    Camera,
    Users,
    MapPin,
    Sparkles,
    Lightbulb,
    Smile,
    Meh,
    Frown,
    HelpCircle,
    CheckCircle2,
    Calendar,
    Target,
    Heart
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn, FadeInLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

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

    // Dynamic Loading Phrases
    const loadingPhrases = [
        "✨ Crafting the perfect question...",
        "🧠 Thinking about this memory...",
        "💭 Finding the right words...",
        "🎯 Personalizing for you...",
        "🌟 Almost ready...",
        "💫 Making it special...",
        "🔮 Creating something meaningful..."
    ];
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

    // Rotate loading phrases
    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setLoadingPhraseIndex(prev => (prev + 1) % loadingPhrases.length);
        }, 2000);
        return () => clearInterval(interval);
    }, [loading]);

    // Load available memories for the patient
    useEffect(() => {
        if (step === 'SELECT_MEMORY') {
            loadMemories();
        }
    }, [step]);

    const loadMemories = async () => {
        setLoading(true);
        try {
            const patientData = await AsyncStorage.getItem('patient');
            if (!patientData) {
                setLoading(false);
                return;
            }

            const patient = JSON.parse(patientData);
            if (!patient.id) {
                setLoading(false);
                return;
            }

            const { data: memoriesData, error } = await supabase
                .from('Memory')
                .select(`
                    *,
                    MemoryPhoto (*)
                `)
                .eq('patientId', patient.id)
                .order('date', { ascending: false });

            if (error) {
                console.error('Error fetching memories:', error);
            } else {
                setMemories(memoriesData || []);
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
            photoUrl: photo.photoUrl || '',
            photoIndex: photoIdx + 1,
            totalPhotos: memory.MemoryPhoto.length,
            photoDescription: photo.description || '',
            photoPeople: photo.people || [],
            facialExpressions: photo.facialExpressions || '',
            setting: photo.setting || '',
            activities: photo.activities || '',
            memoryTitle: memory.title || '',
            memoryDescription: memory.description || '',
            memoryEvent: memory.event || '',
            memoryLocation: memory.location || '',
            memoryDate: memory.date || new Date().toISOString(),
            memoryPeople: memory.people || '',
            memoryImportance: memory.importance || 3
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
            const patientData = await AsyncStorage.getItem('patient');
            const patient = patientData ? JSON.parse(patientData) : null;

            const { data: sessionData, error: sessionErr } = await supabase
                .from('TherapySession')
                .insert({
                    patientId: selectedMemory.patientId || patient?.id,
                    caregiverId: null,
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

            Alert.alert("Success", "Your therapy session has been saved!");
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
            <View style={styles.container}>
                <Animated.View
                    entering={FadeIn.duration(1200)}
                    style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.08)', top: -100, left: -100 }]}
                />
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Animated.View
                        entering={FadeInDown.duration(800).springify()}
                        style={styles.header}
                    >
                        <Text style={styles.title}>Session Therapy</Text>
                        <Text style={styles.subtitle}>Digital Reminiscence Aid</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(200).duration(800).springify()}
                        style={[styles.startCard, styles.cardShadow]}
                    >
                        <View style={styles.iconCircle}>
                            <Brain size={40} color={Theme.colors.primary} strokeWidth={2.5} />
                        </View>
                        <Text style={styles.startTitle}>Ready for a session?</Text>
                        <Text style={styles.startSubtitle}>Pick a memory and let AI guide the conversation to strengthen your neural pathways.</Text>

                        <TouchableOpacity
                            style={styles.startButtonContainer}
                            onPress={() => setStep('SELECT_MEMORY')}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={Theme.colors.brandGradient as any}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.startButtonGradient}
                            >
                                <Text style={styles.startButtonText}>Select Memory</Text>
                                <ArrowRight size={20} color="#FFFFFF" strokeWidth={3} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </View>
        );
    }

    if (step === 'SELECT_MEMORY') {
        return (
            <View style={styles.container}>
                <Animated.View
                    entering={FadeIn.duration(1200)}
                    style={[styles.meshGradient, { backgroundColor: 'rgba(167, 139, 250, 0.08)', top: -100, left: -100 }]}
                />
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Animated.View entering={FadeInDown.duration(800).springify()}>
                        <TouchableOpacity style={styles.backLink} onPress={() => setStep('START')} activeOpacity={0.7}>
                            <ChevronLeft size={20} color={Theme.colors.primary} strokeWidth={2.5} />
                            <Text style={styles.backLinkText}>Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.sectionTitle}>Choose a Memory</Text>
                    </Animated.View>

                    {loading ? (
                        <View style={styles.loadingCenter}>
                            <ActivityIndicator size="large" color={Theme.colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.memoryGrid}>
                            {memories.map((m, index) => (
                                <Animated.View
                                    key={m.id}
                                    entering={FadeInUp.delay(200 + index * 100).duration(600).springify()}
                                    style={styles.memoryCardSmallContainer}
                                >
                                    <TouchableOpacity style={[styles.memoryCardSmall, styles.cardShadow]} onPress={() => handleSelectMemory(m)} activeOpacity={0.9}>
                                        <Image source={{ uri: m.photoUrls?.[0] }} style={styles.memoryThumb} />
                                        <View style={styles.memoryInfo}>
                                            <Text style={styles.memoryCardTitle} numberOfLines={1}>{m.title}</Text>
                                            <View style={styles.memoryCardMeta}>
                                                <Camera size={12} color={Theme.colors.textSecondary} />
                                                <Text style={styles.memoryCardSub}>{m.MemoryPhoto?.length || 0} Photos</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>
        );
    }

    if (step === 'THERAPY') {
        const currentPhoto = selectedMemory.MemoryPhoto[currentPhotoIndex];
        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Animated.View
                        entering={FadeInDown.duration(600)}
                        style={styles.progressContainer}
                    >
                        <View style={styles.progressBar}>
                            <Animated.View
                                style={[styles.progressFill, { width: `${((currentPhotoIndex + 1) / selectedMemory.MemoryPhoto.length) * 100}%` }]}
                            />
                        </View>
                        <Text style={styles.progressText}>Photo {currentPhotoIndex + 1} of {selectedMemory.MemoryPhoto.length}</Text>
                    </Animated.View>

                    <Animated.View
                        entering={FadeInUp.delay(200).duration(800).springify()}
                        style={[styles.mainPhotoCard, styles.cardShadow]}
                    >
                        <View style={styles.photoContainer}>
                            {currentPhoto.photoUrl ? (
                                <Image source={{ uri: currentPhoto.photoUrl }} style={styles.mainPhoto} />
                            ) : (
                                <View style={styles.mainPhotoPlaceholder}>
                                    <Camera size={64} color={Theme.colors.textSecondary} opacity={0.3} />
                                </View>
                            )}
                        </View>
                        <View style={styles.photoLabelsRow}>
                            {currentPhoto.people && currentPhoto.people.length > 0 && (
                                <View style={styles.tag}>
                                    <Users size={12} color={Theme.colors.primary} />
                                    <Text style={styles.tagText}>{currentPhoto.people.join(', ')}</Text>
                                </View>
                            )}
                            {currentPhoto.setting && (
                                <View style={styles.tag}>
                                    <MapPin size={12} color={Theme.colors.primary} />
                                    <Text style={styles.tagText}>{currentPhoto.setting}</Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    {loading ? (
                        <Animated.View
                            entering={FadeIn.duration(400)}
                            style={styles.loadingBubble}
                        >
                            <ActivityIndicator color="white" />
                            <Text style={styles.loadingText}>{loadingPhrases[loadingPhraseIndex]}</Text>
                        </Animated.View>
                    ) : (
                        <Animated.View
                            entering={FadeInUp.delay(400).duration(600).springify()}
                            style={styles.promptBubble}
                        >
                            <View style={styles.promptHeader}>
                                <Sparkles size={16} color="#93C5FD" fill="#93C5FD" />
                                <Text style={styles.promptLabel}>AI QUESTION</Text>
                            </View>
                            <Text style={styles.promptText}>{questions?.questions[currentQuestionIndex]}</Text>
                            {questions?.hints[currentQuestionIndex] && (
                                <View style={styles.hintBox}>
                                    <View style={styles.hintHeader}>
                                        <Lightbulb size={14} color="#93C5FD" />
                                        <Text style={styles.hintTitle}>HINT</Text>
                                    </View>
                                    <Text style={styles.hintText}>{questions.hints[currentQuestionIndex]}</Text>
                                </View>
                            )}
                        </Animated.View>
                    )}
                </ScrollView>
                <Animated.View
                    entering={FadeInUp.delay(600).duration(800)}
                    style={styles.stickyActions}
                >
                    <TouchableOpacity
                        style={[styles.nextButtonContainer, styles.buttonShadow]}
                        onPress={handleNextQuestion}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={Theme.colors.brandGradient as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextButtonGradient}
                        >
                            <Text style={styles.nextButtonText}>
                                {currentQuestionIndex < (questions?.questions.length || 0) - 1 ? 'Next Question' : 'Done with Photo'}
                            </Text>
                            <ArrowRight size={20} color="#FFFFFF" strokeWidth={3} />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }

    if (step === 'FEEDBACK') {
        return (
            <View style={[styles.container, styles.center]}>
                <Animated.View
                    entering={FadeIn.duration(1200)}
                    style={[styles.meshGradient, { backgroundColor: 'rgba(16, 185, 129, 0.08)', bottom: -100, right: -100 }]}
                />
                <Animated.View
                    entering={FadeInUp.duration(600).springify()}
                    style={[styles.feedbackCard, styles.cardShadow]}
                >
                    <View style={styles.feedbackIconBg}>
                        <Target size={48} color={Theme.colors.primary} strokeWidth={2.5} />
                    </View>
                    <Text style={styles.feedbackTitle}>Photo Recall</Text>
                    <Text style={styles.feedbackSubtitle}>How well did they remember this specific photo?</Text>
                    <View style={styles.scoreRow}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <TouchableOpacity key={s} style={styles.scoreCircle} onPress={() => handlePhotoScore(s)} activeOpacity={0.7}>
                                <Text style={styles.scoreVal}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.scoreLabels}>
                        <Text style={styles.scoreLabelText}>Struggled</Text>
                        <Text style={styles.scoreLabelText}>Perfect Recall</Text>
                    </View>
                </Animated.View>
            </View>
        );
    }

    if (step === 'SUMMARY') {
        return (
            <View style={styles.container}>
                <Animated.View
                    entering={FadeIn.duration(1200)}
                    style={[styles.meshGradient, { backgroundColor: 'rgba(16, 185, 129, 0.08)', top: -100, left: -100 }]}
                />
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Animated.View
                        entering={FadeInUp.duration(600).springify()}
                        style={[styles.feedbackCard, { width: '100%' }, styles.cardShadow]}
                    >
                        <View style={[styles.feedbackIconBg, { backgroundColor: '#F0FDF4' }]}>
                            <CheckCircle2 size={48} color="#10B981" strokeWidth={2.5} />
                        </View>
                        <Text style={styles.feedbackTitle}>Session Complete!</Text>
                        <Text style={styles.feedbackSubtitle}>How did the session feel overall?</Text>

                        <Text style={styles.inputLabel}>Overall Mood</Text>
                        <View style={styles.moodButtons}>
                            {[
                                { id: 'happy', icon: Smile, color: '#22C55E' },
                                { id: 'neutral', icon: Meh, color: '#F59E0B' },
                                { id: 'sad', icon: Frown, color: '#EF4444' },
                                { id: 'confused', icon: HelpCircle, color: '#6366F1' }
                            ].map(m => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[styles.moodButton, sessionMood === m.id && { borderColor: m.color, backgroundColor: m.color + '10' }]}
                                    onPress={() => setSessionMood(m.id)}
                                    activeOpacity={0.7}
                                >
                                    <m.icon size={24} color={sessionMood === m.id ? m.color : Theme.colors.textSecondary} strokeWidth={2.5} />
                                    <Text style={[styles.moodLabelText, sessionMood === m.id && { color: m.color }]}>{m.id}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={[styles.submitButtonContainer, styles.buttonShadow]} onPress={saveSession} disabled={loading} activeOpacity={0.9}>
                            <LinearGradient
                                colors={['#10B981', '#059669']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitButtonGradient}
                            >
                                {loading ? <ActivityIndicator color="white" /> : (
                                    <>
                                        <Text style={styles.submitButtonText}>Save Results</Text>
                                        <Heart size={20} color="#FFFFFF" fill="#FFFFFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelLink} onPress={resetSession} activeOpacity={0.7}>
                            <Text style={styles.cancelLinkText}>Discard Session</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </View>
        );
    }
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
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCenter: {
        paddingVertical: 100,
        alignItems: 'center',
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
    },
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 16,
        marginTop: 10,
    },
    backLinkText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    sectionTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 24,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    startCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 36,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
        marginTop: 10,
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
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.primaryUltraLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    startTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 28,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    startSubtitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 17,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 32,
        fontWeight: '500',
    },
    startButtonContainer: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    startButtonGradient: {
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    startButtonText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    memoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    memoryCardSmallContainer: {
        width: '47.4%',
    },
    memoryCardSmall: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    memoryThumb: {
        width: '100%',
        height: 120,
        backgroundColor: Theme.colors.background,
    },
    memoryInfo: {
        padding: 12,
    },
    memoryCardTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 15,
        fontWeight: '800',
        color: Theme.colors.text,
    },
    memoryCardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    memoryCardSub: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 12,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
    },
    progressContainer: {
        marginBottom: 24,
        marginTop: 10,
    },
    progressBar: {
        height: 8,
        backgroundColor: Theme.colors.surface,
        borderRadius: 4,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Theme.colors.primary,
        borderRadius: 4,
    },
    progressText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 12,
        color: Theme.colors.textSecondary,
        fontWeight: '700',
        textAlign: 'right',
    },
    mainPhotoCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 32,
        padding: 12,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    photoContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: Theme.colors.background,
    },
    mainPhoto: {
        width: '100%',
        height: 320,
    },
    mainPhotoPlaceholder: {
        width: '100%',
        height: 320,
        justifyContent: 'center',
        alignItems: 'center',
    },
    photoLabelsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        padding: 12,
    },
    tag: {
        backgroundColor: Theme.colors.primaryUltraLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tagText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 12,
        color: Theme.colors.primary,
        fontWeight: '700',
    },
    loadingBubble: {
        backgroundColor: Theme.colors.primary,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 16,
        borderBottomLeftRadius: 4,
    },
    loadingText: {
        fontFamily: Theme.typography.fontFamily,
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    promptBubble: {
        backgroundColor: Theme.colors.primary,
        borderRadius: 32,
        padding: 32,
        borderBottomLeftRadius: 8,
        marginBottom: 20,
    },
    promptHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    promptLabel: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 11,
        color: '#93C5FD',
        fontWeight: '900',
        letterSpacing: 1,
    },
    promptText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 24,
        color: 'white',
        fontWeight: '700',
        lineHeight: 34,
    },
    hintBox: {
        marginTop: 20,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
    },
    hintHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    hintTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 11,
        color: '#93C5FD',
        fontWeight: '900',
        letterSpacing: 1,
    },
    hintText: {
        fontFamily: Theme.typography.fontFamily,
        color: '#BFDBFE',
        fontSize: 17,
        fontStyle: 'italic',
        fontWeight: '600',
        lineHeight: 26,
    },
    stickyActions: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        backgroundColor: Theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: Theme.colors.border,
    },
    nextButtonContainer: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    buttonShadow: {
        ...Platform.select({
            ios: {
                shadowColor: Theme.colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
            },
            android: {
                elevation: 4,
            }
        })
    },
    nextButtonGradient: {
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    nextButtonText: {
        fontFamily: Theme.typography.fontFamily,
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
    feedbackCard: {
        backgroundColor: Theme.colors.surface,
        borderRadius: 40,
        padding: 40,
        width: '90%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    feedbackIconBg: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Theme.colors.primaryUltraLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    feedbackTitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
        color: Theme.colors.text,
        letterSpacing: -0.5,
    },
    feedbackSubtitle: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 40,
        fontWeight: '500',
        lineHeight: 24,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
    },
    scoreCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: Theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Theme.colors.border,
    },
    scoreVal: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 22,
        fontWeight: '900',
        color: Theme.colors.text,
    },
    scoreLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    scoreLabelText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 13,
        color: Theme.colors.textSecondary,
        fontWeight: '700',
    },
    inputLabel: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 18,
        fontWeight: '800',
        color: Theme.colors.text,
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    moodButtons: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 40,
        width: '100%',
    },
    moodButton: {
        flex: 1,
        backgroundColor: Theme.colors.background,
        paddingVertical: 18,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Theme.colors.border,
        gap: 8,
    },
    moodLabelText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 10,
        color: Theme.colors.textSecondary,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    submitButtonContainer: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    submitButtonGradient: {
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    submitButtonText: {
        fontFamily: Theme.typography.fontFamily,
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
    },
    cancelLink: {
        marginTop: 24,
        padding: 8,
    },
    cancelLinkText: {
        fontFamily: Theme.typography.fontFamily,
        color: Theme.colors.textSecondary,
        fontWeight: '700',
        fontSize: 15,
        textDecorationLine: 'underline',
    }
});
