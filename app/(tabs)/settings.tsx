import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/context/AuthContext';
import { useDownloads } from '../../src/context/DownloadsContext';
import { colors, fontSize, radius, spacing } from '../../src/constants/theme';

export default function SettingsScreen() {
  const { client, logout } = useAuth();
  const { downloads } = useDownloads();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await TrackPlayer.reset();
          await logout();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={styles.heading}>Ajustes</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Servidor</Text>
          <Text style={styles.value}>{client?.serverUrl}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Usuario</Text>
          <Text style={styles.value}>{client?.username}</Text>
        </View>

        <Pressable style={styles.linkCard} onPress={() => router.push('/downloads')}>
          <Ionicons name="download-outline" size={20} color={colors.text} />
          <Text style={styles.linkText}>Descargas</Text>
          <Text style={styles.linkValue}>{downloads.length}</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>

        <Text style={styles.version}>Mi Música v{Constants.expoConfig?.version ?? '1.0.0'}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  heading: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  linkText: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
  },
  linkValue: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  logoutText: {
    color: colors.danger,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  version: {
    color: colors.textSubtle,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
