// Enhanced audio management utilities with crossfading and auto-loop support
export interface AudioTrack {
  audio: HTMLAudioElement;
  volume: number;
  targetVolume: number;
  fadeDirection: 'in' | 'out' | 'none';
  fadeStartTime: number;
  fadeDuration: number;
}

export class EnhancedAudioManager {
  private static instance: EnhancedAudioManager;
  private tracks: Map<string, AudioTrack> = new Map();
  private masterVolume: number = 0.7;
  private isPlaying: boolean = false;
  private currentTrackId: string | null = null;
  private animationFrameId: number | null = null;

  private constructor() {
    this.startFadeLoop();
  }

  static getInstance(): EnhancedAudioManager {
    if (!EnhancedAudioManager.instance) {
      EnhancedAudioManager.instance = new EnhancedAudioManager();
    }
    return EnhancedAudioManager.instance;
  }

  private startFadeLoop(): void {
    const updateFades = () => {
      const now = Date.now();
      let hasActiveFades = false;

      // Use Array.from to avoid issues with Map modification during iteration
      const trackEntries = Array.from(this.tracks.entries());
      
      trackEntries.forEach(([trackId, track]) => {
        if (track.fadeDirection !== 'none') {
          const elapsed = now - track.fadeStartTime;
          const progress = Math.min(elapsed / track.fadeDuration, 1);

          // Calculate new volume with safety checks
          let newVolume = track.volume;
          if (track.fadeDirection === 'in') {
            newVolume = progress * track.targetVolume;
          } else if (track.fadeDirection === 'out') {
            newVolume = (1 - progress) * track.targetVolume;
          }

          // Ensure volume is finite and within valid range
          newVolume = Math.max(0, Math.min(1, newVolume));
          if (!isFinite(newVolume)) {
            console.warn(`Invalid volume calculated for track ${trackId}:`, newVolume);
            newVolume = 0;
          }

          track.volume = newVolume;
          const finalVolume = newVolume * this.masterVolume;
          
          // Additional safety check for final volume
          if (isFinite(finalVolume)) {
            track.audio.volume = finalVolume;
          } else {
            console.warn(`Invalid final volume for track ${trackId}:`, finalVolume);
            track.audio.volume = 0;
          }

          if (progress >= 1) {
            const wasFadingOut = track.fadeDirection === 'out';
            track.fadeDirection = 'none';
            if (wasFadingOut) {
              // Always stop tracks that have finished fading out
              this.stopTrack(trackId);
            }
          } else {
            hasActiveFades = true;
          }
        }
      });

      if (hasActiveFades || this.tracks.size > 0) {
        this.animationFrameId = requestAnimationFrame(updateFades);
      } else {
        this.animationFrameId = null;
      }
    };

    this.animationFrameId = requestAnimationFrame(updateFades);
  }

  async playWithCrossfade(
    filePath: string, 
    trackId: string, 
    crossfadeDuration: number = 1000
  ): Promise<void> {
    try {
      // Check if this exact track is already playing
      if (this.tracks.has(trackId)) {
        console.log(`Track ${trackId} is already playing, skipping`);
        return;
      }

      // Create new audio element
      const audio = new Audio(filePath);
      audio.loop = true;
      audio.volume = 0; // Start silent

      // Set up event listeners
      audio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        this.tracks.delete(trackId);
      });

      audio.addEventListener('ended', () => {
        this.tracks.delete(trackId);
      });

      // Start playing the new track
      await audio.play();

      // Create track object
      const newTrack: AudioTrack = {
        audio,
        volume: 0,
        targetVolume: 1,
        fadeDirection: crossfadeDuration > 0 ? 'in' : 'none',
        fadeStartTime: Date.now(),
        fadeDuration: Math.max(crossfadeDuration, 1), // Ensure minimum duration of 1ms
      };

      // Fade out ALL existing tracks (not just the current one)
      this.tracks.forEach((existingTrack, existingTrackId) => {
        if (existingTrackId !== trackId) { // Don't fade out the new track we're adding
          existingTrack.fadeDirection = 'out';
          existingTrack.fadeStartTime = Date.now();
          existingTrack.fadeDuration = Math.max(crossfadeDuration, 1); // Ensure minimum duration
          // Use current volume as target, but ensure it's valid
          existingTrack.targetVolume = isFinite(existingTrack.volume) ? existingTrack.volume : 1;
        }
      });

