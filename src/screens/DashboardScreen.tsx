import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { apiClient } from '../api/client';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueGrowth: number;
  orderGrowth: number;
  efficiency: number;
  weeklySales: { date: string; total: number }[];
  topMenus: { label: string; sales: number; percentage: number }[];
}

export default function DashboardScreen() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState<'weekly' | 'monthly'>('weekly');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/orders/analytics');
      setData(res.data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const StatCard = ({
    label,
    value,
    growth,
    icon,
    color,
  }: {
    label: string;
    value: string;
    growth?: number;
    icon: string;
    color: string;
  }) => (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 6,
        padding: 16,
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <Text style={{ fontSize: 24, opacity: 0.6 }}>{icon}</Text>
        {growth !== undefined && (
          <View
            style={{
              backgroundColor: growth >= 0 ? '#dcfce7' : '#fef2f2',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: '900',
                color: growth >= 0 ? '#16a34a' : '#dc2626',
              }}
            >
              {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '700', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>{value}</Text>
    </View>
  );

  const weeklyData = data?.weeklySales || [];
  const maxWeekly = Math.max(...weeklyData.map((d) => d.total), 1);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAnalytics} />}
    >
      <View style={{ padding: 20, paddingTop: 48 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#0f172a', letterSpacing: -1 }}>Statistik</Text>
            <Text style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, fontWeight: '500' }}>Monitoring statistik secara real-time.</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: '#fff',
              borderRadius: 6,
              borderWidth: 1,
              borderColor: '#e2e8f0',
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' }} />
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
              Live
            </Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>
              {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {/* Stat Cards */}
        <View style={{ flexDirection: 'row', marginHorizontal: -4, marginBottom: 12 }}>
          <StatCard
            label="Revenue"
            value={`Rp ${(data?.totalRevenue || 0).toLocaleString('id-ID')}`}
            growth={data?.revenueGrowth}
            icon="�"
            color="#fef3c7"
          />
          <StatCard
            label="Orders"
            value={`${data?.totalOrders || 0}`}
            growth={data?.orderGrowth}
            icon="🧾"
            color="#dbeafe"
          />
        </View>

        <View style={{ flexDirection: 'row', marginHorizontal: -4, marginBottom: 20 }}>
          <StatCard
            label="Average"
            value={`Rp ${Math.round(data?.averageOrderValue || 0).toLocaleString('id-ID')}`}
            icon="📊"
            color="#f5f3ff"
          />
          <StatCard
            label="Efficiency"
            value={`${data?.efficiency || 0}%`}
            icon="🎯"
            color="#ecfdf5"
          />
        </View>

        {/* Chart Section */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>Tren Pendapatan</Text>
              <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                {chartFilter === 'weekly' ? '7 hari terakhir' : 'Tahun berjalan'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 6, padding: 3 }}>
              {(['weekly', 'monthly'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setChartFilter(f)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 4,
                    backgroundColor: chartFilter === f ? '#fff' : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: 'bold',
                      color: chartFilter === f ? '#0f172a' : '#94a3b8',
                    }}
                  >
                    {f === 'weekly' ? 'Minggu' : 'Bulan'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bar Chart */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140, paddingTop: 10 }}>
            {weeklyData.length > 0 ? (
              weeklyData.map((d, i) => {
                const heightPercent = (d.total / maxWeekly) * 100;
                const dayLabel = new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' });
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#64748b', marginBottom: 4 }}>
                      Rp {(d.total / 1000).toFixed(0)}k
                    </Text>
                    <View
                      style={{
                        width: 24,
                        height: `${Math.max(heightPercent, 5)}%`,
                        backgroundColor: '#0f172a',
                        borderRadius: 4,
                        minHeight: 4,
                      }}
                    />
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8', marginTop: 6 }}>{dayLabel}</Text>
                  </View>
                );
              })
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 11, color: '#94a3b8' }}>Belum ada data</Text>
              </View>
            )}
          </View>
        </View>

        {/* Best Sellers */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#e2e8f0',
            padding: 16,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0f172a' }}>Best Selling</Text>
            <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Top performa menu berdasarkan unit.</Text>
          </View>

          {(data?.topMenus || []).slice(0, 5).map((menu, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>{menu.label}</Text>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
                    {menu.sales} Units
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: '#f1f5f9',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '900', color: '#0f172a' }}>
                    {Math.round(menu.percentage || 0)}%
                  </Text>
                </View>
              </View>
              <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                <View
                  style={{
                    height: 6,
                    backgroundColor: '#0f172a',
                    borderRadius: 3,
                    width: `${Math.min(menu.percentage || 0, 100)}%`,
                  }}
                />
              </View>
            </View>
          ))}

          {(data?.topMenus || []).length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Text style={{ fontSize: 11, color: '#94a3b8' }}>Belum ada data penjualan</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Text style={{ fontSize: 9, fontWeight: '900', color: '#cbd5e1', letterSpacing: 3, textTransform: 'uppercase' }}>
            Database Sync: Secured & Encrypted
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
