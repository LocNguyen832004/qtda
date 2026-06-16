import { useEffect, useRef } from 'react';
import { useAudioPlayer as useExpoAudioPlayer, setAudioModeAsync } from 'expo-audio';

export interface MusicTrack {
  id: string;
  name: string;
  emoji: string;
  icon: string;
  cost: number;
  description: string;
  source: any;
}

// Local music files from assets directory
export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'm_lofi',
    name: 'Late Afternoon Study',
    emoji: '☕',
    icon: 'musical-notes',
    cost: 0,
    description: 'Bài mặc định đã mở sẵn cho mọi người học.',
    source: require('../../assets/Music-projectmanagent/Lofi chill/1-HOUR STUDY WITH ME   Late Afternoon, Peaceful Acoustic Guitar BGM  Pomodoro (255).mp3'),
  },
  {
    id: 'm_rain',
    name: 'Mưa Hồng (Trịnh Công Sơn)',
    emoji: '🌧️',
    icon: 'rainy',
    cost: 100,
    description: 'Giai điệu mưa dịu, giúp giảm nhiễu xung quanh.',
    source: require('../../assets/Music-projectmanagent/Music rain/Mưa Hồng (Instrumental) – Giai điệu Trịnh Công Sơn (Piano version).mp3'),
  },
  {
    id: 'm_focus',
    name: 'Chạy Khỏi Thế Giới Này',
    emoji: '🎵',
    icon: 'headset',
    cost: 100,
    description: 'Bản nhạc nền giàu năng lượng cho phiên tập trung dài hơn.',
    source: require('../../assets/Music-projectmanagent/Defocus/Chạy Khỏi Thế Giới Này - Da LAB ft. Phương Ly .mp3'),
  },
];

interface UseAudioOptions {
  source: any;
  shouldPlay: boolean;
}

export function useAudio({ source, shouldPlay }: UseAudioOptions) {
  // Configure audio mode once on mount (iOS needs playsInSilentModeIOS)
  const modeConfigured = useRef(false);

  useEffect(() => {
    if (!modeConfigured.current) {
      setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      }).catch((e) => console.warn('Audio mode error:', e));
      modeConfigured.current = true;
    }
  }, []);

  const player = useExpoAudioPlayer(source || null);

  // Control loop
  useEffect(() => {
    if (player) {
      player.loop = true;
    }
  }, [player]);

  // Play or pause based on shouldPlay
  useEffect(() => {
    if (!player || !source) return;
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, player, source]);

  return player;
}
