import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from './src/constants/theme';
import { Button, Card } from './src/components/common';

export default function App() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>SetFit</Text>
        <Text style={styles.subtitle}>Bloques. Ritmo. Resultado.</Text>
        <Button
          title="Comenzar"
          onPress={() => console.log('Sprint 0 completado!')}
          style={styles.button}
        />
      </Card>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
});
