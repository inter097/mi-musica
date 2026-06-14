import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';
import { songToStreamableTrack } from '../../src/api/subsonic';
import { CoverImage } from '../../src/components/CoverImage';
import { Screen } from '../../src/components/Screen';
import { TrackRow } from '../../src/components/TrackRow';
import { useAuth } from '../../src/context/AuthContext';
import { useDownloads } from '../../src/context/DownloadsContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { usePlayer } from '../../src/context/PlayerContext';
import { useSubsonicQuery } from '../../src/hooks/useSubsonicQuery';
import { colors, fontSize, spacing } from '../../src/constants/theme';

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client } = useAuth();
  const { playQueue } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isDownloaded, progress, getLocalUri, download } = useDownloads();
  const navigation = useNavigation();
  const activeTrack = useActiveTrack();

  const playlist = useSubsonicQuery((c) => c.getPlaylist(id), [id]);
  const songs = playlist.data?.entry ?? [];

  useEffect(() => {
    if (playlist.data?.name) {
      navigation.setOptions({ title: playlist.data.name });
    }
  }, [playlist.data?.name, navigation]);

  if (playlist.loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  const playAll = (startIndex = 0) => {
    if (!client) return;
    playQueue(
      songs.map((song) => songToStreamableTrack(client, song, getLocalUri(song.id))),
      startIndex
    );
  };

  return (
    <Screen>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <LinearGradient colors={[colors.surfaceHighlight, colors.background]} style={styles.header}>
            <CoverImage uri={client?.getCoverArtUrl(playlist.data?.coverArt)} size={180} />
            <Text style={styles.name}>{playlist.data?.name}</Text>
            {playlist.data?.comment ? <Text style={styles.subtitle}>{playlist.data.comment}</Text> : null}
            <Text style={styles.subtitle}>{playlist.data?.songCount ?? songs.length} canciones</Text>
            <Pressable style={styles.playButton} onPress={() => playAll(0)}>
              <Ionicons name="play" size={20} color={colors.background} />
              <Text style={styles.playButtonText}>Reproducir</Text>
            </Pressable>
          </LinearGradient>
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
  },
  content: {
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  name: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.md,
    textAlign: 'center',
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
});
