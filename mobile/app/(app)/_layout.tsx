// App Tab Layout - Luxurious Light Aesthetic
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { Theme } from '../../constants/Theme';
import { Home, Image as ImageIcon, ScanLine, Brain, Users } from 'lucide-react-native';

interface TabIconProps {
    IconComponent: any;
    label: string;
    focused: boolean;
}

function TabIcon({ IconComponent, label, focused }: TabIconProps) {
    return (
        <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
            <IconComponent
                size={24}
                color={focused ? Theme.colors.primary : Theme.colors.textSecondary}
                strokeWidth={focused ? 2.5 : 2}
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
                headerShown: false,
                tabBarStyle: {
                    height: Platform.OS === 'ios' ? 100 : 85,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
                    paddingTop: 12,
                    backgroundColor: Theme.colors.surface,
                    borderTopWidth: 1,
                    borderTopColor: Theme.colors.border,
                    ...Theme.shadows.lg,
                },
                tabBarShowLabel: false,
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon IconComponent={Home} label="Home" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="memories"
                options={{
                    title: 'Photos',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon IconComponent={ImageIcon} label="Photos" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="recognize"
                options={{
                    title: 'Who?',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon IconComponent={ScanLine} label="Who?" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="session"
                options={{
                    title: 'Play',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon IconComponent={Brain} label="Play" focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="family"
                options={{
                    title: 'Family',
                    tabBarIcon: ({ focused }) => (
                        <TabIcon IconComponent={Users} label="Family" focused={focused} />
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
        // Subtle indicator can be added here if needed
    },
    tabIcon: {
        marginBottom: 6,
    },
    tabLabel: {
        fontFamily: Theme.typography.fontFamily,
        fontSize: 11,
        color: Theme.colors.textSecondary,
        fontWeight: '600',
    },
    tabLabelFocused: {
        color: Theme.colors.primary,
        fontWeight: '800',
    },
});
