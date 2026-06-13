import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlbumCard } from '../../src/components/AlbumCard';
import { ArtistCard } from '../../src/components/ArtistCard';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { useAuth } from '../../src/context/AuthContext';
import { useSubsonicQuery } from '../../src/hooks/useSubsonicQuery';
import { colors, fontSize, spacing } from '../../src/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { client } = useAuth();

  const albums = useSubsonicQuery((c) => c.getAlbumList2('newest', 15));
  const artists = useSubsonicQuery((c) => c.getArtists());
  const playlists = useSubsonicQuery((c) => c.getPlaylists());

  const allArtists = useMemo(
    () => (artists.data ?? []).flatMap((group) => group.artist),
    [artists.data]
  );

  const loading = albums.loading && artists.loading && playlists.loading;
  const refreshing = albums.loading || artists.loading || playlists.loading;

  const onRefresh = () => {
    albums.refetch();
    artists.refetch();
    playlists.refetch();
  };

  if (loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Text style={styles.heading}>Mi Música</Text>

        {albums.data && albums.data.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Álbumes recientes" onPressSeeAll={() => router.push('/albums')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {albums.data.map((album) => (
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

        {allArtists.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Artistas" onPressSeeAll={() => router.push('/artists')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {allArtists.map((artist) => (
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

        {playlists.data && playlists.data.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Playlists" onPressSeeAll={() => router.push('/playlists')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
              {playlists.data.map((playlist) => (
                <AlbumCard
                  key={playlist.id}
                  title={playlist.name}
                  subtitle={`${playlist.songCount ?? 0} canciones`}
                  coverUrl={client?.getCoverArtUrl(playlist.coverArt)}
                  onPress={() => router.push(`/playlist/${playlist.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: spacing.xl * 2,
  },
  heading: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  row: {
    paddingHorizontal: spacing.md,
  },
});
