import React from 'react';
import type { ChordLyricLine } from '../types';
import { ChordTransposer } from '../utils/chordTransposer';

interface ChordLyricDisplayProps {
  line: ChordLyricLine;
  originalKey: string;
  currentKey: string;
  className?: string;
}

export const ChordLyricDisplay: React.FC<ChordLyricDisplayProps> = ({
  line,
  originalKey,
  currentKey,
  className = ''
}) => {
  // Transpose chords if key has changed (capo doesn't affect chord display)
  const transposedChords = line.chords.map(chordPos => ({
    ...chordPos,
    chord: ChordTransposer.transposeChord(
      chordPos.chord,
      originalKey,
      currentKey,
      0 // Don't include capo in chord transposition - it only affects effective key
    )
  }));

  // Create an array to hold the rendered content
  const renderContent = () => {
    const lyrics = line.lyrics;
    const chords = transposedChords;
    
    if (chords.length === 0) {
      return (
        <div className="lyrics-line">
          <div className="chord-line h-6"></div>
          <div className="lyrics text-foreground">{lyrics}</div>
        </div>
      );
    }

    // Check if this is an instrumental/chord-only line (mostly spaces or empty)
    const isInstrumental = lyrics.trim().length === 0 || lyrics.match(/^\s*$/);
    
    if (isInstrumental) {
      // For instrumental sections, display chords with proper spacing
      return (
        <div className="lyrics-line">
          <div className="chord-line h-6 text-sm font-mono font-bold text-primary flex gap-4">
            {chords.map((chordPos, index) => (
              <span key={index} className="chord">
                {chordPos.chord}
              </span>
            ))}
          </div>
          <div className="lyrics text-foreground text-muted-foreground text-sm italic">
            {lyrics.trim() === '' ? '(instrumental)' : lyrics}
          </div>
        </div>
      );
    }

    // Sort chords by position
    const sortedChords = [...chords].sort((a, b) => a.position - b.position);
    
    // Build segments for proper chord/lyric alignment
    const segments: Array<{ text: string; chord?: string; width: number }> = [];
    let lastPosition = 0;

    sortedChords.forEach((chordPos, index) => {
      // Add text before this chord
      if (chordPos.position > lastPosition) {
        const text = lyrics.substring(lastPosition, chordPos.position);
        segments.push({
          text,
          width: text.length
        });
      }
      
      // Add the chord with text at this position
      const nextChordPos = sortedChords[index + 1]?.position ?? lyrics.length;
      const text = lyrics.substring(chordPos.position, nextChordPos);
      const chordWidth = chordPos.chord.length;
      const textWidth = text.length;
      
      segments.push({
        text,
        chord: chordPos.chord,
        width: Math.max(chordWidth, textWidth)
      });
      
      lastPosition = nextChordPos;
    });

    // Add any remaining text
    if (lastPosition < lyrics.length) {
      const text = lyrics.substring(lastPosition);
      segments.push({
        text,
        width: text.length
      });
    }

    return (
      <div className="lyrics-line">
        <div className="chord-line h-6 text-sm font-mono font-bold text-primary flex">
          {segments.map((segment, index) => (
            <div key={index} className="relative" style={{ minWidth: `${segment.width}ch` }}>
              {segment.chord && (
                <div className="absolute top-0 left-0 text-primary">
                  {segment.chord}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="lyrics text-foreground leading-relaxed font-mono flex">
          {segments.map((segment, index) => (
            <div key={index} style={{ minWidth: `${segment.width}ch` }}>
              {segment.text}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`chord-lyric-line mb-2 ${className}`}>
      {renderContent()}
    </div>
  );
};

interface SongSectionDisplayProps {
  section: {
    type: string;
    name?: string;
    content: ChordLyricLine[];
  };
  originalKey: string;
  currentKey: string;
  className?: string;
}

export const SongSectionDisplay: React.FC<SongSectionDisplayProps> = ({
  section,
  originalKey,
  currentKey,
  className = ''
}) => {
  const getSectionTypeColor = (type: string) => {
    switch (type) {
      case 'verse': return 'text-blue-600 dark:text-blue-400';
      case 'chorus': return 'text-green-600 dark:text-green-400';
      case 'bridge': return 'text-purple-600 dark:text-purple-400';
      case 'intro': return 'text-gray-600 dark:text-gray-400';
      case 'outro': return 'text-gray-600 dark:text-gray-400';
      default: return 'text-foreground';
    }
  };

  return (
    <div className={`song-section mb-8 ${className}`}>
      {section.name && (
        <h3 className={`section-header text-sm font-semibold uppercase tracking-wide mb-3 ${getSectionTypeColor(section.type)}`}>
          {section.name}
        </h3>
      )}
      <div className="section-content space-y-1">
        {section.content.map((line, index) => (
          <ChordLyricDisplay
            key={index}
            line={line}
            originalKey={originalKey}
            currentKey={currentKey}
          />
        ))}
      </div>
    </div>
  );
};

interface FullSongDisplayProps {
  song: {
    title: string;
    artist: string;
    originalKey: string;
    sections: Array<{
      type: string;
      name?: string;
      content: ChordLyricLine[];
    }>;
  };
  currentKey?: string;
  capoPosition?: number;
  className?: string;
}

export const FullSongDisplay: React.FC<FullSongDisplayProps> = ({
  song,
  currentKey,
  capoPosition = 0,
  className = ''
}) => {
  const displayKey = currentKey || song.originalKey;

  return (
    <div className={`song-display ${className}`}>
      <div className="song-header mb-6 pb-4 border-b border-border">
        <h1 className="song-title text-2xl font-bold text-foreground mb-1">
          {song.title}
        </h1>
        <p className="song-artist text-lg text-muted-foreground mb-2">
          {song.artist}
        </p>
        <div className="song-meta flex gap-4 text-sm text-muted-foreground">
          <span>Key: {displayKey}</span>
          {capoPosition > 0 && <span>Capo: {capoPosition}</span>}
          {currentKey && currentKey !== song.originalKey && (
            <span className="text-primary">Transposed from {song.originalKey}</span>
          )}
        </div>
      </div>
      
      <div className="song-sections">
        {song.sections.map((section, index) => (
          <SongSectionDisplay
            key={index}
            section={section}
            originalKey={song.originalKey}
            currentKey={displayKey}
          />
        ))}
      </div>
    </div>
  );
};
