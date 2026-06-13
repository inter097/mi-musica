import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { songToStreamableTrack } from '../../src/api/subsonic';
import { CoverImage } from '../../src/components/CoverImage';
import { Screen } from '../../src/components/Screen';
import { TrackRow } from '../../src/components/TrackRow';
import { useAuth } from '../../src/context/AuthContext';
import { usePlayer } from '../../src/context/PlayerContext';
import { useSubsonicQuery } from '../../src/hooks/useSubsonicQuery';
import { colors, fontSize, spacing } from '../../src/constants/theme';
import { useActiveTrack } from 'react-native-track-player';

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { client } = useAuth();
  const { playQueue } = usePlayer();
  const navigation = useNavigation();
  const activeTrack = useActiveTrack();

  const album = useSubsonicQuery((c) => c.getAlbum(id), [id]);
  const songs = album.data?.song ?? [];

  useEffect(() => {
    if (album.data?.name) {
      navigation.setOptions({ title: album.data.name });
    }
  }, [album.data?.name, navigation]);

  if (album.loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  const playAll = (startIndex = 0) => {
    if (!client) return;
    playQueue(songs.map((song) => songToStreamableTrack(client, song)), startIndex);
  };

  return (
    <Screen>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <LinearGradient colors={[colors.surfaceHighlight, colors.background]} style={styles.header}>
            <CoverImage uri={client?.getCoverArtUrl(album.data?.coverArt)} size={180} />
            <Text style={styles.name}>{album.data?.name}</Text>
            <Text style={styles.artist}>{album.data?.artist}</Text>
            <Text style={styles.subtitle}>
              {album.data?.year ? `${album.data.year} · ` : ''}
              {album.data?.songCount ?? songs.length} canciones
            </Text>
            <Pressable style={styles.playButton} onPress={() => playAll(0)}>
              <Ionicons name="play" size={20} color={colors.background} />
              <Text style={styles.playButtonText}>Reproducir</Text>
            </Pressable>
          </LinearGradient>
        }
        renderItem={({ item, index }) => (
          <TrackRow
            index={index + 1}
            title={item.title}
            subtitle={item.artist}
            duration={item.duration}
            active={activeTrack?.id === item.id}
            onPress={() => playAll(index)}
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
  artist: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.textSubtle,
    fontSize: fontSize.xs,
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
