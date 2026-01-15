import { Colors } from '@/constants/themeStyle';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from "react-native-vector-icons/Ionicons";

export default function App({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.logout}
          onPress={() => navigation.replace('Login')}
          accessibilityLabel="Logout"
        >
          <Ionicons name="log-out-outline" color="#333" size={22} />
        </TouchableOpacity>
      </View>

      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="house" color="#ff0000" size={20} />
        <Text style={styles.textTitle}>Welcome to ArsdSaathi!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },

  box: {
    width: 100,
    height: 100,
    backgroundColor: 'blue',
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
    color: Colors.light.success,
  },
  textSubTitle: {
    fontSize: 25,
    fontWeight: 'bold',
  }
});