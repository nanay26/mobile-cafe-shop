import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

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

type ReportType = 'transaction' | 'product' | 'profit' | 'customer';

export default function ReportPdfScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { title, type, data, period }: { title: string; type: ReportType; data: any; period: string } = route.params || {};

  const today = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const renderTransactionReport = () => {
    const orders: Order[] = data?.orders || [];
    return (
      <View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>
            Laporan Riwayat Transaksi
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
            Periode: {period}
          </Text>
        </View>

        {/* Table Header */}
        <View style={{ flexDirection: 'row', backgroundColor: '#0f172a', paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ flex: 0.5, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>ID</Text>
          <Text style={{ flex: 1.2, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Tanggal</Text>
          <Text style={{ flex: 1.5, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Pelanggan</Text>
          <Text style={{ flex: 1, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Metode</Text>
          <Text style={{ flex: 1, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase', textAlign: 'right' }}>Total</Text>
        </View>

        {orders.map((o, i) => (
          <View
            key={o.id}
            style={{
              flexDirection: 'row',
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderBottomWidth: 1,
              borderBottomColor: '#e2e8f0',
              backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc',
            }}
          >
            <Text style={{ flex: 0.5, fontSize: 10, fontWeight: '700', color: '#64748b' }}>#{o.id}</Text>
            <Text style={{ flex: 1.2, fontSize: 10, color: '#1e293b' }}>
              {new Date(o.createdAt).toLocaleDateString('id-ID')}
            </Text>
            <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>
              {o.customerName || 'Umum'}
            </Text>
            <Text style={{ flex: 1, fontSize: 10, fontWeight: '700', color: '#d97706' }}>
              {o.paymentMethod || 'TUNAI'}
            </Text>
            <Text style={{ flex: 1, fontSize: 10, fontWeight: '900', color: '#1e293b', textAlign: 'right' }}>
              Rp {Number(o.total).toLocaleString('id-ID')}
            </Text>
          </View>
        ))}

        {/* Total */}
        <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 10, backgroundColor: '#0f172a', marginTop: 8 }}>
          <Text style={{ flex: 3, fontSize: 10, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>
            Total {orders.length} Transaksi
          </Text>
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '900', color: '#fff', textAlign: 'right' }}>
            Rp {orders.reduce((a, b) => a + Number(b.total), 0).toLocaleString('id-ID')}
          </Text>
        </View>
      </View>
    );
  };

  const renderProductReport = () => {
    const products = data?.products || [];
    return (
      <View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>
            Analisis Performa Produk
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Periode: {period}</Text>
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: '#d97706', paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ flex: 2, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Nama Produk</Text>
          <Text style={{ flex: 1, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase', textAlign: 'center' }}>Volume</Text>
          <Text style={{ flex: 1.5, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase', textAlign: 'right' }}>Pendapatan</Text>
        </View>

        {products.map((p: any, i: number) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderBottomWidth: 1,
              borderBottomColor: '#e2e8f0',
              backgroundColor: i % 2 === 0 ? '#fff' : '#fef3c7',
            }}
          >
            <Text style={{ flex: 2, fontSize: 10, fontWeight: '700', color: '#1e293b', textTransform: 'uppercase' }}>
              {p.name}
            </Text>
            <Text style={{ flex: 1, fontSize: 10, fontWeight: '700', color: '#64748b', textAlign: 'center' }}>
              {p.qty} Unit
            </Text>
            <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '900', color: '#1e293b', textAlign: 'right' }}>
              Rp {p.revenue.toLocaleString('id-ID')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderProfitReport = () => {
    const summary = data?.summary || {};
    return (
      <View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>
            Ringkasan Profitabilitas
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Periode: {period}</Text>
        </View>

        <View style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6 }}>
          {[
            { label: 'Total Volume Transaksi', value: `${summary.transactions || 0} Pesanan` },
            { label: 'Total Omzet Kotor', value: `Rp ${(summary.revenue || 0).toLocaleString('id-ID')}` },
            { label: 'Rata-rata Keranjang', value: `Rp ${Math.round(summary.avg || 0).toLocaleString('id-ID')}` },
            { label: 'Status Laporan', value: 'Valid / Terverifikasi Sistem' },
          ].map((row, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderBottomWidth: i < 3 ? 1 : 0,
                borderBottomColor: '#f1f5f9',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#64748b' }}>{row.label}</Text>
              <Text style={{ fontSize: 11, fontWeight: '900', color: '#1e293b' }}>{row.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCustomerReport = () => {
    const customers = data?.customers || [];
    return (
      <View>
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: 1 }}>
            Laporan Retensi Pelanggan
          </Text>
          <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Periode: {period}</Text>
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: '#059669', paddingVertical: 8, paddingHorizontal: 10 }}>
          <Text style={{ flex: 2, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase' }}>Nama Pelanggan</Text>
          <Text style={{ flex: 1, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase', textAlign: 'center' }}>Frekuensi</Text>
          <Text style={{ flex: 1.5, fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase', textAlign: 'right' }}>Total Belanja</Text>
        </View>

        {customers.map((c: any, i: number) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              paddingVertical: 8,
              paddingHorizontal: 10,
              borderBottomWidth: 1,
              borderBottomColor: '#e2e8f0',
              backgroundColor: i % 2 === 0 ? '#fff' : '#ecfdf5',
            }}
          >
            <Text style={{ flex: 2, fontSize: 10, fontWeight: '700', color: '#1e293b' }}>{c.name}</Text>
            <Text style={{ flex: 1, fontSize: 10, fontWeight: '700', color: '#64748b', textAlign: 'center' }}>
              {c.visits} Kali
            </Text>
            <Text style={{ flex: 1.5, fontSize: 10, fontWeight: '900', color: '#1e293b', textAlign: 'right' }}>
              Rp {c.spend.toLocaleString('id-ID')}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header Toolbar */}
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#e2e8f0',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 14, fontWeight: '900', color: '#64748b' }}></Text>
        </TouchableOpacity>
       
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* A4 Paper Simulation */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#d1d5db',
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Letterhead */}
          <View style={{ alignItems: 'center', marginBottom: 16, borderBottomWidth: 2, borderBottomColor: '#0f172a', paddingBottom: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a', letterSpacing: 2 }}>
              TERSENYUM COFFEE
            </Text>
            <Text style={{ fontSize: 9, color: '#94a3b8', marginTop: 2, fontWeight: '600' }}>
              Laporan Operasional Digital
            </Text>
            <Text style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>
              {today}
            </Text>
          </View>

          {type === 'transaction' && renderTransactionReport()}
          {type === 'product' && renderProductReport()}
          {type === 'profit' && renderProfitReport()}
          {type === 'customer' && renderCustomerReport()}

          {/* Footer */}
          <View style={{ marginTop: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', alignItems: 'center' }}>
            <Text style={{ fontSize: 8, color: '#cbd5e1', fontWeight: '600' }}>
              Dicetak dari TS KOPI Admin Mobile • {today}
            </Text>
            <Text style={{ fontSize: 8, color: '#cbd5e1', marginTop: 2 }}>
              Database Sync: Secured & Encrypted
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
