import { Colors } from '@/constants/themeStyle';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getData } from '../../services/api';

// Component for a Single Faculty Member Card
const FacultyCard = ({ data, theme }) => (
    <View style={[styles.facultyCard, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
        <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.iconBg }]}>
                <Ionicons name="person" size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.facultyName, { color: theme.text }]}>{data.Teacher || data.Name || "Unknown Faculty"}</Text>
                <Text style={[styles.facultyDept, { color: theme.textSecondary }]}>{data.Department || "Department N/A"}</Text>
            </View>
        </View>
        
        <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />
        
        <View style={styles.cardBody}>
            <View style={styles.infoRow}>
                <Ionicons name="book" size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.infoText, { color: theme.text }]}>{data.Subject || "Subject N/A"}</Text>
            </View>
            {data.Email && (
                <View style={[styles.infoRow, { marginTop: 8 }]}>
                    <Ionicons name="mail" size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
                    <Text style={[styles.infoText, { color: theme.text }]}>{data.Email}</Text>
                </View>
            )}
        </View>
    </View>
);

export default function FacultyTab({ navigation, isDarkMode, setIsDarkMode }) {
    
    const theme = {
        background: isDarkMode ? Colors.dark.background : Colors.light.background,
        card: isDarkMode ? '#1A2235' : '#FFFFFF',
        text: isDarkMode ? Colors.dark.text : Colors.light.text,
        textSecondary: isDarkMode ? Colors.dark.secondary : Colors.light.secondary,
        primary: isDarkMode ? Colors.dark.primary : Colors.light.primary,
        iconBg: isDarkMode ? '#252F45' : '#F0F4FF',
        borderColor: isDarkMode ? '#2E3A52' : '#F1F5F9',
    };

    const [facultyList, setFacultyList] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Faculty Data
    useEffect(() => {
        const loadData = async () => {
            const data = await getData('FACULTY_DATA');
            // Assuming data is an array: [{Teacher: "Name", Subject: "Sub", ...}, ...]
            if (data && Array.isArray(data)) {
                setFacultyList(data);
            } else if (data && typeof data === 'object') {
                // Handle case where it might be wrapped inside another object
                setFacultyList([data]); 
            }
            setLoading(false);
        };
        loadData();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />

            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => (navigation && navigation.goBack ? navigation.goBack() : console.log('Back'))}>
                    <Ionicons name="caret-back" size={27} color={theme.primary} />
                </TouchableOpacity>
                
                <Text style={[styles.headerTitle, { color: theme.text }]}>FACULTY DETAILS</Text>
                
                <TouchableOpacity 
                    style={[styles.themeButton, { backgroundColor: theme.card }]} 
                    onPress={() => setIsDarkMode(!isDarkMode)}
                >
                        <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color={isDarkMode ? "#FBBF24" : theme.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
            ) : facultyList.length === 0 ? (
                 <View style={styles.centerContainer}>
                    <Ionicons name="people-outline" size={48} color={theme.textSecondary} style={{ marginBottom: 10, opacity: 0.5 }} />
                    <Text style={{ color: theme.textSecondary }}>No faculty details uploaded.</Text>
                </View>
            ) : (
                <FlatList 
                    data={facultyList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => <FacultyCard data={item} theme={theme} />}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    themeButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    
    // Faculty Card Styles
    facultyCard: { borderWidth: 1, borderRadius: 16, marginBottom: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    facultyName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    facultyDept: { fontSize: 13, fontWeight: '500' },
    divider: { height: 1, width: '100%', marginBottom: 12 },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoText: { fontSize: 14, flex: 1, flexWrap: 'wrap' }
});