import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { apiClient } from '../api/client';
import { useNavigation } from '@react-navigation/native';

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

type FilterType = 'daily' | 'weekly' | 'monthly';
type ReportType = 'transaction' | 'product' | 'profit' | 'customer' | null;

export default function ReportsScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>('daily');
  const [activeReport, setActiveReport] = useState<ReportType>(null);
  const navigation = useNavigation();

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

  const getFilteredOrders = () => {
    const today = new Date();
    let start = new Date(today);

    if (filterType === 'daily') {
      start = today;
    } else if (filterType === 'weekly') {
      start.setDate(today.getDate() - 7);
    } else if (filterType === 'monthly') {
      start.setMonth(today.getMonth() - 1);
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    return orders.filter((order) => {
      if (order.status !== 'completed') return false;
      const orderDate = order.createdAt.split('T')[0];
      return orderDate >= startStr && orderDate <= endStr;
    });
  };

  const filtered = getFilteredOrders();

  const IconTrendingUp = () => <Text style={{ fontSize: 20 }}>📈</Text>;
  const IconPackage = () => <Text style={{ fontSize: 20 }}>📦</Text>;
  const IconBarChart = () => <Text style={{ fontSize: 20 }}>📊</Text>;
  const IconUsers = () => <Text style={{ fontSize: 20 }}>👥</Text>;
  const IconFileText = () => <Text style={{ fontSize: 14 }}>📄</Text>;
  const IconArrowRight = () => <Text style={{ fontSize: 16 }}>→</Text>;

  const reportCards = [
    {
      key: 'transaction' as ReportType,
      title: 'Laporan Transaksi',
      description: 'Riwayat pesanan sukses sesuai filter tanggal yang dipilih.',
      icon: <IconTrendingUp />,
      color: 'amber',
    },
    {
      key: 'product' as ReportType,
      title: 'Laporan Produk',
      description: 'Statistik produk terjual dan performa item menu.',
      icon: <IconPackage />,
      color: 'blue',
    },
    {
      key: 'profit' as ReportType,
      title: 'Laporan Profitabilitas & Omzet',
      description: 'Laporan finansial mengenai pendapatan kotor dan rata-rata pesanan.',
      icon: <IconBarChart />,
      color: 'purple',
    },
    {
      key: 'customer' as ReportType,
      title: 'Laporan Retensi Pelanggan',
      description: 'Data statistik kunjungan dan loyalitas pelanggan.',
      icon: <IconUsers />,
      color: 'emerald',
    },
  ];

  const colorMap: Record<string, { text: string; bg: string; border: string }> = {
    amber: { text: '#d97706', bg: '#fffbeb', border: '#fde68a' },
    blue: { text: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    purple: { text: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    emerald: { text: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  };

  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  filtered.forEach((order) => {
    order.items.forEach((item) => {
      if (!productMap[item.name]) {
        productMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      }
      productMap[item.name].qty += item.qty;
      productMap[item.name].revenue += item.price * item.qty;
    });
  });
  const productData = Object.values(productMap).sort((a, b) => b.qty - a.qty);

  const customerMap: Record<string, { name: string; visits: number; spend: number }> = {};
  filtered.forEach((o) => {
    const name = (o.customerName || 'Umum').toUpperCase();
    if (!customerMap[name]) {
      customerMap[name] = { name, visits: 0, spend: 0 };
    }
    customerMap[name].visits += 1;
    customerMap[name].spend += Number(o.total);
  });
  const customerData = Object.values(customerMap).sort((a, b) => b.spend - a.spend);

  const totalRev = filtered.reduce((a, b) => a + Number(b.total), 0);
  const avgTrans = filtered.length > 0 ? totalRev / filtered.length : 0;

  const getPeriodText = () => {
    const today = new Date();
    let start = new Date(today);
    if (filterType === 'daily') start = today;
    else if (filterType === 'weekly') start.setDate(today.getDate() - 7);
    else if (filterType === 'monthly') start.setMonth(today.getMonth() - 1);
    return `${start.toISOString().split('T')[0]} s/d ${today.toISOString().split('T')[0]}`;
  };

  const handleExportPdf = (type: ReportType) => {
    if (!type) return;
    const period = getPeriodText();
    let pdfData: any = {};
    if (type === 'transaction') pdfData = { orders: filtered };
    if (type === 'product') pdfData = { products: productData };
    if (type === 'profit') pdfData = { summary: { transactions: filtered.length, revenue: totalRev, avg: avgTrans } };
    if (type === 'customer') pdfData = { customers: customerData };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigation as any).navigate('ReportPdf', {
      title: reportCards.find((c) => c.key === type)?.title || 'Laporan',
      type,
      data: pdfData,
      period,
    });
  };

  const renderReportDetail = () => {
    if (!activeReport) return null;

    if (activeReport === 'transaction') {
      return (
        <View style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>
              Detail Laporan Transaksi
            </Text>
            <TouchableOpacity
              onPress={() => handleExportPdf('transaction')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#0f172a',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff', marginRight: 4 }}>📄</Text>
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Export PDF</Text>
            </TouchableOpacity>
          </View>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#94a3b8' }}>Tidak ada data transaksi</Text>
            </View>
          ) : (
            filtered.map((o) => (
              <View key={o.id} style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', padding: 12, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 11, fontWeight: '900', color: '#94a3b8' }}>ID #{o.id}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#d97706' }}>Rp {Number(o.total).toLocaleString('id-ID')}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#1e293b', marginTop: 4 }}>{o.customerName || 'Pelanggan'}</Text>
                <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{new Date(o.createdAt).toLocaleDateString('id-ID')}</Text>
              </View>
            ))
          )}
        </View>
      );
    }

    if (activeReport === 'product') {
      return (
        <View style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>
              Detail Laporan Produk
            </Text>
            <TouchableOpacity
              onPress={() => handleExportPdf('product')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#d97706',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff', marginRight: 4 }}>📄</Text>
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Export PDF</Text>
            </TouchableOpacity>
          </View>
          {productData.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#94a3b8' }}>Tidak ada data produk</Text>
            </View>
          ) : (
            productData.map((p, i) => (
              <View key={i} style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#2563eb', marginRight: 12 }}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>{p.name.toUpperCase()}</Text>
                  <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{p.qty} Unit terjual</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b' }}>Rp {p.revenue.toLocaleString('id-ID')}</Text>
              </View>
            ))
          )}
        </View>
      );
    }

    if (activeReport === 'profit') {
      return (
        <View style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>
              Detail Laporan Profitabilitas
            </Text>
            <TouchableOpacity
              onPress={() => handleExportPdf('profit')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#7c3aed',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff', marginRight: 4 }}>📄</Text>
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Export PDF</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b' }}>Total Volume Transaksi</Text>
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#1e293b' }}>{filtered.length} Pesanan</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b' }}>Total Omzet Kotor</Text>
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#1e293b' }}>Rp {totalRev.toLocaleString('id-ID')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b' }}>Rata-rata Keranjang</Text>
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#1e293b' }}>Rp {Math.round(avgTrans).toLocaleString('id-ID')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#64748b' }}>Status Laporan</Text>
              <Text style={{ fontSize: 12, fontWeight: '900', color: '#16a34a' }}>Valid / Terverifikasi</Text>
            </View>
          </View>
        </View>
      );
    }

    if (activeReport === 'customer') {
      return (
        <View style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#1e293b' }}>
              Detail Laporan Retensi Pelanggan
            </Text>
            <TouchableOpacity
              onPress={() => handleExportPdf('customer')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#059669',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff', marginRight: 4 }}>📄</Text>
              <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Export PDF</Text>
            </TouchableOpacity>
          </View>
          {customerData.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#94a3b8' }}>Tidak ada data pelanggan</Text>
            </View>
          ) : (
            customerData.map((c, i) => (
              <View key={i} style={{ backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0', padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#059669', marginRight: 12 }}>#{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>{c.name}</Text>
                  <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{c.visits} kali kunjungan</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#64748b' }}>Rp {c.spend.toLocaleString('id-ID')}</Text>
              </View>
            ))
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fafafa' }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
    >
      <View style={{ padding: 20, paddingTop: 48 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a', letterSpacing: -1 }}>
            Pusat Laporan
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4, fontWeight: '600', fontStyle: 'italic', letterSpacing: 2, textTransform: 'uppercase' }}>
            Manajemen Laporan
          </Text>
        </View>

        {/* Filter Tabs */}
        <View
          style={{
            backgroundColor: '#f1f5f9',
            borderRadius: 6,
            padding: 4,
            flexDirection: 'row',
            marginBottom: 16,
          }}
        >
          {(['daily', 'weekly', 'monthly'] as FilterType[]).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => {
                setFilterType(f);
                setActiveReport(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 4,
                backgroundColor: filterType === f ? '#fff' : 'transparent',
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '900',
                  textAlign: 'center',
                  color: filterType === f ? '#0f172a' : '#94a3b8',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                {f === 'daily' ? 'Harian' : f === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Report Cards Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 }}>
          {reportCards.map((card) => {
            const colors = colorMap[card.color];
            const isActive = activeReport === card.key;
            return (
              <TouchableOpacity
                key={card.key}
                onPress={() => setActiveReport(isActive ? null : card.key)}
                style={{
                  width: '50%',
                  paddingHorizontal: 4,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: isActive ? '#94a3b8' : '#e2e8f0',
                    padding: 14,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: colors.border,
                        backgroundColor: colors.bg,
                      }}
                    >
                      {card.icon}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#f1f5f9',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 4,
                      }}
                    >
                      <IconFileText />
                      <Text style={{ fontSize: 9, fontWeight: '900', color: '#0f172a', marginLeft: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
                        {isActive ? 'Tutup' : 'Detail'}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', marginBottom: 6 }}>
                    {card.title}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748b', lineHeight: 16, marginBottom: 10 }}>
                    {card.description}
                  </Text>

                  {/* Export PDF mini button */}
                  <TouchableOpacity
                    onPress={() => handleExportPdf(card.key)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isActive ? '#0f172a' : '#f8fafc',
                      paddingVertical: 8,
                      borderRadius: 4,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: '900', color: isActive ? '#fff' : '#64748b', marginRight: 4 }}>📄</Text>
                    <Text style={{ fontSize: 9, fontWeight: '900', color: isActive ? '#fff' : '#64748b', textTransform: 'uppercase' }}>
                      Export PDF
                    </Text>
                  </TouchableOpacity>

                  <View style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f8fafc', flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <Text style={{ fontSize: 14, color: isActive ? '#d97706' : '#cbd5e1' }}>
                      <IconArrowRight />
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Active Report Detail */}
        {renderReportDetail()}
      </View>
    </ScrollView>
  );
}
