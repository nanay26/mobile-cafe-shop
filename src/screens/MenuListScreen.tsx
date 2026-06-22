import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { apiClient } from '../api/client';
import { useNavigation } from '@react-navigation/native';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  coffee: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  'non-coffee': { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
  snack: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
};

export default function MenuListScreen() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const navigation = useNavigation();

  const categories = ['Semua', 'coffee', 'non-coffee', 'snack'];

  // Helper untuk display kategori dengan format readable
  const getCategoryDisplay = (cat: string) => {
    const displayMap: Record<string, string> = {
      'Semua': 'Semua',
      'coffee': 'Coffe',
      'non-coffee': 'Non-Coffe',
      'snack': 'Snack',
    };
    return displayMap[cat] || cat;
  };

  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/menu');
      setMenus(res.data);
    } catch (err) {
      console.error('Fetch menu error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Hapus Menu', `Yakin hapus "${name}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/menu/${id}`);
            fetchMenus();
          } catch (err) {
            Alert.alert('Error', 'Gagal menghapus menu');
          }
        },
      },
    ]);
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (/^(data:|blob:|https?:\/\/)/i.test(imagePath)) {
      return imagePath;
    }
    const clean = imagePath.replace(/^\/?public\/?/, '').replace(/^\/+/, '');
    return `${apiClient.defaults.baseURL}/public/${clean}`;
  };

  const filteredMenus = menus.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const renderItem = ({ item }: { item: MenuItem }) => {
    const catColors = categoryColors[item.category] || { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
    return (
      <View
        style={{
          backgroundColor: 'rgba(100, 116, 139, 0.05)',
          borderRadius: 6,
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', padding: 14, alignItems: 'center' }}>
          {/* Image */}
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={{
              width: 68,
              height: 68,
              borderRadius: 6,
              backgroundColor: '#f8fafc',
            }}
            resizeMode="cover"
          />

          {/* Content */}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a' }}>{item.name}</Text>
              <View
                style={{
                  backgroundColor: catColors.bg,
                  borderRadius: 2,
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  marginLeft: 8,
                }}
              >
                <Text style={{ fontSize: 8, fontWeight: '900', color: catColors.text, textTransform: 'uppercase' }}>
                  {getCategoryDisplay(item.category)}
                </Text>
              </View>
            </View>
            {item.description ? (
              <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }} numberOfLines={1}>
                {item.description}
              </Text>
            ) : null}
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#d97706' }}>
              Rp {item.price.toLocaleString('id-ID')}
            </Text>
          </View>

          {/* Action Icons */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (navigation as any).navigate('EditMenu', { menuId: item.id });
              }}
              style={{ padding: 2, marginRight: 2 }}
            >
              <Text style={{ fontSize: 18, color: 'rgba(100, 116, 139, 0.5)' }}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id, item.name)}
              style={{ padding: 6 }}
            >
              <Text style={{ fontSize: 18, color: 'rgba(100, 116, 139, 0.5)' }}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a', letterSpacing: -1 }}>
              Kelola Menu
            </Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '500' }}>
              {menus.length} item tersedia
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (navigation as any).navigate('AddMenu');
            }}
            style={{
              backgroundColor: '#d97706',
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#d97706',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12, marginRight: 4 }}>+</Text>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 11 }}>TAMBAH</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            paddingHorizontal: 14,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 14, color: '#94a3b8', marginRight: 8 }}>🔍</Text>
          <TextInput
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: '600',
              color: '#1e293b',
              padding: 0,
            }}
            placeholder="Cari menu..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const count = cat === 'Semua' ? menus.length : menus.filter((m) => m.category === cat).length;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setActiveCategory(cat)}
                style={{
                  backgroundColor: isActive ? '#0f172a' : '#fff',
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: isActive ? '#0f172a' : '#e2e8f0',
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  marginRight: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '800',
                    color: isActive ? '#fff' : '#64748b',
                  }}
                >
                  {getCategoryDisplay(cat)}
                </Text>
                <View
                  style={{
                    backgroundColor: isActive ? '#334155' : '#f1f5f9',
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                    marginLeft: 6,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '900', color: isActive ? '#fff' : '#94a3b8' }}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredMenus}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMenus} />}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              marginTop: 40,
              backgroundColor: '#fff',
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              padding: 32,
              marginHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: 12 }}>☕</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#94a3b8' }}>
              {search ? 'Tidak ada menu yang cocok' : 'Belum ada menu'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
