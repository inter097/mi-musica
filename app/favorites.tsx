import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import { songToStreamableTrack } from '../src/api/subsonic';
import { Screen } from '../src/components/Screen';
import { TrackRow } from '../src/components/TrackRow';
import { useAuth } from '../src/context/AuthContext';
import { useDownloads } from '../src/context/DownloadsContext';
import { useFavorites } from '../src/context/FavoritesContext';
import { usePlayer } from '../src/context/PlayerContext';
import { colors, fontSize, spacing } from '../src/constants/theme';

export default function FavoritesScreen() {
  const { client } = useAuth();
  const { playQueue } = usePlayer();
  const { favoriteSongs, loading, isFavorite, toggleFavorite } = useFavorites();
  const { isDownloaded, downloadingIds, progress, getLocalUri, download } = useDownloads();
  const activeTrack = useActiveTrack();

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  const playAll = (startIndex = 0) => {
    if (!client) return;
    playQueue(
      favoriteSongs.map((song) => songToStreamableTrack(client, song, getLocalUri(song.id))),
      startIndex
    );
  };

  return (
    <Screen>
      <FlatList
        data={favoriteSongs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Ionicons name="heart" size={48} color={colors.primary} />
            <Text style={styles.title}>Favoritos</Text>
            <Text style={styles.subtitle}>{favoriteSongs.length} canciones</Text>
            {favoriteSongs.length > 0 && (
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
              Toca el corazón en una canción para agregarla a tus favoritos.
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
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={() => toggleFavorite(item)}
            downloaded={isDownloaded(item.id)}
            downloadProgress={progress[item.id]}
            onDownload={() =>
              download(item).catch(() =>
                Alert.alert('Error', 'No se pudo descargar la canción. Intenta de nuevo.')
              )
            }
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
