import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Username dan password wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan koneksi';
      Alert.alert('Login Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#faf9f6' }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 28,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View
            style={{
              backgroundColor: '#d97706',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 32 }}>☕</Text>
          </View>
          <Text
            style={{
              fontSize: 26,
              fontWeight: '900',
              color: '#1e293b',
              letterSpacing: 1,
            }}
          >
            TS KOPI
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: '#94a3b8',
              marginTop: 6,
              letterSpacing: 3,
              fontWeight: '700',
            }}
          >
            ADMIN PORTAL
          </Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '800',
              color: '#94a3b8',
              marginBottom: 6,
              letterSpacing: 1,
            }}
          >
            USERNAME
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              borderRadius: 10,
              padding: 14,
              fontSize: 14,
              color: '#1e293b',
            }}
            placeholder="admin_tskopi"
            placeholderTextColor="#cbd5e1"
          />
        </View>

        <View style={{ marginBottom: 28 }}>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '800',
              color: '#94a3b8',
              marginBottom: 6,
              letterSpacing: 1,
            }}
          >
            PASSWORD
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{
              backgroundColor: '#f8fafc',
              borderWidth: 1,
              borderColor: '#e2e8f0',
              borderRadius: 10,
              padding: 14,
              fontSize: 14,
              color: '#1e293b',
            }}
            placeholder="••••••••"
            placeholderTextColor="#cbd5e1"
          />
        </View>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#d97706',
            padding: 16,
            borderRadius: 10,
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: '#fff',
                fontWeight: '800',
                fontSize: 12,
                letterSpacing: 2,
              }}
            >
              SIGN IN
            </Text>
          )}
        </TouchableOpacity>

        <Text
          style={{
            textAlign: 'center',
            fontSize: 10,
            color: '#cbd5e1',
            marginTop: 24,
            fontWeight: '600',
            letterSpacing: 1,
          }}
        >
          Authorized personnel only
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
