import React, { useState, useEffect } from 'react';
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
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentKey, setCurrentKey] = useState<string>('');
  const [capoPosition, setCapoPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [availableLoops, setAvailableLoops] = useState<LoopTrack[]>([]);
  const [currentLoop, setCurrentLoop] = useState<LoopTrack | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [showTransposeControls, setShowTransposeControls] = useState(false);

  const currentSong = songs[currentSongIndex];
  const setlistSong = setlist.songs.find(s => s.songId === currentSong?.id);

  useEffect(() => {
    if (currentSong) {
      // Set initial key (custom key from setlist or original key)
      const initialKey = setlistSong?.customKey || currentSong.originalKey;
      setCurrentKey(initialKey);
      
      // Set initial capo position
      const initialCapo = setlistSong?.customCapo ?? currentSong.capoPosition ?? 0;
      setCapoPosition(initialCapo);

      // Load available loops for this key
      loadLoopsForKey(initialKey);
    }
  }, [currentSong, setlistSong]);

  useEffect(() => {
    // Update loops when key changes
    if (currentKey) {
      loadLoopsForKey(currentKey);
    }
  }, [currentKey]);

  const loadLoopsForKey = async (key: string) => {
    try {
      const loops = await dataLoader.getLoopsByKey(key);
      setAvailableLoops(loops);
      
      // Auto-select first available loop
      if (loops.length > 0 && !currentLoop) {
        setCurrentLoop(loops[0]);
      }
    } catch (error) {
      console.error('Error loading loops:', error);
    }
  };

  const goToNextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      stopAudio();
    }
  };

  const goToPreviousSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      stopAudio();
    }
  };

  const togglePlayback = () => {
    if (!currentLoop) return;

    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  const playAudio = () => {
    if (!currentLoop) return;

    try {
      if (audio) {
        audio.pause();
      }

      const newAudio = new Audio(currentLoop.filePath);
      newAudio.loop = true;
      newAudio.volume = volume;
      
      newAudio.play().then(() => {
        setIsPlaying(true);
        setAudio(newAudio);
      }).catch((error) => {
        console.error('Error playing audio:', error);
      });
    } catch (error) {
      console.error('Error creating audio:', error);
    }
  };

  const stopAudio = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const transposeUp = () => {
    const newKey = ChordTransposer.transposeChordBySemitones(currentKey, 1);
    setCurrentKey(newKey);
  };

  const transposeDown = () => {
    const newKey = ChordTransposer.transposeChordBySemitones(currentKey, -1);
    setCurrentKey(newKey);
  };

  const resetToOriginal = () => {
    const originalKey = setlistSong?.customKey || currentSong.originalKey;
    const originalCapo = setlistSong?.customCapo ?? currentSong.capoPosition ?? 0;
    setCurrentKey(originalKey);
    setCapoPosition(originalCapo);
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
    <div className={`performance-view ios-safe-height flex flex-col ${className}`}>
      {/* Header with navigation and controls */}
      <div className="performance-header bg-card border-b border-border p-4 safe-area-top">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="touch-target flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h2 className="font-semibold text-foreground">{setlist.name}</h2>
            <p className="text-sm text-muted-foreground">
              {currentSongIndex + 1} of {songs.length}
            </p>
          </div>

          <button
            onClick={() => setShowTransposeControls(!showTransposeControls)}
            className="touch-target text-muted-foreground hover:text-foreground"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Song navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousSong}
            disabled={currentSongIndex === 0}
            className="touch-target p-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="text-center flex-1 mx-4">
            <h1 className="text-lg font-bold text-foreground">{currentSong.title}</h1>
            <p className="text-sm text-muted-foreground">{currentSong.artist}</p>
          </div>

          <button
            onClick={goToNextSong}
            disabled={currentSongIndex === songs.length - 1}
            className="touch-target p-2 rounded-lg bg-secondary text-secondary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Transpose controls */}
        {showTransposeControls && (
          <div className="mt-4 p-4 bg-secondary rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Key: {currentKey}</span>
              <button
                onClick={resetToOriginal}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={transposeDown}
                className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border"
              >
                ♭
              </button>
              <span className="text-sm text-muted-foreground flex-1 text-center">
                Transpose
              </span>
              <button
                onClick={transposeUp}
                className="touch-target px-3 py-1 bg-background text-foreground rounded border border-border"
              >
                ♯
              </button>
            </div>
            {capoPosition > 0 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Capo: {capoPosition}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Song content */}
      <div className="song-content flex-1 overflow-y-auto p-4 performance-content-with-audio">
        <FullSongDisplay
          song={currentSong}
          currentKey={currentKey}
          capoPosition={capoPosition}
        />
      </div>

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
            No backing tracks available for key {currentKey}
          </p>
        )}
      </div>
    </div>
  );
};
