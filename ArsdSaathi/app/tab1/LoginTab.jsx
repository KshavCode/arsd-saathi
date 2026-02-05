import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { loginAndFetchAll } from '../../services/api';

export default function Login({ navigation }) {
  const [roll, setRoll] = useState('23/38046');
  const [fullName, setFullName] = useState('Keshav Pal');
  // CHANGED: password -> dob
  const [dob, setDob] = useState('02-08-2005');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!roll || !fullName || !dob) {
        Alert.alert("Error", "Please fill in all fields");
        return;
    }

    // Basic format check (DD-MM-YYYY)
    const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dobRegex.test(dob)) {
        Alert.alert("Invalid Date", "Please enter DOB in DD-MM-YYYY format (e.g., 15-08-2004)");
        return;
    }

    setIsLoading(true);
    // Pass 'dob' instead of password
    const result = await loginAndFetchAll(fullName, roll, dob);
    setIsLoading(false);

    if (result.success) {
        navigation.replace('Home');
    } else {
        Alert.alert("Login Failed", result.message || "Please check your details.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ArsdSaathi</Text>
      <Text style={styles.subtitle}>Sign in with your College Details</Text>

      <TextInput
        style={styles.input}
        placeholder="College Roll Number"
        value={roll}
        onChangeText={setRoll}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Full Name (as per ID card)"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* CHANGED INPUT */}
      <TextInput
        style={styles.input}
        placeholder="Date of Birth (DD-MM-YYYY)"
        value={dob}
        onChangeText={setDob}
        keyboardType="numeric" 
      />
      <Text style={styles.hint}>Format: 5-8-2003</Text>

      <View style={styles.button}>
        {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
        ) : (
            <Button title="Login & Sync" onPress={handleLogin} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  input: { width: '100%', height: 44, borderColor: '#ccc', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, marginBottom: 12 },
  button: { width: '60%', marginTop: 8 },
  hint: { fontSize: 12, color: '#888', marginBottom: 15, alignSelf: 'flex-start' }
});