import InfoCard from '@/components/InfoCard';
import { Colors } from '@/constants/themeStyle';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App({ navigation }) {
  const extractData = () => {
   let data = {"name":"John Doe","attendance":85.43,"year":2,"semester":4};
   return data;
  }
  const data = extractData();
  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <View style={{ justifyContent: 'center', alignItems: 'center', marginTop:10, marginBottom:20 }}>
          <Text style={styles.textTitle}>Welcome to ArsdSaathi!</Text>
          <Text style={[styles.textTitle, {color:Colors.light.text}]}>{data.name}</Text>
        </View>
    
        <View style={{ justifyContent: 'center', gap: 10, flexDirection: 'row', height: 130 }}>
          <InfoCard title="Attendance %" value={String(data.attendance)} />
          <InfoCard title="Year / Semester" value={`${data.year} / ${data.semester}`} />
        </View>
    
        <View style={{ justifyContent: 'center', gap: 10, flexDirection: 'row', height: 130 }}>
          <InfoCard title="Student Name" value={data.name} />
          <InfoCard title="Semester" value={String(data.semester)} />
        </View>
    
      <View style={{ justifyContent: 'center', gap: 10, marginTop: 20 }}>
        <TouchableOpacity style={styles.longButtong}>
          <Text style={styles.buttonText}>View Detailed Attendance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.longButtong}>
          <Text style={styles.buttonText}>View Personal Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.longButtong}>
          <Text style={styles.buttonText}>Check Faculty Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.longButtong, {backgroundColor: Colors.light.error}]} onPress={() => navigation.replace('Login')}>
          <Text style={styles.buttonText}>Logout</Text>
          <Ionicons name="log-out-outline" color={Colors.light.background} size={22} />
        </TouchableOpacity>
      </View>
    
  
        <View style={styles.footer}>
            <Text style={styles.footerText}>Developed by Keshav Pal</Text>
            <Text style={styles.footerSub}>© {new Date().getFullYear()} ArsdSaathi</Text>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.light.background,
  },
  header: {
    height: 44,
    justifyContent: 'center',
  },
  logout: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  textTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  longButtong: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.secondary,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
  },
  footerSub: {
    fontSize: 12,
    color: Colors.light.secondary,
  }
});