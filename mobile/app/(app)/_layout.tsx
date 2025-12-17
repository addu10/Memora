// App Tab Layout - Professional & Elegant
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ icon, label, focused }: { icon: keyof typeof Ionicons.glyphMap; label: string; focused: boolean }) {
    return (
        <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
            <Ionicons
                name={focused ? icon : `${icon}-outline` as any}
                size={28}
                color={focused ? '#2563EB' : '#94A3B8'}
                style={styles.tabIcon}
            />
            <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
        </View>
    );
}

export default function AppLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false, // Removed default header as requested
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 100 : 80,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
                    paddingTop: 12,
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F1F5F9',
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="home" label="Home" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="memories"
                options={{
                    title: 'Photos',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="images" label="Photos" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="recognize"
                options={{
                    title: 'Who?',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="scan-circle" label="Who?" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="session"
                options={{
                    title: 'Play',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="game-controller" label="Play" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="family"
                options={{
                    title: 'Family',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon icon="people" label="Family" focused={focused} />
                    ),
                }}
            />

            {/* Hidden Routes */}
            <Tabs.Screen
                name="progress"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="profile"
                options={{ href: null }}
            />
            {/* If there are any other auto-generated routes, explicit hide them or ensure file structure is correct. 
                Expo Router automatically creates routes for files in the directory.
                Any file that is NOT a tab needs href: null if it's in this folder.
                However, sub-folders like family/[id] do not generate tab buttons automatically, only direct files do usually.
                But if 'progress.tsx' was there, it definitely needs hiding. 
            */}
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
        height: '100%',
    },
    tabItemFocused: {
        // Removed background color for cleaner look, relying on icon color
    },
    tabIcon: {
        marginBottom: 4,
    },
    tabLabel: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    tabLabelFocused: {
        color: '#2563EB',
        fontWeight: '700',
    },
});
