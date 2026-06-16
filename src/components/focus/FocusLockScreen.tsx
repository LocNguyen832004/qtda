import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusStore } from '../../store';
import { useAudio, MUSIC_TRACKS } from '../../hooks/useAudioPlayer';
import { formatCountdown } from '../../utils/dateUtils';

const GRADIENT_COLORS_BY_MODE: Record<string, [string, string, string]> = {
  pomodoro: ['#1a0533', '#2d1b69', '#1e3a8a'],
  short_break: ['#0a2e1a', '#145a32', '#1a6b4a'],
  long_break: ['#0a1a3a', '#1b3a69', '#0d2d4a'],
};

const MODE_LABEL: Record<string, string> = {
  pomodoro: 'Pomodoro',
  short_break: 'Nghỉ ngắn',
  long_break: 'Nghỉ dài',
};

const BAR_COUNT = 16;

interface FocusLockScreenProps {
  visible: boolean;
  mode: 'pomodoro' | 'short_break' | 'long_break';
  timeLeft: number;
  isRunning: boolean;
  onBack: () => void;
  onTogglePause: () => void;
  onComplete: () => void;
}

export function FocusLockScreen({
  visible,
  mode,
  timeLeft,
  isRunning,
  onBack,
  onTogglePause,
  onComplete,
}: FocusLockScreenProps) {
  const { unlockedMusicIds } = useFocusStore();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compactHeight = height < 700;
  const narrowWidth = width < 360;
  const horizontalPadding = narrowWidth ? 16 : 24;
  const clockSize = Math.max(
    164,
    Math.min(compactHeight ? 194 : 230, width - horizontalPadding * 4, height * 0.31)
  );
  const waveMaxHeight = compactHeight ? 58 : 80;
  const waveContainerHeight = compactHeight ? 66 : 90;
  const controlsBottom = Math.max(insets.bottom + 16, Platform.OS === 'android' ? 24 : 34);
  const sideButtonSize = compactHeight ? 48 : 54;
  const mainButtonSize = compactHeight ? 68 : 80;

  // ─── Music state ─────────────────────────────────────────────────────────────
  const unlockedTracks = MUSIC_TRACKS.filter((t) => unlockedMusicIds.includes(t.id));
  const [selectedTrackId, setSelectedTrackId] = useState<string>(unlockedTracks[0]?.id ?? '');
  const [showTrackPicker, setShowTrackPicker] = useState(false);

  useEffect(() => {
    if (unlockedTracks.length > 0 && !unlockedTracks.some((track) => track.id === selectedTrackId)) {
      setSelectedTrackId(unlockedTracks[0].id);
    }
  }, [selectedTrackId, unlockedTracks]);

  const selectedTrack = unlockedTracks.find((t) => t.id === selectedTrackId) ?? null;

  useAudio({
    source: visible && isRunning ? selectedTrack?.source ?? null : null,
    shouldPlay: visible && isRunning,
  });

  // ─── Animated values ─────────────────────────────────────────────────────────
  const clockScale = useRef(new Animated.Value(0.4)).current;
  const clockOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Bar heights for wave visualizer
  const barAnimsRef = useRef<Animated.Value[]>(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.2))
  );
  const barAnims = barAnimsRef.current;

  const waveLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  // ─── Entry animation ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(clockScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(clockOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      clockScale.setValue(0.4);
      clockOpacity.setValue(0);
    }
  }, [visible]);

  // ─── Pulse animation (breathing) ─────────────────────────────────────────────
  useEffect(() => {
    if (pulseLoopRef.current) {
      pulseLoopRef.current.stop();
      pulseLoopRef.current = null;
    }
    if (visible && isRunning) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 1800, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current = loop;
      loop.start();
    } else {
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 300, useNativeDriver: true }).start();
    }
    return () => {
      pulseLoopRef.current?.stop();
    };
  }, [visible, isRunning]);

  // ─── Wave visualizer animation ────────────────────────────────────────────────
  const startWave = useCallback(() => {
    if (waveLoopRef.current) {
      waveLoopRef.current.stop();
    }
    const animations = barAnims.map((anim, i) => {
      const phase = (i / BAR_COUNT) * Math.PI * 2;
      const minH = 0.1 + Math.random() * 0.1;
      const maxH = 0.5 + Math.random() * 0.5;
      const duration = 600 + Math.sin(phase) * 200 + Math.random() * 300;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: maxH, duration, useNativeDriver: false }),
          Animated.timing(anim, { toValue: minH, duration: duration * 0.8, useNativeDriver: false }),
        ])
      );
    });
    const loop = Animated.parallel(animations);
    waveLoopRef.current = loop;
    loop.start();
  }, []);

  const stopWave = useCallback(() => {
    if (waveLoopRef.current) {
      waveLoopRef.current.stop();
      waveLoopRef.current = null;
    }
    barAnims.forEach((anim) => {
      Animated.timing(anim, { toValue: 0.15, duration: 400, useNativeDriver: false }).start();
    });
  }, []);

  useEffect(() => {
    if (visible && isRunning) {
      startWave();
    } else {
      stopWave();
    }
    return () => {
      waveLoopRef.current?.stop();
    };
  }, [visible, isRunning]);

  // ─── Gradient colors ─────────────────────────────────────────────────────────
  const gradColors = GRADIENT_COLORS_BY_MODE[mode] ?? GRADIENT_COLORS_BY_MODE['pomodoro'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onBack}
    >
      <StatusBar hidden />
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
            paddingHorizontal: horizontalPadding,
            paddingTop: insets.top + 18,
            paddingBottom: controlsBottom + mainButtonSize + 18,
          },
        ]}
      >
        <LinearGradient colors={gradColors} style={StyleSheet.absoluteFill} />

        {/* Ambient glow circles */}
        <View style={[styles.glowCircle, styles.glowCircle1]} />
        <View style={[styles.glowCircle, styles.glowCircle2]} />

        {/* Mode label */}
        <Text style={[styles.modeLabel, { top: insets.top + 18 }]}>{MODE_LABEL[mode]}</Text>

        {/* Clock */}
        <Animated.View
          style={[
            styles.clockWrapper,
            {
              marginBottom: compactHeight ? 16 : 28,
              transform: [{ scale: Animated.multiply(clockScale, pulseAnim) }],
              opacity: clockOpacity,
            },
          ]}
        >
          <View
            style={[
              styles.clockRing,
              {
                width: clockSize,
                height: clockSize,
                borderRadius: clockSize / 2,
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={[styles.clockTime, { fontSize: Math.max(40, Math.min(56, clockSize * 0.24)) }]}>
              {formatCountdown(timeLeft)}
            </Text>
            <Text style={styles.clockSub} numberOfLines={1}>
              {isRunning ? '▶ Đang tập trung...' : '⏸ Tạm dừng'}
            </Text>
          </View>
        </Animated.View>

        {/* Wave visualizer */}
        <View
          style={[
            styles.waveContainer,
            {
              height: waveContainerHeight,
              marginBottom: compactHeight ? 12 : 20,
            },
          ]}
        >
          {barAnims.map((anim, i) => {
            const barH = anim.interpolate({
              inputRange: [0, 1],
              outputRange: [4, waveMaxHeight],
            });
            const isCenter = Math.abs(i - BAR_COUNT / 2) < BAR_COUNT / 4;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: barH,
                    opacity: isRunning ? (isCenter ? 1 : 0.6) : 0.25,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Music selector */}
        <TouchableOpacity
          style={[styles.musicChip, { maxWidth: width - horizontalPadding * 2 }]}
          onPress={() => setShowTrackPicker(!showTrackPicker)}
          activeOpacity={0.8}
        >
          <Text style={styles.musicEmoji}>{selectedTrack?.emoji ?? '🎵'}</Text>
          <Text style={styles.musicName} numberOfLines={1}>{selectedTrack?.name ?? 'Chọn nhạc'}</Text>
          <Ionicons name={showTrackPicker ? 'chevron-up' : 'chevron-down'} size={14} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Track picker */}
        {showTrackPicker && (
          <View style={[styles.trackPicker, { maxWidth: width - horizontalPadding * 2, maxHeight: height * 0.28 }]}>
            {unlockedTracks.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={[
                  styles.trackItem,
                  selectedTrackId === track.id && styles.trackItemActive,
                ]}
                onPress={() => {
                  setSelectedTrackId(track.id);
                  setShowTrackPicker(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.trackEmoji}>{track.emoji}</Text>
                <Text
                  style={[styles.trackName, selectedTrackId === track.id && styles.trackNameActive]}
                  numberOfLines={1}
                >
                  {track.name}
                </Text>
                {selectedTrackId === track.id && (
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Controls */}
        <View
          style={[
            styles.controlRow,
            {
              bottom: controlsBottom,
              gap: narrowWidth ? 20 : 32,
            },
          ]}
        >
          {/* Back / close lock */}
          <TouchableOpacity style={styles.ctrlSide} onPress={onBack} activeOpacity={0.7}>
            <View
              style={[
                styles.ctrlSideInner,
                {
                  width: sideButtonSize,
                  height: sideButtonSize,
                  borderRadius: sideButtonSize / 2,
                },
              ]}
            >
              <Ionicons name="arrow-down-circle-outline" size={26} color="rgba(255,255,255,0.75)" />
            </View>
            <Text style={styles.ctrlLabel}>Dừng phiên</Text>
          </TouchableOpacity>

          {/* Pause / Resume */}
          <TouchableOpacity style={styles.ctrlMain} onPress={onTogglePause} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={[
                styles.ctrlMainGrad,
                {
                  width: mainButtonSize,
                  height: mainButtonSize,
                  borderRadius: mainButtonSize / 2,
                },
              ]}
            >
              <Ionicons name={isRunning ? 'pause' : 'play'} size={36} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Complete */}
          <TouchableOpacity style={styles.ctrlSide} onPress={onComplete} activeOpacity={0.7}>
            <View
              style={[
                styles.ctrlSideInner,
                {
                  width: sideButtonSize,
                  height: sideButtonSize,
                  borderRadius: sideButtonSize / 2,
                },
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={26} color="rgba(255,255,255,0.75)" />
            </View>
            <Text style={styles.ctrlLabel}>Hoàn thành</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  glowCircle1: {
    width: 400,
    height: 400,
    top: -100,
    left: -120,
    backgroundColor: '#8B85FF',
  },
  glowCircle2: {
    width: 300,
    height: 300,
    bottom: -60,
    right: -80,
    backgroundColor: '#43BCCD',
  },
  modeLabel: {
    position: 'absolute',
    top: 64,
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  clockWrapper: {
    marginBottom: 20,
  },
  clockRing: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#8B85FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 20,
  },
  clockTime: {
    fontSize: 56,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 3,
  },
  clockSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    letterSpacing: 1,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 280,
  },
  waveBar: {
    flex: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    maxWidth: 14,
  },
  musicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  musicEmoji: {
    fontSize: 16,
  },
  musicName: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  trackPicker: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 16,
    overflow: 'hidden',
    minWidth: 200,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  trackItemActive: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  trackEmoji: {
    fontSize: 18,
  },
  trackName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    flex: 1,
  },
  trackNameActive: {
    color: '#fff',
    fontWeight: '600',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    position: 'absolute',
    left: 16,
    right: 16,
    justifyContent: 'center',
  },
  ctrlSide: {
    alignItems: 'center',
    gap: 6,
  },
  ctrlSideInner: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  ctrlMain: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  ctrlMainGrad: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
