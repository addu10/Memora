import { Stack } from 'expo-router';

export default function MemoriesLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // We use custom back buttons in the screens
                animation: 'slide_from_right'
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
