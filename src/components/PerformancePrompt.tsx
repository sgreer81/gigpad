import React from 'react';
import { Music, ArrowRight, Play } from 'lucide-react';
import type { Setlist, Song } from '../types';

interface PerformancePromptProps {
  onSelectSetlist: () => void;
  onResumePerformance?: () => void;
  lastSetlist?: { setlist: Setlist; songs: Song[] } | null;
  className?: string;
}

export const PerformancePrompt: React.FC<PerformancePromptProps> = ({
  onSelectSetlist,
  onResumePerformance,
  lastSetlist,
  className = ''
}) => {
  return (
    <div className={`performance-prompt flex items-center justify-center h-full p-8 ${className}`}>
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Music className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Ready to Perform?
        </h1>
        
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {lastSetlist 
            ? "Resume your last performance or choose a different setlist."
            : "To start performing, you'll need to select a setlist first. Choose from your saved setlists or create a new one."
          }
        </p>
        
        <div className="space-y-4">
          {lastSetlist && onResumePerformance && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Last performed:</p>
              <p className="font-semibold text-foreground mb-3">{lastSetlist.setlist.name}</p>
              <button
                onClick={onResumePerformance}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium w-full justify-center"
              >
                <Play size={16} />
                <span>Resume Performance</span>
              </button>
            </div>
          )}
          
          <button
            onClick={onSelectSetlist}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium w-full justify-center"
          >
            <span>{lastSetlist ? 'Choose Different Setlist' : 'Choose Setlist'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
        
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">💡 Quick Tip</p>
          <p>
            Once you select a setlist, you can navigate between songs, 
            transpose keys on-the-fly, and control backing tracks during your performance.
          </p>
        </div>
      </div>
    </div>
  );
};
