import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  RotateCcw,
  Settings,
  ArrowLeft
} from 'lucide-react';
import type { Song, Setlist, LoopTrack } from '../types';
import { FullSongDisplay } from './ChordLyricDisplay';
import { ChordTransposer } from '../utils/chordTransposer';
import { dataLoader } from '../utils/dataLoader';
import { enhancedAudioManager } from '../utils/enhancedAudioManager';
import { SongOverrideStorage } from '../utils/songOverrides';
import { useSettings } from '../contexts/SettingsContext';

interface PerformanceViewProps {
  setlist: Setlist;
  songs: Song[];
  onBack: () => void;
  className?: string;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({
  setlist,
  songs,
  onBack,
  className = ''
}) => {
  const { settings } = useSettings();
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentKey, setCurrentKey] = useState<string>('');
  const [capoPosition, setCapoPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [availableLoops, setAvailableLoops] = useState<LoopTrack[]>([]);
  const [currentLoop, setCurrentLoop] = useState<LoopTrack | null>(null);
  const [showTransposeControls, setShowTransposeControls] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [userPaused, setUserPaused] = useState(false);

  const currentSong = songs[currentSongIndex];
  const setlistSong = setlist.songs.find(s => s.songId === currentSong?.id);

  useEffect(() => {
    if (currentSong) {
      // Priority order: setlist custom -> song overrides -> original song
      const songOverride = SongOverrideStorage.get(currentSong.id);
      
      // Set initial key (setlist custom key > override > original key)
      const initialKey = setlistSong?.customKey || 
                        songOverride?.customKey || 
                        currentSong.originalKey;
      
      // Set initial capo position (setlist custom capo > override > original capo)
      const initialCapo = setlistSong?.customCapo ?? 
                         songOverride?.customCapo ?? 
                         currentSong.capoPosition ?? 0;
      setCapoPosition(initialCapo);

      // Always update key when song changes - this will trigger the loop loading
      console.log(`Song changed: ${currentSong.title}, setting key to: ${initialKey}, capo: ${initialCapo}`);
      setCurrentKey(initialKey);
    }
  }, [currentSong, setlistSong]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clean up audio when component unmounts
      enhancedAudioManager.stop();
    };
  }, []);

  // Sync UI state with actual audio state
  useEffect(() => {
    const syncInterval = setInterval(() => {
      const actuallyPlaying = enhancedAudioManager.hasPlayingTracks();
      const managerPlaying = enhancedAudioManager.getIsPlaying();
      
      // Only sync if user hasn't explicitly paused and there's a mismatch
      if (!userPaused && isPlaying !== actuallyPlaying) {
        console.log(`State sync: UI says ${isPlaying}, actual: ${actuallyPlaying}, manager: ${managerPlaying}`);
        setIsPlaying(actuallyPlaying);
      }
      
      // If user paused and audio has actually stopped, clear the pause flag
      if (userPaused && !actuallyPlaying) {
        console.log('Fade-out complete, clearing user pause flag');
        setUserPaused(false);
      }
    }, 500); // Check every 500ms for more responsive updates

    return () => clearInterval(syncInterval);
  }, [isPlaying, userPaused]);

  const autoStartLoop = useCallback(async (loop: LoopTrack) => {
    try {
      const trackId = `${loop.key}-${loop.style}`;
      
      if (enhancedAudioManager.hasActiveTrack()) {
        // Crossfade to new loop
        await enhancedAudioManager.playWithCrossfade(
          loop.filePath, 
          trackId, 
          settings.loopBlendDuration
        );
      } else {
        // Start fresh
        await enhancedAudioManager.play(loop.filePath, trackId);
      }
      
      enhancedAudioManager.setMasterVolume(volume);
      setIsPlaying(true);
      setUserPaused(false); // Clear pause flag when auto-starting
    } catch (error) {
      console.error('Error auto-starting loop:', error);
    }
  }, [settings.loopBlendDuration, volume]);

  const loadLoopsForKey = useCallback(async (key: string) => {
    try {
      console.log(`Loading loops for key: ${key}, currentSongIndex: ${currentSongIndex}, hasAutoStarted: ${hasAutoStarted}`);
      const loops = await dataLoader.getLoopsByKey(key);
      setAvailableLoops(loops);
      
      // Auto-select first available loop
      if (loops.length > 0) {
        const newLoop = loops[0];
        const newTrackId = `${newLoop.key}-${newLoop.style}`;
        
        // Only update current loop if it's different
        if (!currentLoop || currentLoop.id !== newLoop.id) {
          setCurrentLoop(newLoop);
          
          // Auto-start if enabled - always start/crossfade to new loop
          if (settings.autoStartLoops) {
            console.log(`Auto-starting/crossfading to loop: ${newTrackId}`);
            await autoStartLoop(newLoop);
            setHasAutoStarted(true);
          }
        }
      }
    } catch (error) {
      console.error('Error loading loops:', error);
    }
  }, [currentSongIndex, hasAutoStarted, currentLoop, settings.autoStartLoops, autoStartLoop]);

  // Calculate the effective key considering both transposition and capo
  const getEffectiveKey = useCallback(() => {
    return ChordTransposer.getEffectiveKey(currentKey, capoPosition);
  }, [currentKey, capoPosition]);

  useEffect(() => {
    // Update loops when key or capo changes
    if (currentKey) {
      const effectiveKey = getEffectiveKey();
      loadLoopsForKey(effectiveKey);
    }
  }, [currentKey, capoPosition, loadLoopsForKey, getEffectiveKey]);


  const goToNextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      console.log(`Going to next song: ${currentSongIndex} -> ${currentSongIndex + 1}`);
      setCurrentSongIndex(currentSongIndex + 1);
      // Don't stop audio immediately - let the key change effect handle crossfading
    }
  };

  const goToPreviousSong = () => {
    if (currentSongIndex > 0) {
      console.log(`Going to previous song: ${currentSongIndex} -> ${currentSongIndex - 1}`);
      setCurrentSongIndex(currentSongIndex - 1);
      // Don't stop audio immediately - let the key change effect handle crossfading
    }
  };

  const togglePlayback = () => {
    if (!currentLoop) return;

    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = async () => {
    if (!currentLoop) return;

    try {
      const trackId = `${currentLoop.key}-${currentLoop.style}`;
      
      // Clear user pause flag when explicitly playing
      setUserPaused(false);
      
      if (enhancedAudioManager.hasActiveTrack()) {
        enhancedAudioManager.resume();
      } else {
        await enhancedAudioManager.play(currentLoop.filePath, trackId);
        enhancedAudioManager.setMasterVolume(volume);
      }
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const pauseAudio = () => {
    console.log('Pause button clicked, isPlaying:', isPlaying, 'hasPlayingTracks:', enhancedAudioManager.hasPlayingTracks());
    
    // Set user pause flag to prevent state sync from overriding
    setUserPaused(true);
    setIsPlaying(false);
    
    if (settings.autoStartLoops) {
      // Use fade out instead of hard stop - fade out ALL tracks
      enhancedAudioManager.fadeOutAll(settings.loopFadeOutDuration);
    } else {
      // Always pause immediately for non-auto-start mode
      enhancedAudioManager.pause();
    }
  };


  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    enhancedAudioManager.setMasterVolume(newVolume);
  };

  const transposeUp = () => {
    const newKey = ChordTransposer.transposeChordBySemitones(currentKey, 1);
    setCurrentKey(newKey);
    saveOverrides(newKey, capoPosition);
  };

  const transposeDown = () => {
    const newKey = ChordTransposer.transposeChordBySemitones(currentKey, -1);
    setCurrentKey(newKey);
    saveOverrides(newKey, capoPosition);
  };

  const capoUp = () => {
    if (capoPosition < 12) {
      const newCapo = capoPosition + 1;
      setCapoPosition(newCapo);
      saveOverrides(currentKey, newCapo);
    }
  };

  const capoDown = () => {
    if (capoPosition > 0) {
      const newCapo = capoPosition - 1;
      setCapoPosition(newCapo);
      saveOverrides(currentKey, newCapo);
    }
  };

  const saveOverrides = (key: string, capo: number) => {
    if (!currentSong) return;
    
    // Don't save if setlist has custom settings (setlist overrides take precedence)
    if (setlistSong?.customKey || setlistSong?.customCapo !== undefined) {
      console.log('Not saving overrides - setlist has custom settings');
      return;
    }
    
    // Check if values are different from original
    const isKeyDifferent = key !== currentSong.originalKey;
    const isCapoDifferent = capo !== (currentSong.capoPosition ?? 0);
    
    if (isKeyDifferent || isCapoDifferent) {
      // Save override
      SongOverrideStorage.set(
        currentSong.id,
        isKeyDifferent ? key : undefined,
        isCapoDifferent ? capo : undefined
      );
      console.log(`Saved override for ${currentSong.title}: key=${key}, capo=${capo}`);
    } else {
      // Remove override if back to original values
      SongOverrideStorage.remove(currentSong.id);
      console.log(`Removed override for ${currentSong.title} - back to original values`);
    }
  };

  const resetToOriginal = () => {
    const originalKey = setlistSong?.customKey || currentSong.originalKey;
    const originalCapo = setlistSong?.customCapo ?? currentSong.capoPosition ?? 0;
    setCurrentKey(originalKey);
    setCapoPosition(originalCapo);
    
    // Clear overrides if not using setlist custom settings
    if (!setlistSong?.customKey && !setlistSong?.customCapo) {
      SongOverrideStorage.remove(currentSong.id);
      console.log(`Cleared overrides for ${currentSong.title}`);
    }
  };

  if (!currentSong) {
    return (
      <div className={`performance-view flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <p className="text-muted-foreground">No songs in setlist</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Back to Setlists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`performance-view flex flex-col ${className}`}>
      {/* Header with navigation and controls (sticky, compact) */}
        <div className="performance-header fixed top-0 left-0 right-0 z-40 w-full bg-card/95 backdrop-blur border-b border-border">
          <div className="h-12 flex items-center gap-2 px-2">
            <button
              onClick={onBack}
              aria-label="Back"
              className="touch-target p-2 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 min-w-0 text-center">
              <div className="text-sm font-semibold text-foreground truncate">{currentSong.title}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {setlist.name} • {currentSongIndex + 1}/{songs.length}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousSong}
                disabled={currentSongIndex === 0}
                aria-label="Previous song"
                className="touch-target p-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={goToNextSong}
                disabled={currentSongIndex === songs.length - 1}
                aria-label="Next song"
                className="touch-target p-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => setShowTransposeControls(!showTransposeControls)}
                aria-label="Performance settings"
                className="touch-target p-2 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

        {/* Transpose controls */}
        {showTransposeControls && (
          <div className="p-3 bg-secondary border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm">
                <div className="font-medium">Chord Key: {currentKey}</div>
                <div className="text-muted-foreground">Effective Key: {getEffectiveKey()}</div>
              </div>
              <button
                onClick={resetToOriginal}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
            
            {/* Chord Transpose Controls */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={transposeDown}
                className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border"
              >
                ♭
              </button>
              <span className="text-sm text-muted-foreground flex-1 text-center">
                Transpose Chords
              </span>
              <button
                onClick={transposeUp}
                className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border"
              >
                ♯
              </button>
            </div>

            {/* Capo Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={capoDown}
                disabled={capoPosition === 0}
                className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="text-sm text-muted-foreground flex-1 text-center">
                Capo: {capoPosition}
              </span>
              <button
                onClick={capoUp}
                disabled={capoPosition >= 12}
                className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spacer to offset fixed header height */}
      <div className="h-12" />
      {/* Song content (no inner scroll; main handles scrolling) */}
      <div className="song-content flex-1 p-4 pt-2 performance-content-with-audio">
        <FullSongDisplay
          song={currentSong}
          currentKey={currentKey}
          capoPosition={capoPosition}
        />
      </div>

      <div className="h-12" />

      {/* Audio controls */}
      <div className="sticky-audio-controls p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              disabled={!currentLoop}
              className="touch-target p-3 bg-primary text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            {currentLoop && (
              <div className="text-sm">
                <p className="text-foreground font-medium">{currentLoop.style}</p>
                <p className="text-muted-foreground">Key: {currentLoop.key}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Volume2 size={16} className="text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20"
            />
          </div>
        </div>

        {!currentLoop && availableLoops.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            No backing tracks available for key {getEffectiveKey()}
          </p>
        )}
      </div>
    </div>
  );
};
