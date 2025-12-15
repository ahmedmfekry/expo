import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import HomeScreen from './src/screens/ItemList';
import AddItem from './src/screens/AddItem';
import AddStock from './src/screens/AddStock';
import ConsumeStock from './src/screens/ConsumeStock';
import ReturnStock from './src/screens/ReturnStock';
import Auth from './src/screens/Auth';
import { initAppwrite } from './src/appwrite';
import * as Notifications from 'expo-notifications';
import { requestPermissions } from './src/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#B71C1C',
      accent: '#FFC107'
    }
  };

  useEffect(() => {
    (async () => {
      initAppwrite();
      Notifications.setNotificationHandler({
        handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false })
      });
      await requestPermissions();
      // check auth
      const user = await AsyncStorage.getItem('user');
      if (!user) setInitialRoute('Auth');
      setLoading(false);
    })();
  }, []);

  const [initialRoute, setInitialRoute] = useState('Home');

  if (loading) return <SafeAreaProvider><SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator /></SafeAreaView></SafeAreaProvider>;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRoute}>
            <Stack.Screen name="Auth" component={Auth} options={{ title: 'تسجيل الدخول' }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'المخزن' }} />
            <Stack.Screen name="AddItem" component={AddItem} options={{ title: 'اضافة صنف' }} />
            <Stack.Screen name="AddStock" component={AddStock} options={{ title: 'اضافة مخزون' }} />
            <Stack.Screen name="ConsumeStock" component={ConsumeStock} options={{ title: 'صرف للمحافظة' }} />
            <Stack.Screen name="ReturnStock" component={ReturnStock} options={{ title: 'اضافة مرتجع' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
