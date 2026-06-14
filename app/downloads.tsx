import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import { Screen } from '../src/components/Screen';
import { TrackRow } from '../src/components/TrackRow';
import { useAuth } from '../src/context/AuthContext';
import { useDownloads } from '../src/context/DownloadsContext';
import { usePlayer } from '../src/context/PlayerContext';
import { colors, fontSize, spacing } from '../src/constants/theme';

export default function DownloadsScreen() {
  const { client } = useAuth();
  const { playQueue } = usePlayer();
  const { downloads, remove } = useDownloads();
  const activeTrack = useActiveTrack();

  const playAll = (startIndex = 0) => {
    playQueue(
      downloads.map((song) => ({
        id: song.id,
        url: song.localUri,
        title: song.title,
        artist: song.artist ?? 'Desconocido',
        album: song.album,
        artwork: client?.getCoverArtUrl(song.coverArt),
        duration: song.duration,
      })),
      startIndex
    );
  };

  const confirmDelete = (id: string, title: string) => {
    Alert.alert('Eliminar descarga', `¿Eliminar "${title}" de tus descargas?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <Screen>
      <FlatList
        data={downloads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Ionicons name="download" size={48} color={colors.primary} />
            <Text style={styles.title}>Descargas</Text>
            <Text style={styles.subtitle}>{downloads.length} canciones disponibles sin conexión</Text>
            {downloads.length > 0 && (
              <Pressable style={styles.playButton} onPress={() => playAll(0)}>
                <Ionicons name="play" size={20} color={colors.background} />
                <Text style={styles.playButtonText}>Reproducir</Text>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              Toca el ícono de descarga en una canción para guardarla y escucharla sin internet.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TrackRow
            title={item.title}
            subtitle={item.artist}
            coverUrl={client?.getCoverArtUrl(item.coverArt)}
            duration={item.duration}
            active={activeTrack?.id === item.id}
            onPress={() => playAll(index)}
            onDelete={() => confirmDelete(item.id, item.title)}
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  playButtonText: {
    color: colors.background,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
