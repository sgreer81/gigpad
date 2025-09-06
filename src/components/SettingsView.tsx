import React from 'react';
import { Moon, Sun, Palette, Info, Github } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsViewProps {
  className?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`settings-view p-4 ${className}`}>
      <div className="header mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Customize your performance experience</p>
      </div>

      <div className="settings-sections space-y-6">
        {/* Appearance Section */}
        <div className="settings-section">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Palette size={20} />
            Appearance
          </h2>
          
          <div className="settings-items space-y-4">
            {/* Theme Toggle */}
            <div className="setting-item bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                  <div>
                    <h3 className="font-medium text-foreground">Theme</h3>
                    <p className="text-sm text-muted-foreground">
                      {theme === 'dark' ? 'Dark mode' : 'Light mode'} - Perfect for {theme === 'dark' ? 'low-light performance environments' : 'bright venues'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${
                    theme === 'dark' 
                      ? 'bg-blue-600 focus:ring-blue-500' 
                      : 'bg-gray-300 focus:ring-gray-400'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-all duration-200 shadow-sm ${
                      theme === 'dark' 
                        ? 'translate-x-6 bg-white' 
                        : 'translate-x-1 bg-white'
                    }`}
                  />
                  {/* Theme icons inside the toggle */}
                  <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
                    <Sun 
                      size={12} 
                      className={`transition-opacity duration-200 ${
                        theme === 'light' ? 'opacity-60 text-gray-600' : 'opacity-30 text-gray-400'
                      }`} 
                    />
                    <Moon 
                      size={12} 
                      className={`transition-opacity duration-200 ${
                        theme === 'dark' ? 'opacity-60 text-blue-200' : 'opacity-30 text-gray-400'
                      }`} 
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Section */}
        <div className="settings-section">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Info size={20} />
            Performance Tips
          </h2>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="space-y-3 text-sm">
              <div className="tip-item">
                <h4 className="font-medium text-foreground">🎸 Dark Mode Benefits</h4>
                <p className="text-muted-foreground">Reduces eye strain during long performances and works better in dimly lit venues.</p>
              </div>
              
              <div className="tip-item">
                <h4 className="font-medium text-foreground">📱 PWA Installation</h4>
                <p className="text-muted-foreground">Install this app to your home screen for the best performance experience.</p>
              </div>
              
              <div className="tip-item">
                <h4 className="font-medium text-foreground">🔄 Offline Mode</h4>
                <p className="text-muted-foreground">All your setlists and songs work offline - perfect for venues with poor WiFi.</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="settings-section">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Github size={20} />
            About
          </h2>
          
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">App Name</span>
                <span className="text-foreground font-medium">GigPad</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Optimized for</span>
                <span className="text-foreground font-medium">iPad & Touch Devices</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Built with ❤️ for musicians who perform live
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="settings-section">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                if ('serviceWorker' in navigator) {
                  caches.keys().then(cacheNames => {
                    Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
                      .then(() => {
                        alert('Cache cleared! Refresh the page to reload fresh content.');
                      });
                  });
                }
              }}
              className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-center"
            >
              <div className="text-sm font-medium">Clear Cache</div>
              <div className="text-xs text-muted-foreground mt-1">Refresh app data</div>
            </button>
            
            <button
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({
                    title: 'GigPad - Live Guitar Performance',
                    text: 'Check out GigPad - the ultimate digital companion for live guitar gigs!',
                    url: url
                  });
                } else {
                  navigator.clipboard.writeText(url);
                  alert('App URL copied to clipboard!');
                }
              }}
              className="p-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-center"
            >
              <div className="text-sm font-medium">Share App</div>
              <div className="text-xs text-muted-foreground mt-1">Tell other musicians</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
