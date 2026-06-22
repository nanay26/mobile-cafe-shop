import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { apiClient } from '../api/client';
import { useNavigation } from '@react-navigation/native';

export default function AddMenuScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const categories = ['Kopi', 'Non-Kopi', 'Makanan', 'Snack'];

  const handleSubmit = async () => {
    if (!name.trim() || !price.trim() || !category.trim()) {
      Alert.alert('Error', 'Nama, harga, dan kategori wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('price', price.trim());
      formData.append('description', description.trim());
      formData.append('category', category.trim());
      // Note: Image upload tidak tersedia di mobile tanpa library picker
      // Gunakan endpoint upload dengan placeholder
      formData.append('image', '' as any);

      await apiClient.post('/api/menu/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Sukses', 'Menu berhasil ditambahkan', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Add menu error:', err);
      Alert.alert('Error', 'Gagal menambahkan menu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <View style={{ padding: 20, paddingTop: 48 }}>
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#1e293b', marginBottom: 4 }}>
          Tambah Menu
        </Text>
        <Text style={{ fontSize: 11, color: '#94a3b8', marginBottom: 20, fontWeight: '600' }}>
          Tambah item baru ke daftar menu
        </Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>
            NAMA MENU
          </Text>
          <TextInput
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 14,
              fontWeight: '700',
              color: '#1e293b',
            }}
            placeholder="Contoh: Kopi Susu Aren"
            placeholderTextColor="#cbd5e1"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>
            HARGA
          </Text>
          <TextInput
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 14,
              fontWeight: '700',
              color: '#1e293b',
            }}
            placeholder="25000"
            placeholderTextColor="#cbd5e1"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>
            KATEGORI
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  backgroundColor: category === cat ? '#d97706' : '#fff',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: category === cat ? '#d97706' : '#e2e8f0',
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '800',
                    color: category === cat ? '#fff' : '#64748b',
                  }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 6 }}>
            DESKRIPSI
          </Text>
          <TextInput
            style={{
              backgroundColor: '#fff',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 14,
              fontWeight: '600',
              color: '#1e293b',
              minHeight: 80,
            }}
            placeholder="Deskripsi menu..."
            placeholderTextColor="#cbd5e1"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: '#d97706',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>SIMPAN MENU</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            marginTop: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '700' }}>Batal</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
