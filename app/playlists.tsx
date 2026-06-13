import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { CoverGrid } from '../src/components/CoverGrid';
import { Screen } from '../src/components/Screen';
import { useAuth } from '../src/context/AuthContext';
import { useSubsonicQuery } from '../src/hooks/useSubsonicQuery';
import { colors } from '../src/constants/theme';

export default function PlaylistsScreen() {
  const { client } = useAuth();
  const router = useRouter();
  const playlists = useSubsonicQuery((c) => c.getPlaylists());

  if (playlists.loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <CoverGrid
        data={(playlists.data ?? []).map((playlist) => ({
          id: playlist.id,
          title: playlist.name,
          subtitle: `${playlist.songCount ?? 0} canciones`,
          coverUrl: client?.getCoverArtUrl(playlist.coverArt),
        }))}
        onPressItem={(item) => router.push(`/playlist/${item.id}`)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
