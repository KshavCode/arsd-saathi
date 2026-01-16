import { Colors } from '@/constants/themeStyle';
import { StyleSheet, Text, View } from 'react-native';

export default function InfoCard({ title, value }) {
  const text = value == null ? '' : String(value);

  // dynamic font sizing based on length of the text value
  let fontSize = 24;
  if (text.length <= 4) fontSize = 30;
  else if (text.length <= 6) fontSize = 27;
  else if (text.length <= 12) fontSize = 25;
  else fontSize = 20;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, { fontSize }]} numberOfLines={2} ellipsizeMode="tail">
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    height: 110,
    backgroundColor: Colors.light.background,
    padding: 15,
    borderRadius: 10,
    shadowColor: Colors.light.primary,
    shadowRadius: 5,
    elevation: 5,
    marginVertical: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  cardValue: {
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: 10,
  },
});