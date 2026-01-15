import React, { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Login({ navigation }) {
  const [roll, setRoll] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ArsdSaathi</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="College Roll Number (e.g. 22/350XX)"
        value={roll}
        onChangeText={setRoll}
        keyboardType="numeric"
        returnKeyType="next"
      />

      <TextInput
        style={styles.input}
        placeholder="Full Name (e.g. John Doe)"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        returnKeyType="next"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        returnKeyType="done"
      />

      <View style={styles.button}>
        <Button title="Login" onPress={() => navigation.replace('Home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  button: {
    width: '60%',
    marginTop: 8,
  },
});
