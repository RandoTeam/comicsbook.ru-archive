import { useState, useRef, useEffect, useCallback } from 'react';

const DEFAULT_PLAYLIST = [
  '/audio/track1.m4a',
  '/audio/track2.m4a',
  '/audio/track3.m4a',
  '/audio/track4.m4a',
  '/audio/track5.m4a',
];

export default function useAudioPlayer(customPlaylist = DEFAULT_PLAYLIST) {
  const playlist = customPlaylist && customPlaylist.length > 0 ? customPlaylist : DEFAULT_PLAYLIST;
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(null);

  const handleTrackEnded = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
  }, [playlist.length]);

  const handleTrackError = useCallback((err) => {
    console.warn('Audio playback error, skipping to next track:', err);
    handleTrackEnded();
  }, [handleTrackEnded]);

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.8;
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsMusicPlaying(true))
          .catch((err) => {
            console.warn('Autoplay prevented or audio load failed:', err);
            setIsMusicPlaying(false);
          });
      }
    }
  }, [isMusicPlaying]);

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

  return {
    isMusicPlaying,
    currentTrackIndex,
    audioRef,
    toggleMusic,
    handleTrackEnded,
    handleTrackError,
    playlist,
  };
}
