import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, AlertCircle, Sparkles, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Theme } from '../constants/Theme';

interface StatusModalProps {
    visible: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    onClose: () => void;
}

export function StatusModal({ visible, type, title, message, onClose }: StatusModalProps) {
    const isSuccess = type === 'success';
    const isError = type === 'error';

    const icon = isSuccess ? <CheckCircle2 size={32} color="#10B981" strokeWidth={2.5} /> :
        isError ? <AlertCircle size={32} color="#EF4444" strokeWidth={2.5} /> :
            <Info size={32} color={Theme.colors.primary} strokeWidth={2.5} />;

    const iconBg = isSuccess ? '#F0FDF4' :
        isError ? '#FEF2F2' :
            Theme.colors.primaryUltraLight;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Animated.View
                    entering={FadeInDown.springify().duration(600)}
                    style={[styles.content, styles.shadow]}
                >
                    <View style={[styles.iconBg, { backgroundColor: iconBg }]}>
                        {icon}
                    </View>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
                        <LinearGradient
                            colors={isError ? ['#EF4444', '#DC2626'] : isSuccess ? ['#10B981', '#059669'] : Theme.colors.brandGradient as any}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>{isSuccess ? 'Great!' : isError ? 'Dismiss' : 'Continue'}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 36,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
            },
            android: {
                elevation: 12,
            }
        })
    },
    iconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 24,
        fontWeight: '900',
        color: Theme.colors.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        color: Theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        fontWeight: '500',
    },
    button: {
        width: '100%',
        height: 60,
        borderRadius: 20,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});
