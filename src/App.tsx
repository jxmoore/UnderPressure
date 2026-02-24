import { useState, useEffect } from 'react';
import { parseISO, compareAsc } from 'date-fns';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { UserData, Theme, BloodPressureEntry } from './types';
import Sidebar from './components/Sidebar';
import LogEntryModal from './components/LogEntryModal';
import Onboarding from './views/Onboarding';
import Dashboard from './views/Dashboard';
import HistoryView from './views/HistoryView';
import Visualizations from './views/Visualizations';
import { decodeState, getShareUrl } from './utils/share';

function App() {
  const [userData, setUserData] = useLocalStorage<UserData | null>('underpressure_user', null);
  const [theme, setTheme] = useLocalStorage<Theme>('underpressure_theme', 'light');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<BloodPressureEntry | null>(null);
  const [activeViz, setActiveViz] = useState<string | null>(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Check for shared data in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');

    if (sharedData) {
      const decoded = decodeState(sharedData);
      if (decoded) {
        const confirmImport = window.confirm(
          `This link contains blood pressure data shared by ${decoded.userData.name}. \n\nWarning: Importing this data will OVERWRITE your current data. Do you want to proceed?`
        );

        if (confirmImport) {
          setUserData(decoded.userData);
          setTheme(decoded.theme);
          // Clear the data parameter from URL
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete('data');
          window.history.replaceState({}, '', newUrl.toString());
        }
      }
    }
  }, []);

  const handleOnboardingComplete = (name: string) => {
    setUserData({
      name,
      entries: [],
    });
  };

  const handleLogout = () => {
    setUserData(null);
    setActiveViz(null);
  };

  const handleSaveEntry = (entry: Omit<BloodPressureEntry, 'id' | 'timestamp'> & { id?: string, timestamp?: string }) => {
    if (!userData) return;

    let updatedEntries: BloodPressureEntry[];

    if (entry.id) {
      // Editing existing entry
      updatedEntries = userData.entries.map(e => e.id === entry.id ? (entry as BloodPressureEntry) : e);
    } else {
      // Adding new entry
      const newEntry: BloodPressureEntry = {
        ...entry as Omit<BloodPressureEntry, 'id' | 'timestamp'>,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      };
      updatedEntries = [...userData.entries, newEntry];
    }

    // Sort entries by timestamp
    updatedEntries.sort((a, b) => compareAsc(parseISO(a.timestamp), parseISO(b.timestamp)));

    setUserData({
      ...userData,
      entries: updatedEntries,
    });
  };

  const handleDeleteEntry = (id: string) => {
    if (!userData) return;
    setUserData({
      ...userData,
      entries: userData.entries.filter(e => e.id !== id),
    });
  };

  const handleEditEntry = (entry: BloodPressureEntry) => {
    setEntryToEdit(entry);
    setIsLogModalOpen(true);
  };

  const handleShare = () => {
    if (!userData) return;
    const shareUrl = getShareUrl(userData, theme);
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Share link copied to clipboard! You can now send this link to others.');
    }).catch(err => {
      console.error('Failed to copy share link:', err);
      alert('Failed to copy share link. Please try again.');
    });
  };

  if (!userData) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app-container">
      <Sidebar
        theme={theme}
        userName={userData.name}
        toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        onLogout={handleLogout}
        onAddEntry={() => setIsLogModalOpen(true)}
        onNavigateHome={() => setActiveViz(null)}
        onShare={handleShare}
      />

      <main className="main-content">
        {activeViz === 'history' ? (
          <HistoryView
            entries={userData.entries}
            onBack={() => setActiveViz(null)}
            onDeleteEntry={handleDeleteEntry}
            onEditEntry={handleEditEntry}
          />
        ) : activeViz ? (
          <Visualizations
            entries={userData.entries}
            type={activeViz}
            onBack={() => setActiveViz(null)}
          />
        ) : (
          <Dashboard
            entries={userData.entries}
            onMetricClick={(vizType) => setActiveViz(vizType)}
          />
        )}
      </main>

      <LogEntryModal
        isOpen={isLogModalOpen}
        entryToEdit={entryToEdit || undefined}
        onClose={() => {
          setIsLogModalOpen(false);
          setEntryToEdit(null);
        }}
        onSave={handleSaveEntry}
      />
    </div>
  );
}

export default App;
