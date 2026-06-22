import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { chatClient, retryRequest } from '../api/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: 'Halo Kak! 👋 Saya Barista Digital TS KOPI. Ada yang bisa saya bantu?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await retryRequest(
        () => chatClient.post('/api/menu/chat', { message: userText }),
        3,
        500
      );
      const botText = res.data?.text?.trim() || '';
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: botText || 'Maaf kak, jawaban tidak tersedia.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      const isNetwork = !err.response && !isTimeout;
      const errText = isTimeout
        ? 'Barista butuh waktu lebih lama. Coba tanya yang lebih singkat ya kak.'
        : isNetwork
        ? 'Barista sedang istirahat. Coba cek koneksi internet dan tanya lagi!'
        : 'Maaf kak, layanan AI sedang sibuk. Coba lagi dalam beberapa saat ya.';
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: errText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [input, loading]);

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View
      style={{
        alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        marginBottom: 10,
      }}
    >
      <View
        style={{
          backgroundColor: item.role === 'user' ? '#d97706' : '#fff',
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: item.role === 'user' ? '#d97706' : '#e2e8f0',
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: item.role === 'user' ? '#fff' : '#1e293b',
            lineHeight: 18,
          }}
        >
          {item.text}
        </Text>
      </View>
      <Text
        style={{
          fontSize: 9,
          color: '#cbd5e1',
          marginTop: 4,
          alignSelf: item.role === 'user' ? 'flex-end' : 'flex-start',
          fontWeight: '600',
        }}
      >
        {item.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: Platform.OS === 'android' ? 36 : 28,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#f1f5f9',
            backgroundColor: '#fff',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '900', color: '#1e293b' }}>
            
          </Text>
          <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '600' }}>
            Asisten digital TS KOPI
          </Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
                <ActivityIndicator size="small" color="#d97706" />
                <Text style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8, fontWeight: '600' }}>
                  Barista sedang mengetik...
                </Text>
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View
          style={{
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
            backgroundColor: '#fff',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: '#f8fafc',
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 14,
                color: '#1e293b',
                fontWeight: '600',
                maxHeight: 100,
                borderWidth: 1,
                borderColor: '#e2e8f0',
              }}
              placeholder="Tanya barista..."
              placeholderTextColor="#94a3b8"
              value={input}
              onChangeText={setInput}
              multiline
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={{
                marginLeft: 10,
                backgroundColor: '#d97706',
                width: 40,
                height: 40,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              disabled={loading || !input.trim()}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
