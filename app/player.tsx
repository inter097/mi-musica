import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TrackPlayer, {
  State,
  useActiveTrack,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
import { CoverImage } from '../src/components/CoverImage';
import { colors, fontSize, spacing } from '../src/constants/theme';
import { formatDuration } from '../src/utils/format';

export default function PlayerScreen() {
  const router = useRouter();
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const progress = useProgress(250);
  const [seeking, setSeeking] = useState<number | null>(null);

  const isPlaying = playbackState.state === State.Playing;
  const isBuffering = playbackState.state === State.Buffering || playbackState.state === State.Connecting;

  const togglePlay = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch {
      // No hay siguiente pista
    }
  };

  const skipPrevious = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch {
      // No hay pista anterior
    }
  };

  const position = seeking ?? progress.position;

  return (
    <LinearGradient colors={[colors.surfaceHighlight, colors.background]} style={styles.gradient}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-down" size={28} color={colors.text} />
          </Pressable>
          <Text style={styles.topBarTitle}>Reproduciendo</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.coverContainer}>
          <CoverImage uri={activeTrack?.artwork} size={320} />
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {activeTrack?.title ?? 'Sin reproducción'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {activeTrack?.artist}
            {activeTrack?.album ? ` · ${activeTrack.album}` : ''}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={progress.duration || 1}
            value={position}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.surfaceHighlight}
            thumbTintColor={colors.primary}
            onSlidingStart={(value) => setSeeking(value)}
            onValueChange={(value) => setSeeking(value)}
            onSlidingComplete={async (value) => {
              await TrackPlayer.seekTo(value);
              setSeeking(null);
            }}
          />
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatDuration(position)}</Text>
            <Text style={styles.timeText}>{formatDuration(progress.duration)}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={skipPrevious} hitSlop={12}>
            <Ionicons name="play-skip-back" size={36} color={colors.text} />
          </Pressable>
          <Pressable style={styles.playButton} onPress={togglePlay} hitSlop={12}>
            <Ionicons
              name={isBuffering ? 'hourglass' : isPlaying ? 'pause' : 'play'}
              size={36}
              color={colors.background}
            />
          </Pressable>
          <Pressable onPress={skipNext} hitSlop={12}>
            <Ionicons name="play-skip-forward" size={36} color={colors.text} />
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  topBarTitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  coverContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  info: {
    marginTop: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  artist: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    marginTop: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.lg,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    color: colors.textSubtle,
    fontSize: fontSize.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: spacing.xl,
  },
  playButton: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