      // Add new track and set as current
      this.tracks.set(trackId, newTrack);
      this.currentTrackId = trackId;
      this.isPlaying = true;

      // If no crossfade, set volume immediately
      if (crossfadeDuration === 0) {
        newTrack.volume = 1;
        newTrack.audio.volume = this.masterVolume;
      }

      // Ensure fade loop is running
      if (!this.animationFrameId) {
        this.startFadeLoop();
      }

      console.log(`Audio crossfade started: ${trackId}, active tracks: ${this.tracks.size}`);
    } catch (error) {
      console.error('Error playing audio with crossfade:', error);
      throw error;
    }
  }

  async play(filePath: string, trackId: string = 'default'): Promise<void> {
    // Stop all existing tracks before playing new one
    this.stop();
    return this.playWithCrossfade(filePath, trackId, 0);
  }

  fadeOut(trackId: string, fadeDuration: number = 2000): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.fadeDirection = 'out';
      track.fadeStartTime = Date.now();
      track.fadeDuration = Math.max(fadeDuration, 1); // Ensure minimum duration
      // Ensure target volume is valid
      track.targetVolume = isFinite(track.volume) ? track.volume : 1;

      // Ensure fade loop is running
      if (!this.animationFrameId) {
        this.startFadeLoop();
      }
    }
  }

  fadeOutCurrent(fadeDuration: number = 2000): void {
    if (this.currentTrackId) {
      this.fadeOut(this.currentTrackId, fadeDuration);
      this.isPlaying = false;
    }
  }

  fadeOutAll(fadeDuration: number = 2000): void {
    console.log(`Fading out all tracks (${this.tracks.size} active)`);
    this.tracks.forEach((track, trackId) => {
      if (track.fadeDirection !== 'out') { // Don't restart fade if already fading out
        track.fadeDirection = 'out';
        track.fadeStartTime = Date.now();
        track.fadeDuration = Math.max(fadeDuration, 1);
        track.targetVolume = isFinite(track.volume) ? track.volume : 1;
        console.log(`Starting fade out for track: ${trackId}`);
      }
    });
    
    this.isPlaying = false;
    
    // Ensure fade loop is running
    if (!this.animationFrameId && this.tracks.size > 0) {
      this.startFadeLoop();
    }
  }

  private stopTrack(trackId: string): void {
    const track = this.tracks.get(trackId);
    if (track) {
      track.audio.pause();
      track.audio.currentTime = 0;
      this.tracks.delete(trackId);

      if (trackId === this.currentTrackId) {
        this.currentTrackId = null;
        this.isPlaying = false;
      }
      
      console.log(`Stopped track: ${trackId}, remaining tracks: ${this.tracks.size}`);
    }
  }

  stop(): void {
    this.tracks.forEach((_, trackId) => {
      this.stopTrack(trackId);
    });
    this.isPlaying = false;
    this.currentTrackId = null;
  }

  pause(): void {
    console.log(`Pausing ${this.tracks.size} tracks`);
    this.tracks.forEach((track, trackId) => {
      console.log(`Pausing track: ${trackId}, was paused: ${track.audio.paused}`);
      track.audio.pause();
    });
    this.isPlaying = false;
  }

  resume(): void {
    const promises: Promise<void>[] = [];
    this.tracks.forEach(track => {
      promises.push(
        track.audio.play().catch(error => {
          console.error('Error resuming audio:', error);
        })
      );
    });

    Promise.all(promises).then(() => {
      if (this.tracks.size > 0) {
        this.isPlaying = true;
      }
    });
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.tracks.forEach(track => {
      track.audio.volume = track.volume * this.masterVolume;
    });
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Check if any tracks are actually playing (not just paused)
  hasPlayingTracks(): boolean {
    let hasPlaying = false;
    this.tracks.forEach(track => {
      if (!track.audio.paused) {
        hasPlaying = true;
      }
    });
    return hasPlaying;
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  hasActiveTrack(): boolean {
    return this.tracks.size > 0;
  }

  // Clean up resources
  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.stop();
  }
}

export const enhancedAudioManager = EnhancedAudioManager.getInstance();
