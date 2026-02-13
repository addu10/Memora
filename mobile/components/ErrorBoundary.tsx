import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Theme } from '../constants/Theme';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRestart = () => {
        // In a real app, we might use Updates.reloadAsync() from expo-updates
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <LinearGradient
                        colors={['#FDFBFF', '#F5F3FF']}
                        style={styles.gradient}
                    >
                        <View style={styles.content}>
                            <View style={styles.iconContainer}>
                                <AlertTriangle size={48} color={Theme.colors.error || '#EF4444'} />
                            </View>
                            <Text style={styles.title}>Something went wrong</Text>
                            <Text style={styles.message}>
                                We've encountered an unexpected error. Our team has been notified.
                            </Text>

                            <ScrollView style={styles.errorScroll} showsVerticalScrollIndicator={false}>
                                <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
                            </ScrollView>

                            <TouchableOpacity
                                style={styles.button}
                                onPress={this.handleRestart}
                            >
                                <RefreshCw size={20} color="#FFFFFF" strokeWidth={2.5} />
                                <Text style={styles.buttonText}>Try Again</Text>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontFamily: 'Outfit_800ExtraBold',
        fontSize: 24,
        color: '#1F2937',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    errorScroll: {
        maxHeight: 150,
        width: '100%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 32,
    },
    errorText: {
        fontFamily: 'monospace',
        fontSize: 12,
        color: '#374151',
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 100,
        alignItems: 'center',
        gap: 12,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
