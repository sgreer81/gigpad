import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { SetlistManager } from './components/SetlistManager';
import { SetlistEditor } from './components/SetlistEditor';
import { PerformanceView } from './components/PerformanceView';
import { PerformancePrompt } from './components/PerformancePrompt';
import { SongsView } from './components/SongsView';
import { SettingsView } from './components/SettingsView';
import { SetlistProvider } from './contexts/SetlistContext';
import { Howler } from 'howler';
import { SettingsProvider } from './contexts/SettingsContext';
import { dataLoader } from './utils/dataLoader';
import { setlistStorage } from './utils/setlistStorage';
import type { Setlist, Song } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'setlists' | 'performance' | 'songs' | 'settings' | 'setlist-editor'>('setlists');
  const [currentSetlist, setCurrentSetlist] = useState<Setlist | null>(null);
  const [currentSongs, setCurrentSongs] = useState<Song[]>([]);
  const [lastSetlist, setLastSetlist] = useState<{ setlist: Setlist; songs: Song[] } | null>(null);
  const [editingSetlistId, setEditingSetlistId] = useState<string | null>(null);

  const handleBackToSetlists = () => {
    setCurrentView('setlists');
    setCurrentSetlist(null);
    setCurrentSongs([]);
  };

  const handleResumePerformance = async () => {
    if (lastSetlist) {
      try { await (Howler as unknown as { ctx?: AudioContext }).ctx?.resume?.(); } catch (e) { console.warn('Howler ctx resume failed on resume', e); }
      setCurrentSetlist(lastSetlist.setlist);
      setCurrentSongs(lastSetlist.songs);
      setCurrentView('performance');
    }
  };

  const handleEditSetlist = (setlistId: string) => {
    setEditingSetlistId(setlistId);
    setCurrentView('setlist-editor');
  };

  const handlePerformSetlist = async (setlistId: string) => {
    try {
      try { await (Howler as unknown as { ctx?: AudioContext }).ctx?.resume?.(); } catch (e) { console.warn('Howler ctx resume failed on setlist start', e); }
      // Load the setlist from localStorage
      const setlist = await setlistStorage.getSetlist(setlistId);
      if (!setlist) {
        console.error('Setlist not found:', setlistId);
        return;
      }

      // Load songs for the setlist
      const songs: Song[] = [];
      for (const setlistSong of setlist.songs.sort((a, b) => a.order - b.order)) {
        const song = await dataLoader.getSongById(setlistSong.songId);
        if (song) {
          songs.push(song);
        }
      }

      // Set up performance state
      setCurrentSetlist(setlist);
      setCurrentSongs(songs);
      setLastSetlist({ setlist, songs });
      setCurrentView('performance');
    } catch (error) {
      console.error('Error starting performance:', error);
    }
  };

  const handleBackToSetlistManager = () => {
    setCurrentView('setlists');
    setEditingSetlistId(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'setlists':
        return (
          <SetlistManager
            onEditSetlist={handleEditSetlist}
            onPerformSetlist={handlePerformSetlist}
          />
        );
      case 'setlist-editor':
        return (
          <SetlistEditor
            setlistId={editingSetlistId}
            onBack={handleBackToSetlistManager}
          />
        );
      case 'performance':
        if (currentSetlist && currentSongs.length > 0) {
          return (
            <PerformanceView
              setlist={currentSetlist}
              songs={currentSongs}
              onBack={handleBackToSetlists}
            />
          );
        }
        return (
          <PerformancePrompt 
            onSelectSetlist={() => setCurrentView('setlists')}
            onResumePerformance={lastSetlist ? handleResumePerformance : undefined}
            lastSetlist={lastSetlist}
          />
        );
      case 'songs':
        return <SongsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <SetlistManager
            onEditSetlist={handleEditSetlist}
            onPerformSetlist={handlePerformSetlist}
          />
        );
    }
  };

  return (
    <SettingsProvider>
      <SetlistProvider>
        <div className="app ios-safe-height flex flex-col bg-background text-foreground min-h-screen">
        {/* Main content area (single scroll container) */}
        <main className="flex-1 min-h-0 overflow-auto">
          {renderCurrentView()}
        </main>

        {/* Bottom navigation - hide when performing or editing setlists */}
        {!(currentView === 'performance' && currentSetlist && currentSongs.length > 0) && 
         currentView !== 'setlist-editor' && (
          <div className="sticky-bottom-nav">
            <Navigation
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
        )}
        </div>
      </SetlistProvider>
    </SettingsProvider>
  );
}

export default App;
