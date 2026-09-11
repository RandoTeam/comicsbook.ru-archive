import { useState, useRef, useEffect, useCallback } from 'react';

export const TRACKS = [
  { id: 1, title: 'Comicsbook Nostalgia (Intro)', src: 'audio/track1.m4a' },
  { id: 2, title: 'Rage Era 2011', src: 'audio/track2.m4a' },
  { id: 3, title: 'Ламповый Рунет', src: 'audio/track3.m4a' },
  { id: 4, title: 'Trollface Beats', src: 'audio/track4.m4a' },
  { id: 5, title: 'Retro Museum Outro', src: 'audio/track5.m4a' },
];

export default function useAudioPlayer(customTracks = TRACKS) {
  const tracks = customTracks && customTracks.length > 0 ? customTracks : TRACKS;
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('musicVolume');
    return saved !== null ? Math.max(0, Math.min(1, parseFloat(saved))) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const prevVolumeRef = useRef(volume || 0.8);
  const audioRef = useRef(null);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const setVolume = useCallback((newVol) => {
    const clamped = Math.max(0, Math.min(1, Number(newVol)));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
    localStorage.setItem('musicVolume', clamped.toString());
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      const restored = prevVolumeRef.current || 0.8;
      setVolume(restored);
    } else {
      prevVolumeRef.current = volume;
      setIsMuted(true);
      if (audioRef.current) {
        audioRef.current.volume = 0;
      }
    }
  }, [isMuted, volume, setVolume]);

  const handleTrackEnded = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  }, [tracks.length]);

  const handleTrackError = useCallback((err) => {
    console.warn('Audio playback error, skipping to next track:', err);
    handleTrackEnded();
  }, [handleTrackEnded]);

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        setShowMiniPlayer(true);
        audioRef.current
          .play()
          .then(() => setIsMusicPlaying(true))
          .catch((err) => {
            console.warn('Autoplay prevented or audio load failed:', err);
            setIsMusicPlaying(false);
          });
      }
    }
  }, [isMusicPlaying, volume, isMuted]);

  const playTrack = useCallback((index) => {
    const targetIndex = (index + tracks.length) % tracks.length;
    setCurrentTrackIndex(targetIndex);
    setShowMiniPlayer(true);
    if (audioRef.current) {
      audioRef.current.src = tracks[targetIndex].src;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch((err) => {
          console.warn('Playback error:', err);
          setIsMusicPlaying(false);
        });
    }
  }, [tracks, volume, isMuted]);

  const playNextTrack = useCallback(() => {
    playTrack(currentTrackIndex + 1);
  }, [currentTrackIndex, playTrack]);

  const playPrevTrack = useCallback(() => {
    playTrack(currentTrackIndex - 1);
  }, [currentTrackIndex, playTrack]);

  const selectTrack = useCallback((index) => {
    playTrack(index);
  }, [playTrack]);

  // Handle Cordova/mobile lifecycle pause to pause audio when backgrounded
  useEffect(() => {
    const onPause = () => {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      }
    };

    document.addEventListener('pause', onPause, false);
    return () => {
      document.removeEventListener('pause', onPause, false);
    };
  }, []);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  return {
    isMusicPlaying,
    currentTrackIndex,
    currentTrack,
    tracks,
    audioRef,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    showMiniPlayer,
    setShowMiniPlayer,
    toggleMusic,
    playNextTrack,
    playPrevTrack,
    selectTrack,
    handleTrackEnded,
    handleTrackError,
    // Backward compatibility with previous hook shape:
    playlist: tracks.map((t) => t.src),
  };
}
