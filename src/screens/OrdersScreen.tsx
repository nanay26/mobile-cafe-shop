import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../api/client';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  variant: string;
  note?: string;
}

interface Order {
  id: number;
  customerName: string | null;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling 10 detik, hanya saat screen aktif — berhenti saat pindah tab
  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }, [fetchOrders]),
  );

  const handleConfirmPayment = async (paymentMethod: string) => {
    if (!selectedOrder) return;
    try {
      setLoading(true);
      // Update status ke /api/orders/{id}/status endpoint
      const response = await apiClient.patch(`/api/orders/${selectedOrder.id}/status`, { 
        status: 'completed',
        paymentMethod 
      });
      console.log('Payment confirmation response:', response.data);
      setShowModal(false);
      setSelectedOrder(null);
      fetchOrders();
      Alert.alert('Sukses', `Pembayaran ${paymentMethod} dikonfirmasi. Order pindah ke Riwayat.`);
    } catch (err) {
      console.error('Confirm payment error:', err);
      const error = err as any;
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert('Error', `Gagal konfirmasi pembayaran: ${error.response?.status || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = (id: number) => {
    Alert.alert('Hapus Pesanan', `Yakin hapus order #${id}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/orders/${id}`);
            fetchOrders();
          } catch {
            Alert.alert('Error', 'Gagal menghapus pesanan');
          }
        },
      },
    ]);
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  // HANYA tampilkan yang pending (sama seperti web)
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const renderItem = ({ item }: { item: Order }) => (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* Header Card */}
      <View
        style={{
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          backgroundColor: '#fafafa',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#eff6ff',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Text style={{ fontSize: 14 }}>👤</Text>
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#2563eb', textTransform: 'uppercase' }}>
                {item.customerName || 'Pelanggan'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <Text style={{ fontSize: 10, color: '#94a3b8', marginRight: 4 }}>🕐</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8' }}>{formatTime(item.createdAt)}</Text>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: '#fef3c7',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#fde68a',
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#d97706' }}>Pending</Text>
            </View>
            <TouchableOpacity onPress={() => deleteOrder(item.id)}>
              <Text style={{ fontSize: 14, color: '#94a3b8' }}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#64748b' }}>ID: #{item.id}</Text>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#0f172a' }}>
            Rp {Number(item.total || 0).toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      {/* Items */}
      <View style={{ padding: 14 }}>
        {item.items && item.items.length > 0 ? (
          item.items.map((it, idx) => (
            <View
              key={idx}
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: 8,
                padding: 10,
                marginBottom: 6,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e293b' }}>{it.name}</Text>
                  <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{it.variant || 'Regular'}</Text>
                  {it.note && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#fffbeb',
                        borderRadius: 4,
                        borderWidth: 1,
                        borderColor: '#fde68a',
                        padding: 4,
                        marginTop: 4,
                      }}
                    >
                      <Text style={{ fontSize: 9, color: '#d97706', fontStyle: 'italic' }}>💬 {it.note}</Text>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>x{it.qty || 0}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#1e293b' }}>
                  Rp {((it.price || 0) * (it.qty || 0)).toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 11, textAlign: 'center', color: '#94a3b8' }}>Data item kosong</Text>
        )}

        {/* Total & Bayar Button */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
          }}
        >
          <View>
            <Text style={{ fontSize: 10, color: '#94a3b8' }}>Waktu Pesan</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>{formatTime(item.createdAt)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>Total Transaksi</Text>
            <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 8 }}>
              Rp {Number(item.total || 0).toLocaleString('id-ID')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedOrder(item);
                setShowModal(true);
              }}
              style={{
                backgroundColor: '#d97706',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#d97706',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', marginRight: 4 }}>✓</Text>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>Konfirmasi Pembayaran</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 48, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0f172a', letterSpacing: -1 }}>
              Pesanan Masuk
            </Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '500' }}>
              Konfirmasi pembayaran untuk memproses pesanan
            </Text>
          </View>
          <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#fde68a' }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#b45309' }}>{pendingOrders.length} Pending</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={pendingOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
        ListEmptyComponent={
          <View
            style={{
              alignItems: 'center',
              marginTop: 60,
              backgroundColor: '#fff',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#e2e8f0',
              padding: 32,
              marginHorizontal: 20,
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📦</Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#94a3b8' }}>Belum ada pesanan</Text>
            <Text style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>Pesanan dari pelanggan akan muncul di sini</Text>
          </View>
        }
      />

      {/* Modal Konfirmasi Pembayaran */}
      <Modal
        animationType="slide"
        transparent
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>Opsi Pembayaran</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ fontSize: 20, color: '#94a3b8' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => handleConfirmPayment('Tunai')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 12 }}>💵</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>Tunai / Cash</Text>
                <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Pembayaran dengan uang tunai</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleConfirmPayment('Non-Tunai')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 12 }}>💳</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }}>Non-Tunai / QRIS</Text>
                <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Transfer, E-wallet, atau QRIS</Text>
              </View>
            </TouchableOpacity>

            <View style={{ backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>
                ID: #{selectedOrder?.id} • Total: Rp {Number(selectedOrder?.total || 0).toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
