import { useEffect, useRef } from 'react';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // If there is no source or shouldPlay is false, stop current playback
    if (!source || !shouldPlay) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Resolve URL from the asset require
    let audioUrl = '';
    if (typeof source === 'string') {
      audioUrl = source;
    } else if (source && typeof source === 'object') {
      audioUrl = source.uri || source.default || String(source);
    } else {
      audioUrl = String(source);
    }

    // Create a new Audio object
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audioRef.current = audio;

    // Play standard HTML5 audio
    audio.play().catch((err) => {
      console.warn('[HTML5 Audio] Playback blocked or failed:', err);
    });

    return () => {
      audio.pause();
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [source, shouldPlay]);

  return null;
}
