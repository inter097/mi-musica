import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { CoverGrid } from '../src/components/CoverGrid';
import { Screen } from '../src/components/Screen';
import { useAuth } from '../src/context/AuthContext';
import { useSubsonicQuery } from '../src/hooks/useSubsonicQuery';
import { colors } from '../src/constants/theme';

export default function AlbumsScreen() {
  const { client } = useAuth();
  const router = useRouter();
  const albums = useSubsonicQuery((c) => c.getAlbumList2('alphabeticalByName', 500));

  if (albums.loading) {
    return (
      <Screen style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </Screen>
    );
  }

  return (
    <Screen>
      <CoverGrid
        data={(albums.data ?? []).map((album) => ({
          id: album.id,
          title: album.name,
          subtitle: album.artist,
          coverUrl: client?.getCoverArtUrl(album.coverArt),
        }))}
        onPressItem={(item) => router.push(`/album/${item.id}`)}
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
