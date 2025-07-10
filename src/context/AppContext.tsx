import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { UserProgress } from '../types';

interface AppContextType {
  currentScreen: 'selection' | 'conversation' | 'progress';
  setCurrentScreen: (screen: 'selection' | 'conversation' | 'progress') => void;
  selectedDocument: string | null;
  setSelectedDocument: (documentId: string | null) => void;
  userProgress: UserProgress[];
  updateProgress: (progress: UserProgress) => void;
  currentStepId: string;
  setCurrentStepId: (stepId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<'selection' | 'conversation' | 'progress'>('selection');
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);

  const updateProgress = (progress: UserProgress) => {
    setUserProgress(prev => {
      const existing = prev.find(p => p.documentId === progress.documentId);
      if (existing) {
        return prev.map(p => p.documentId === progress.documentId ? progress : p);
      }
      return [...prev, progress];
    });
  };

  return (
    <AppContext.Provider value={{
      currentScreen,
      setCurrentScreen,
      selectedDocument,
      setSelectedDocument,
      userProgress,
      updateProgress,
      currentStepId,
      setCurrentStepId
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};