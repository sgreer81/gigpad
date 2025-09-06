// Audio management utilities for backing track playback
export class AudioManager {
  private static instance: AudioManager;
  private currentAudio: HTMLAudioElement | null = null;
  private volume: number = 0.7;
  private isPlaying: boolean = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async play(filePath: string): Promise<void> {
    try {
      // Stop current audio if playing
      this.stop();

      // Create new audio element
      this.currentAudio = new Audio(filePath);
      this.currentAudio.loop = true;
      this.currentAudio.volume = this.volume;

      // Set up event listeners
      this.currentAudio.addEventListener('loadstart', () => {
        console.log('Audio loading started');
      });

      this.currentAudio.addEventListener('canplaythrough', () => {
        console.log('Audio can play through');
      });

      this.currentAudio.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        this.isPlaying = false;
      });

      this.currentAudio.addEventListener('ended', () => {
        this.isPlaying = false;
      });

      // Attempt to play
      await this.currentAudio.play();
      this.isPlaying = true;
      console.log('Audio playback started');
    } catch (error) {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
      
      // Handle common audio errors
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            throw new Error('Audio playback not allowed. User interaction required.');
          case 'NotSupportedError':
            throw new Error('Audio format not supported.');
          case 'AbortError':
            throw new Error('Audio playback aborted.');
          default:
            throw new Error(`Audio playback failed: ${error.message}`);
        }
      }
      throw error;
    }
  }

  pause(): void {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.isPlaying = false;
      console.log('Audio paused');
    }
  }

  resume(): void {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play()
        .then(() => {
          this.isPlaying = true;
          console.log('Audio resumed');
        })
        .catch((error) => {
          console.error('Error resuming audio:', error);
        });
    }
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPlaying = false;
      console.log('Audio stopped');
    }
  }

  setVolume(newVolume: number): void {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getCurrentTime(): number {
    return this.currentAudio?.currentTime ?? 0;
  }

  getDuration(): number {
    return this.currentAudio?.duration ?? 0;
  }

  // Test if audio can be played (for debugging)
  static async testAudioSupport(): Promise<boolean> {
    try {
      const audio = new Audio();
      const canPlayMp3 = audio.canPlayType('audio/mpeg') !== '';
      const canPlayWav = audio.canPlayType('audio/wav') !== '';
      const canPlayOgg = audio.canPlayType('audio/ogg') !== '';
      
      console.log('Audio support:', {
        mp3: canPlayMp3,
        wav: canPlayWav,
        ogg: canPlayOgg
      });
      
      return canPlayMp3 || canPlayWav || canPlayOgg;
    } catch (error) {
      console.error('Error testing audio support:', error);
      return false;
    }
  }

  // Create a simple tone for testing (when no audio files available)
  static createTestTone(frequency: number = 440, duration: number = 1): AudioBuffer | null {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const sampleRate = audioContext.sampleRate;
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < data.length; i++) {
        data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.1;
      }

      return buffer;
    } catch (error) {
      console.error('Error creating test tone:', error);
      return null;
    }
  }
}

export const audioManager = AudioManager.getInstance();
