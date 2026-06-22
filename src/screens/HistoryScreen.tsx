import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
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
  paymentMethod?: string;
  items: OrderItem[];
}

export default function HistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(filterDate + 'T00:00:00'));

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

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const historyOrders = orders
    .filter((o) => o.status === 'completed')
    .filter((o) => (filterDate ? o.createdAt.startsWith(filterDate) : true))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
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

  const handleDatePicker = async () => {
    // Show modal with custom calendar
    setShowDatePicker(true);
  };

  const handleConfirmDate = () => {
    const dateString = tempDate.toISOString().split('T')[0];
    setFilterDate(dateString);
    setShowDatePicker(false);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderItem = ({ item }: { item: Order }) => {
    const isExpanded = expandedId === item.id;
    return (
      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: 12,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: '#e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Card Header — selalu terlihat */}
        <TouchableOpacity onPress={() => toggleExpand(item.id)} activeOpacity={0.8}>
          <View style={{ padding: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      backgroundColor: '#dcfce7',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>✓</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#0f172a', textTransform: 'uppercase' }}>
                      {item.customerName || 'Customer'}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>
                      ID #{item.id} • {formatDate(item.createdAt)} {formatTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View
                  style={{
                    backgroundColor: '#dcfce7',
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#bbf7d0',
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ fontSize: 9, fontWeight: '900', color: '#16a34a' }}>SELESAI</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#0f172a' }}>
                  Rp {Number(item.total).toLocaleString('id-ID')}
                </Text>
              </View>
            </View>

            {/* Metode Bayar badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '900',
                  color: '#b45309',
                  textTransform: 'uppercase',
                  backgroundColor: '#fffbeb',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: '#fde68a',
                }}
              >
                {item.paymentMethod || 'Tunai / Cash'}
              </Text>
              <Text style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>
                {isExpanded ? '▲ Tutup Detail' : '▼ Lihat Detail'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Detail */}
        {isExpanded && (
          <View
            style={{
              paddingHorizontal: 14,
              paddingBottom: 14,
              borderTopWidth: 1,
              borderTopColor: '#f1f5f9',
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginTop: 10, marginBottom: 8 }}>
              Detail Items
            </Text>
            {item.items.map((it, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 6,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e293b' }}>{it.name}</Text>
                    <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{it.variant || 'Regular'}</Text>
                    {it.note && (
                      <Text style={{ fontSize: 9, color: '#d97706', fontStyle: 'italic', marginTop: 2 }}>💬 {it.note}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>x{it.qty}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#1e293b', marginTop: 2 }}>
                      Rp {((it.price || 0) * (it.qty || 0)).toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Subtotal breakdown */}
            <View
              style={{
                marginTop: 8,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: '#f1f5f9',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>Subtotal Items</Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>
                  {item.items.reduce((sum, it) => sum + it.qty, 0)} item
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#0f172a' }}>TOTAL</Text>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#0f172a' }}>
                  Rp {Number(item.total).toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
      >
        <View style={{ padding: 20, paddingTop: 48 }}>
          {/* Header */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a', letterSpacing: -1 }}>Riwayat</Text>
            <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: '600', fontStyle: 'italic', letterSpacing: 2, textTransform: 'uppercase' }}>
              Log Transaksi Selesai — {filterDate === new Date().toISOString().split('T')[0] ? 'Hari Ini' : 'Arsip'}
            </Text>
          </View>

          {/* Filter Tanggal */}
          <View style={{ marginBottom: 16 }}>
            <View
              style={{
                borderBottomWidth: 2,
                borderBottomColor: '#e2e8f0',
                paddingBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#1e293b',
                  padding: 0,
                  letterSpacing: -0.5,
                }}
                value={filterDate}
                onChangeText={setFilterDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity onPress={handleDatePicker} style={{ marginLeft: 12 }}>
                <Text style={{ fontSize: 18 }}>📅</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* List Order */}
          <FlatList
            data={historyOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            scrollEnabled={false}
            ListEmptyComponent={
              <View
                style={{
                  paddingVertical: 80,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: '#e2e8f0',
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#cbd5e1', letterSpacing: 3, textTransform: 'uppercase' }}>
                  Tidak ada pesanan untuk tanggal ini
                </Text>
              </View>
            }
          />

          {/* Footer Brand */}
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <Text style={{ fontSize: 9, fontWeight: '900', color: '#e2e8f0', letterSpacing: 4, textTransform: 'uppercase' }}>
              Tersenyum Coffee
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 30,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>Pilih Tanggal</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={{ fontSize: 20, color: '#94a3b8' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Month/Year Navigation */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  const prev = new Date(tempDate);
                  prev.setMonth(prev.getMonth() - 1);
                  setTempDate(prev);
                }}
              >
                <Text style={{ fontSize: 18 }}>◀</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e293b' }}>
                {tempDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const next = new Date(tempDate);
                  next.setMonth(next.getMonth() + 1);
                  setTempDate(next);
                }}
              >
                <Text style={{ fontSize: 18 }}>▶</Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={{ marginBottom: 20 }}>
              {/* Day headers */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 }}>
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                  <Text
                    key={day}
                    style={{
                      fontSize: 10,
                      fontWeight: '800',
                      color: '#94a3b8',
                      width: '14.28%',
                      textAlign: 'center',
                    }}
                  >
                    {day}
                  </Text>
                ))}
              </View>

              {/* Days grid */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {Array.from({ length: 42 }, (_, i) => {
                  const firstDay = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
                  const startDate = new Date(firstDay);
                  startDate.setDate(startDate.getDate() - firstDay.getDay());

                  const currentDate = new Date(startDate);
                  currentDate.setDate(currentDate.getDate() + i);

                  const isCurrentMonth = currentDate.getMonth() === tempDate.getMonth();
                  const isSelected =
                    currentDate.toISOString().split('T')[0] === filterDate;

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        setTempDate(currentDate);
                      }}
                      style={{
                        width: '14.28%',
                        aspectRatio: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isSelected
                          ? '#d97706'
                          : isCurrentMonth
                          ? '#fff'
                          : '#f8fafc',
                        borderRadius: 6,
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: isSelected
                            ? '#fff'
                            : isCurrentMonth
                            ? '#1e293b'
                            : '#cbd5e1',
                        }}
                      >
                        {currentDate.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b' }}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDate}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: '#d97706',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>Pilih</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
