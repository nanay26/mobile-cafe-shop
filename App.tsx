import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import MenuListScreen from './src/screens/MenuListScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import ChatScreen from './src/screens/ChatScreen';
import AddMenuScreen from './src/screens/AddMenuScreen';
import EditMenuScreen from './src/screens/EditMenuScreen';
import ReportPdfScreen from './src/screens/ReportPdfScreen';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function getTabIcon(routeName: string, focused: boolean) {
  const iconMap: Record<string, [string, string]> = {
    Menu: ['cafe', 'cafe-outline'],
    Analytics: ['stats-chart', 'stats-chart-outline'],
    Orders: ['receipt', 'receipt-outline'],
    History: ['time', 'time-outline'],
    Reports: ['bar-chart', 'bar-chart-outline'],
    Chat: ['chatbubble-ellipses', 'chatbubble-ellipses-outline'],
  };
  const [active, inactive] = iconMap[routeName] || ['ellipse', 'ellipse-outline'];
  return focused ? active : inactive;
}

function AdminTabs() {
  return (
    <Tab.Navigator
      id="AdminTabs"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIcon(route.name, focused) as any;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#d97706',
        tabBarInactiveTintColor: '#94a3b8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Menu" component={MenuListScreen} />
      <Tab.Screen name="Analytics" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator id="AdminStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="AddMenu" component={AddMenuScreen} />
      <Stack.Screen name="EditMenu" component={EditMenuScreen} />
      <Stack.Screen name="ReportPdf" component={ReportPdfScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator id="Root" screenOptions={{ headerShown: false }}>
      {!isAdmin ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Admin" component={AdminStack} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
