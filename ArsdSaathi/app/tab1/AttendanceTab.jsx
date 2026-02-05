import { Colors } from '@/constants/themeStyle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getData } from '../../services/api';

export default function AttendanceTab({ navigation, isDarkMode, setIsDarkMode }) {

    const theme = {
        background: isDarkMode ? Colors.dark.background : Colors.light.background,
        card: isDarkMode ? '#1A2235' : '#FFFFFF',
        text: isDarkMode ? Colors.dark.text : Colors.light.text,
        textSecondary: isDarkMode ? Colors.dark.secondary : Colors.light.secondary,
        primary: isDarkMode ? Colors.dark.primary : Colors.light.primary,
        secondary: isDarkMode ? Colors.dark.secondary : Colors.light.secondary,
        error: isDarkMode ? Colors.dark.error : Colors.light.error,
        borderColor: isDarkMode ? '#2E3A52' : '#E2E8F0',
        
        headerBg: isDarkMode ? '#1E293B' : Colors.light.primary,
        headerText: isDarkMode ? '#F8FAFC' : '#FFFFFF',
    };

    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modes, setModes] = useState([]);
    const [selectedMode, setSelectedMode] = useState('');
    const [appliedMode, setAppliedMode] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchLocal = async () => {
            try {
                // 1. Fetch the correct key
                const data = await getData('ATTENDANCE_DATA');
                
                // 2. CRITICAL FIX: Check if data is truly valid and not empty
                if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                    setAttendanceData(data);
                    const subjects = Object.keys(data);
                    setModes(subjects);
                    
                    if (subjects.length > 0) {
                        setSelectedMode(subjects[0]);
                        setAppliedMode(subjects[0]);
                    }
                } else {
                    // If data is {} (empty object) or null, treat as no data
                    setAttendanceData(null);
                }
            } catch (error) {
                console.error("Failed to load attendance", error);
                setAttendanceData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchLocal();
    }, []);

    // Build grid safely
    const grid = useMemo(() => {
        if (!attendanceData || !appliedMode || !attendanceData[appliedMode]) {
            return [];
        }

        const subjectData = attendanceData[appliedMode];
        let formattedGrid = [];

        // Add Header
        formattedGrid.push(['Month', 'TE Att.', 'TE Held', 'TU Att.', 'TU Held']);

        // Add Rows
        if (Array.isArray(subjectData)) {
            subjectData.forEach(row => {
                const rowValues = [
                    row.month || row.Month || '-',
                    row.lect_att || row.te_att || row['TE Att.'] || '0',
                    row.lect_del || row.te_held || row['TE Held'] || '0',
                    row.tut_att || row.tu_att || row['TU Att.'] || '0',
                    row.tut_del || row.tu_held || row['TU Held'] || '0'
                ];
                formattedGrid.push(rowValues);
            });
        }

        return formattedGrid;
    }, [appliedMode, attendanceData]);

    const COLS = 5; 

    function onConfirm() {
        setAppliedMode(selectedMode);
        setShowDropdown(false);
    }

    function onSelectMode(mode) {
        setSelectedMode(mode);
        setShowDropdown(false);
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                
                {/* --- Header --- */}
                <View style={styles.headerRow}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => (navigation && navigation.goBack ? navigation.goBack() : console.log('Back'))}>
                        <Ionicons name="caret-back" size={27} color={theme.primary} />
                    </TouchableOpacity>

                    <Text style={[styles.headerTitle, { color: theme.text }]}>ATTENDANCE</Text>

                    <TouchableOpacity 
                        style={[styles.themeButton, { backgroundColor: theme.card }]} 
                        onPress={() => setIsDarkMode(!isDarkMode)}
                    >
                         <Ionicons name={isDarkMode ? "sunny" : "moon"} size={20} color={isDarkMode ? "#FBBF24" : theme.primary} />
                    </TouchableOpacity>
                </View>

                {/* --- MAIN LOGIC --- */}
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : !attendanceData ? (
                    
                    // --- EMPTY STATE (Fixes the broken screen) ---
                    <View style={styles.centerContainer}>
                        <View style={[styles.emptyIconCtx, { backgroundColor: theme.iconBg }]}>
                             <Ionicons name="document-text-outline" size={48} color={theme.primary} style={{ opacity: 0.8 }} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Attendance Record</Text>
                        <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                            Your attendance hasn&apos;t been uploaded to the college portal yet.
                        </Text>
                    </View>

                ) : (
                    
                    // --- DATA VIEW (Only shows if data exists) ---
                    <>
                        <View style={styles.controlsRow}>
                            <Text style={[styles.selectLabel, { color: theme.textSecondary }]}>Select Subject:</Text>
                            <View style={styles.dropdownRow}>
                                <View style={styles.dropdownWrapper}>
                                    <TouchableOpacity 
                                        style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.borderColor }]} 
                                        onPress={() => setShowDropdown((s) => !s)}
                                    >
                                        <Text style={[styles.dropdownText, { color: theme.text }]} numberOfLines={1}>
                                            {selectedMode}
                                        </Text>
                                        <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textSecondary} />
                                    </TouchableOpacity>

                                    {showDropdown && (
                                        <View style={[styles.dropdownList, { backgroundColor: theme.card, borderColor: theme.borderColor }]}>
                                            <ScrollView style={{maxHeight: 200}}>
                                                {modes.map((m) => (
                                                    <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => onSelectMode(m)}>
                                                        <Text style={[styles.dropdownItemText, { color: theme.textSecondary }, selectedMode === m && { color: theme.primary, fontWeight: '700' }]}>
                                                            {m}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.primary }]} onPress={onConfirm}>
                                    <Text style={[styles.confirmText, { color: '#FFFFFF' }]}>Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.tableContainer, { borderColor: theme.borderColor }]}>
                            {grid.map((row, rIdx) => (
                                <View key={`row-${rIdx}`} style={[styles.tableRow, { backgroundColor: theme.card }]}>
                                    {row.map((cell, cIdx) => {
                                        const isHeaderRow = rIdx === 0;
                                        const isRowHeader = cIdx === 0 && !isHeaderRow;
                                        return (
                                            <View 
                                                key={`cell-${rIdx}-${cIdx}`} 
                                                style={[
                                                    styles.tableCell, 
                                                    { borderColor: theme.borderColor },
                                                    isHeaderRow && { backgroundColor: theme.headerBg },
                                                    isRowHeader && { backgroundColor: theme.background },
                                                    cIdx === COLS - 1 && styles.tableCellLast
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.cellText, 
                                                    { color: theme.text },
                                                    isHeaderRow && { color: theme.headerText, fontWeight: '700', fontSize: 12 },
                                                    isRowHeader && { fontWeight: '600', fontSize: 13 }
                                                ]}>
                                                    {cell}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12 },
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    themeButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    
    // Empty State Styles
    centerContainer: { flex: 1, height: 400, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 },
    emptyIconCtx: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

    controlsRow: { marginBottom: 16 },
    selectLabel: { fontSize: 13, marginBottom: 8, fontWeight: '600' },
    dropdownRow: { flexDirection: 'row', alignItems: 'center' },
    dropdownWrapper: { position: 'relative', flex: 1 },
    dropdown: { paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    dropdownText: { fontSize: 14, fontWeight: '500', flex: 1 },
    dropdownList: { position: 'absolute', top: 50, left: 0, right: 0, borderWidth: 1, borderRadius: 10, overflow: 'hidden', zIndex: 20, elevation: 8 },
    dropdownItem: { paddingVertical: 12, paddingHorizontal: 16 },
    dropdownItemText: { fontSize: 14 },
    confirmButton: { marginLeft: 12, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    confirmText: { fontWeight: '700', fontSize: 14 },
    tableContainer: { overflow: 'hidden', borderRadius: 12, borderWidth: 1 },
    tableRow: { flexDirection: 'row' },
    tableCell: { flex: 1, paddingVertical: 14, paddingHorizontal: 4, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
    tableCellLast: { borderRightWidth: 0 },
    cellText: { fontSize: 13 },
});