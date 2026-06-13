import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { songToStreamableTrack } from '../../src/api/subsonic';
import { AlbumCard } from '../../src/components/AlbumCard';
import { ArtistCard } from '../../src/components/ArtistCard';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { TrackRow } from '../../src/components/TrackRow';
import { useAuth } from '../../src/context/AuthContext';
import { usePlayer } from '../../src/context/PlayerContext';
import { colors, fontSize, radius, spacing } from '../../src/constants/theme';
import type { SearchResult3 } from '../../src/types/subsonic';

export default function SearchScreen() {
  const { client } = useAuth();
  const { playQueue } = usePlayer();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult3 | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!client) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResult(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeout = setTimeout(() => {
      client
        .search3(trimmed)
        .then((data) => setResult(data))
        .catch(() => setResult(null))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [client, query]);

  const hasResults =
    result && ((result.artist?.length ?? 0) + (result.album?.length ?? 0) + (result.song?.length ?? 0) > 0);

  return (
    <Screen>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.textSubtle} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Buscar artistas, álbumes o canciones"
          placeholderTextColor={colors.textSubtle}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!loading && query.trim().length >= 2 && !hasResults && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Sin resultados para "{query}"</Text>
        </View>
      )}

      {!loading && hasResults && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {result?.artist && result.artist.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Artistas" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {result.artist.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    name={artist.name}
                    coverUrl={client?.getCoverArtUrl(artist.coverArt)}
                    onPress={() => router.push(`/artist/${artist.id}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {result?.album && result.album.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Álbumes" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
                {result.album.map((album) => (
                  <AlbumCard
                    key={album.id}
                    title={album.name}
                    subtitle={album.artist}
                    coverUrl={client?.getCoverArtUrl(album.coverArt)}
                    onPress={() => router.push(`/album/${album.id}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {result?.song && result.song.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Canciones" />
              {result.song.map((song, index) => (
                <TrackRow
                  key={song.id}
                  title={song.title}
                  subtitle={song.artist}
                  coverUrl={client?.getCoverArtUrl(song.coverArt)}
                  duration={song.duration}
                  onPress={() => {
                    if (!client || !result.song) return;
                    playQueue(result.song.map((s) => songToStreamableTrack(client, s)), index);
                  }}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.md,
    paddingVertical: spacing.sm + 4,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    paddingHorizontal: spacing.md,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
});
