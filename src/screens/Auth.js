import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getClient, getDatabases } from '../appwrite';
import { ID } from 'appwrite';

import Constants from 'expo-constants';

// ...

WebBrowser.maybeCompleteAuthSession();

export default function Auth({ navigation }) {
  const [loading, setLoading] = useState(false);

  // Use Proxy for Expo Go ('storeClient'), otherwise use standard redirect (Native/Standalone)
  const redirectUri = Constants.executionEnvironment === 'storeClient'
    ? 'https://auth.expo.io/@alexfekrys-organization/donation-store-management'
    : makeRedirectUri();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: '635500458464-knq0d9glkhikh6oq0k3ll4mf4ugem2bp.apps.googleusercontent.com',
    androidClientId: '635500458464-knq0d9glkhikh6oq0k3ll4mf4ugem2bp.apps.googleusercontent.com',
    redirectUri: redirectUri,
    scopes: ['profile', 'email', 'openid'],
  });

  useEffect(() => {
    if (request) {
      console.log('------------------------------------------------');
      console.log('Using Redirect URI:', request.redirectUri);
      console.log('------------------------------------------------');
    }
  }, [request]);

  useEffect(() => {
    (async () => {
      const s = await AsyncStorage.getItem('user');
      if (s) {
        navigation.replace('Home');
      }
    })();
  }, []);

  useEffect(() => {
    if (response) {
      console.log('Auth Response:', JSON.stringify(response, null, 2));
    }

    if (response?.type === 'success') {
      const { authentication } = response;
      handleLoginSuccess(authentication.accessToken);
    } else if (response?.type === 'dismiss') {
      // user cancelled
    } else if (response?.type === 'error') {
      Alert.alert('Authentication Error', response.error?.message || 'Something went wrong');
    }
  }, [response]);

  async function handleLoginSuccess(accessToken) {
    try {
      setLoading(true);
      // fetch user info
      const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${accessToken}` } });
      const profile = await resp.json();
      await AsyncStorage.setItem('user', JSON.stringify(profile));

      // attempt to save to Appwrite `users` collection (create collection 'users' first)
      const DATABASE_ID = '[DATABASE_ID]';
      if (DATABASE_ID === '[DATABASE_ID]') {
        console.warn('Appwrite Database ID is not configured. User saved locally only.');
      } else {
        try {
          const db = getDatabases();
          await db.createDocument(DATABASE_ID, 'users', ID.unique(), { email: profile.email, name: profile.name, picture: profile.picture });
        } catch (e) {
          console.warn('Appwrite save user failed', e.message || e);
        }
      }
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('خطأ في تسجيل الدخول', e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>تسجيل الدخول</Text>
      {loading ? <ActivityIndicator /> : (
        <Button
          mode="contained"
          disabled={!request}
          onPress={() => {
            promptAsync();
          }}
        >
          تسجيل الدخول بحساب Google
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }, title: { fontSize: 20, marginBottom: 12 } });
