import { Colors } from '@/constants/themeStyle';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clearAllData, getData } from '../../services/api';

const DashboardCard = ({ title, value, icon, color, subValue, highlight, theme }) => (
  <View style={[styles.card, { backgroundColor: theme.card }]}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: color || theme.primary }]}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      {highlight && <Ionicons name="alert-circle" size={18} color={theme.error} />}
    </View>
    <View>
      <Text style={[styles.cardValue, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>{title}</Text>
      {subValue && <Text style={[styles.cardSub, { color: theme.error }]}>{subValue}</Text>}
    </View>
  </View>
);

const ActionButton = ({ title, icon, onPress, isDestructive, theme }) => (
  <TouchableOpacity 
    style={[
      styles.actionButton, 
      { backgroundColor: theme.card }, 
      isDestructive && { backgroundColor: theme.destructiveBg, borderColor: theme.destructiveBorder, borderWidth: 1 }
    ]} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View style={[
      styles.actionIconCtx, 
      { backgroundColor: isDestructive ? 'transparent' : theme.iconBg }
    ]}>
      <Ionicons name={icon} color={isDestructive ? theme.error : theme.primary} size={20} />
    </View>
    <Text style={[styles.actionText, { color: theme.text }, isDestructive && { color: theme.error }]}>{title}</Text>
    <Ionicons name="chevron-forward" color={theme.iconPlaceholder} size={20} />
  </TouchableOpacity>
);

export default function HomeTab({ navigation, setIsDarkMode, isDarkMode }) {
  const theme = {
    background: isDarkMode ? Colors.dark.background : Colors.light.background,
    card: isDarkMode ? Colors.dark.card : Colors.light.card, 
    text: isDarkMode ? Colors.dark.text : Colors.light.text,
    textSecondary: isDarkMode ? Colors.dark.secondary : Colors.light.secondary,
    primary: isDarkMode ? Colors.dark.primary : Colors.light.primary,
    secondary: isDarkMode ? Colors.dark.secondary : Colors.light.secondary,
    error: isDarkMode ? Colors.dark.error : Colors.light.error,
    
    iconBg: isDarkMode ? Colors.light.iconBg : Colors.dark.iconBg,
    iconPlaceholder: isDarkMode ? Colors.light.iconPlaceholder : Colors.dark.iconPlaceholder,
    destructiveBg: isDarkMode ? Colors.light.destructiveBg : Colors.dark.destructiveBg,
    destructiveBorder: isDarkMode ? Colors.light.destructiveBorder : Colors.dark.destructiveBorder,
    separator: isDarkMode ? Colors.light.separator : Colors.dark.separator,
  };

  // 1. Added enrollmentNumber to initial state
  const [userData, setUserData] = useState({ name: "Loading...", rollNo: "...", enrollmentNumber: "..." });
  const [attendanceSummary, setAttendanceSummary] = useState("0");

  useEffect(() => {
    const loadData = async () => {
        const basic = await getData('BASIC_DETAILS');
        const creds = await getData('USER_CREDENTIALS');
        const att = await getData('ATTENDANCE_DATA');

        if (basic) setUserData({ 
            name: basic.name || creds?.name || "Student", 
            rollNo: basic.rollNo || creds?.rollNo || "N/A",
            enrollmentNumber: basic.enrollmentNumber || "N/A"
        });
        
        if (att && typeof att === 'object') {
             // Calculate actual average if possible, or use logic based on your data structure
             // For now, keeping your hardcoded placeholder or logic
             setAttendanceSummary("75.5"); 
        }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
      await clearAllData();
      navigation.replace('Login');
  }

  const isAttendanceLow = Number(attendanceSummary) < 67;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.username, { color: theme.text }]}>{userData.name}</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.themeButton, { backgroundColor: theme.card }]} 
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
             <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color={isDarkMode ? "#FBBF24" : theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.heroCardContainer}>
            <DashboardCard 
              title="Attendance" 
              value={`${attendanceSummary}%`}
              subValue={isAttendanceLow ? "Below required 67%" : ""}
              icon="pie-chart"
              color={isAttendanceLow ? theme.error : Colors.light.success}
              highlight={isAttendanceLow}
              theme={theme}
            />
          </View>

          <View style={styles.secondaryStatsRow}>
            <View style={{flex: 1}}>
                <DashboardCard 
                  title="Enrollment No." 
                  value={userData.enrollmentNumber} 
                  icon="document-text" 
                  color={theme.secondary} 
                  theme={theme}
                />
            </View>
            <View style={{width: 12}} /> 
            <View style={{flex: 1}}>
                <DashboardCard 
                  title="Roll No." 
                  value={userData.rollNo} 
                  icon="id-card"
                  color={theme.primary} 
                  theme={theme}
                />
            </View>
          </View>
        </View>

        <Text style={[styles.sectionHeader, { color: theme.text }]}>Quick Actions</Text>
        <View style={[styles.actionContainer, { backgroundColor: theme.card }]}>
           <ActionButton 
            title="Detailed Attendance" 
            icon="bar-chart" 
            onPress={() => navigation.navigate("Attendance")} 
            theme={theme}
          />
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          <ActionButton 
            title="Personal Details" 
            icon="person" 
            onPress={() => navigation.navigate("Details")} 
            theme={theme}
          />
          <View style={[styles.separator, { backgroundColor: theme.separator }]} />
          <ActionButton 
            title="Faculty Details" 
            icon="people" 
            onPress={() => navigation.navigate("Faculty")} 
            theme={theme}
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <ActionButton 
            title="Logout" 
            icon="log-out" 
            onPress={handleLogout}
            isDestructive={true}
            theme={theme}
          />
        </View>
        
        {/* Footer section (implied) */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    greeting: { fontSize: 16, fontWeight: '500' },
    username: { fontSize: 26, fontWeight: '800' },
    themeButton: { width: 45, height: 45, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    statsGrid: { marginBottom: 25, gap: 12 },
    heroCardContainer: { width: '100%' },
    secondaryStatsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    card: { borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 4, minHeight: 110, justifyContent: 'space-between' },
    highlightCard: { borderWidth: 1, borderColor: 'rgba(255, 0, 0, 0.1)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    iconContainer: { padding: 8, borderRadius: 10 },
    cardValue: { fontSize: 24, fontWeight: 'bold' },
    cardTitle: { fontSize: 14, marginTop: 2 },
    cardSub: { fontSize: 12, marginTop: 4, fontWeight: '600' },
    sectionHeader: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
    actionContainer: { borderRadius: 16, padding: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, borderRadius: 12 },
    actionIconCtx: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    actionText: { flex: 1, fontSize: 15, fontWeight: '600' },
    separator: { height: 1, marginLeft: 60 },
    footer: { marginTop: 40, alignItems: 'center' },
    footerText: { fontSize: 13, fontWeight: '500' },
    footerSub: { fontSize: 12, marginTop: 4 },
});