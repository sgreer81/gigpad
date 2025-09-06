import type { Song, SongSection, ChordLyricLine, ChordPosition } from '../types';

export interface ChordProMetadata {
  title?: string;
  artist?: string;
  key?: string;
  originalKey?: string;
  capo?: number;
  tempo?: number;
  notes?: string;
  scriptureReference?: string;
  book?: string;
}

export class ChordProParser {
  static parseChordPro(content: string, id: string): Song {
    const lines = content.split('\n');
    const metadata: ChordProMetadata = {};
    const sections: SongSection[] = [];
    let currentSection: SongSection | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      // Parse metadata directives
      if (line.startsWith('{') && line.endsWith('}')) {
        this.parseDirective(line, metadata);
        continue;
      }
      
      // Parse section headers (Verse 1:, Chorus:, etc.)
      if (line.endsWith(':') && !this.containsChords(line)) {
        // Check if this is a section header (not metadata)
        const lowerLine = line.toLowerCase();
        const isSectionHeader = lowerLine.includes('verse') || 
                               lowerLine.includes('chorus') || 
                               lowerLine.includes('bridge') || 
                               lowerLine.includes('intro') || 
                               lowerLine.includes('outro') || 
                               lowerLine.includes('tag');
        
        if (isSectionHeader) {
          if (currentSection) {
            sections.push(currentSection);
          }
          currentSection = this.createSection(line);
          continue;
        } else {
          // This is metadata (Title:, Artist:, etc.)
          this.parseHeaderMetadata(line, metadata);
          continue;
        }
      }
      
      // Parse metadata from header format that doesn't end with colon
      if (line.includes(':') && !this.containsChords(line) && !line.endsWith(':')) {
        this.parseHeaderMetadata(line, metadata);
        continue;
      }
      
      // Parse chord/lyric lines
      if (currentSection && (this.containsChords(line) || line.length > 0)) {
        const chordLyricLine = this.parseChordLyricLine(line);
        if (chordLyricLine) {
          currentSection.content.push(chordLyricLine);
        }
      }
    }
    
    // Add the last section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return {
      id,
      title: metadata.title || 'Unknown Title',
      artist: metadata.artist || 'Unknown Artist',
      originalKey: metadata.originalKey || metadata.key || 'C',
      capoPosition: metadata.capo || 0,
      tempo: metadata.tempo,
      sections,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: []
      }
    };
  }
  
  static parseDirective(line: string, metadata: ChordProMetadata): void {
    const directive = line.slice(1, -1); // Remove { and }
    const [key, ...valueParts] = directive.split(':');
    const value = valueParts.join(':').trim();
    
    switch (key.toLowerCase()) {
      case 't':
      case 'title':
        metadata.title = value;
        break;
      case 'artist':
      case 'a':
        metadata.artist = value;
        break;
      case 'key':
        // Remove brackets if present (e.g., "[G]" -> "G")
        metadata.key = value.replace(/^\[|\]$/g, '');
        break;
      case 'capo':
        metadata.capo = parseInt(value, 10);
        break;
      case 'tempo':
        metadata.tempo = parseInt(value, 10);
        break;
    }
  }
  
  static parseHeaderMetadata(line: string, metadata: ChordProMetadata): void {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.substring(0, colonIndex).trim().toLowerCase();
    const value = line.substring(colonIndex + 1).trim();
    
    switch (key) {
      case 'title':
        metadata.title = value;
        break;
      case 'artist':
        metadata.artist = value;
        break;
      case 'key':
        // Remove brackets if present (e.g., "[G]" -> "G")
        metadata.key = value.replace(/^\[|\]$/g, '');
        break;
      case 'original key':
        metadata.originalKey = value;
        break;
      case 'capo':
        metadata.capo = parseInt(value, 10);
        break;
      case 'tempo':
        metadata.tempo = parseInt(value, 10);
        break;
      case 'notes':
        metadata.notes = value;
        break;
      case 'scripture reference(s)':
        metadata.scriptureReference = value;
        break;
      case 'book':
        metadata.book = value;
        break;
    }
  }
  
  static createSection(line: string): SongSection {
    const name = line.slice(0, -1).trim(); // Remove the colon
    let type: SongSection['type'] = 'verse';
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('chorus')) {
      type = 'chorus';
    } else if (lowerName.includes('bridge')) {
      type = 'bridge';
    } else if (lowerName.includes('intro')) {
      type = 'intro';
    } else if (lowerName.includes('outro') || lowerName.includes('tag')) {
      type = 'outro';
    }
    
    return {
      type,
      name,
      content: []
    };
  }
  
  static containsChords(line: string): boolean {
    return /\[[^\]]+\]/.test(line);
  }
  
  static parseChordLyricLine(line: string): ChordLyricLine | null {
    if (!line.trim()) return null;
    
    const chords: ChordPosition[] = [];
    let lyrics = '';
    let position = 0;
    
    // If the line contains chords in brackets
    if (this.containsChords(line)) {
      const parts = line.split(/(\[[^\]]+\])/);
      
      for (const part of parts) {
        if (part.startsWith('[') && part.endsWith(']')) {
          // This is a chord
          const chord = part.slice(1, -1); // Remove brackets
          chords.push({ chord, position });
        } else {
          // This is lyrics
          lyrics += part;
          position += part.length;
        }
      }
    } else {
      // Line with no chords (just lyrics)
      lyrics = line;
    }
    
    return { lyrics, chords };
  }
  
  static songToChordPro(song: Song): string {
    let output = '';
    
    // Add metadata
    output += `Title: ${song.title}\n`;
    output += `Artist: ${song.artist}\n`;
    output += `Key: [${song.originalKey}]\n`;
    output += `Original Key: ${song.originalKey}\n`;
    if (song.capoPosition) {
      output += `Capo: ${song.capoPosition}\n`;
    }
    if (song.tempo) {
      output += `Tempo: ${song.tempo}\n`;
    }
    output += '\n';
    
    // Add sections
    for (const section of song.sections) {
      output += `${section.name || section.type}:\n`;
      
      for (const line of section.content) {
        if (line.chords.length === 0) {
          output += `${line.lyrics}\n`;
        } else {
          let chordLine = '';
          let currentPos = 0;
          
          // Sort chords by position
          const sortedChords = [...line.chords].sort((a, b) => a.position - b.position);
          
          for (const chordPos of sortedChords) {
            // Add lyrics up to this chord position
            chordLine += line.lyrics.substring(currentPos, chordPos.position);
            // Add the chord
            chordLine += `[${chordPos.chord}]`;
            currentPos = chordPos.position;
          }
          
          // Add remaining lyrics
          chordLine += line.lyrics.substring(currentPos);
          output += `${chordLine}\n`;
        }
      }
      
      output += '\n';
    }
    
    return output;
  }
}
