import { Howl } from 'howler';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface LoopSource {
  id: string;
  url: string;
}

interface UseLoopPlayerOptions {
  crossfadeMs?: number;
  fadeOutMs?: number;
  initialVolume?: number; // 0..1
}

export function useLoopPlayer(options: UseLoopPlayerOptions = {}) {
  const crossfadeMs = options.crossfadeMs ?? 1000;
  const fadeOutMs = options.fadeOutMs ?? 2000;
  const initialVolume = options.initialVolume ?? 0.7;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const currentHowlRef = useRef<Howl | null>(null);
  const fadingHowlRef = useRef<Howl | null>(null);
  const isUnmountedRef = useRef(false);

  const playLoop = useCallback(async (source: LoopSource) => {
    if (currentId === source.id) {
      if (!isUnmountedRef.current) setIsPlaying(true);
      return;
    }

    // Create new Howl loop
    const newHowl = new Howl({
      src: [source.url],
      html5: true,
      loop: true,
      volume: 0,
      format: ['mp3'],
      onloaderror: (_, err) => console.error('Loop load error', err),
      onplayerror: (_, err) => console.error('Loop play error', err),
    });

    // Start playback
    try {
      newHowl.play();
    } catch (e) {
      console.error('Howl play error', e);
    }

    // Crossfade: fade in new, fade out old
    const old = currentHowlRef.current;
    fadingHowlRef.current = old;
    currentHowlRef.current = newHowl;
    setCurrentId(source.id);
    if (!isUnmountedRef.current) setIsPlaying(true);

    try {
      newHowl.fade(newHowl.volume(), initialVolume, crossfadeMs);
    } catch {
      newHowl.volume(initialVolume);
    }

    if (old) {
      try {
        old.fade(old.volume(), 0, crossfadeMs);
      } catch {
        old.volume(0);
      }
      window.setTimeout(() => {
        try { old.stop(); old.unload(); } catch (e) { console.warn('Old howl stop/unload error', e); }
      }, crossfadeMs + 10);
    }
  }, [crossfadeMs, currentId, initialVolume]);

  const pause = useCallback(() => {
    const howl = currentHowlRef.current;
    if (!howl) return;
    try { howl.fade(howl.volume(), 0, fadeOutMs); } catch { howl.volume(0); }
    if (!isUnmountedRef.current) setIsPlaying(false);
    window.setTimeout(() => {
      try { howl.pause(); } catch (e) { console.warn('Howl pause error', e); }
    }, fadeOutMs + 10);
  }, [fadeOutMs]);

  const resume = useCallback(() => {
    const howl = currentHowlRef.current;
    if (!howl) return;
    try { howl.play(); } catch (e) { console.warn('Howl resume error', e); }
    try { howl.fade(howl.volume(), initialVolume, crossfadeMs); } catch { howl.volume(initialVolume); }
    if (!isUnmountedRef.current) setIsPlaying(true);
  }, [crossfadeMs, initialVolume]);

  const setVolume = useCallback((v: number) => {
    const howl = currentHowlRef.current;
    if (!howl) return;
    const clamped = Math.max(0, Math.min(1, v));
    try { howl.volume(clamped); } catch (e) { console.warn('Howl setVolume error', e); }
  }, []);

  const stopPlayers = () => {
    const current = currentHowlRef.current;
    const fading = fadingHowlRef.current;
    try { if (current) { current.stop(); current.unload(); } } catch (e) { console.warn('Stop current error', e); }
    try { if (fading) { fading.stop(); fading.unload(); } } catch (e) { console.warn('Stop fading error', e); }
    currentHowlRef.current = null;
    fadingHowlRef.current = null;
  };

  const stop = useCallback(() => {
    stopPlayers();
    if (!isUnmountedRef.current) {
      setIsPlaying(false);
      setCurrentId(null);
    }
  }, []);

  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      stopPlayers();
    };
  }, []);

  return {
    isPlaying,
    currentId,
    playLoop,
    pause,
    resume,
    stop,
    setVolume,
  };
}


