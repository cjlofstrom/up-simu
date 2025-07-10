import { AppProvider, useApp } from './context/AppContext';
import { DocumentSelection } from './screens/DocumentSelection';
import { ConversationInterface } from './screens/ConversationInterface';
import { ProgressTracking } from './screens/ProgressTracking';

function AppContent() {
  const { currentScreen } = useApp();

  return (
    <>
      {currentScreen === 'selection' && <DocumentSelection />}
      {currentScreen === 'conversation' && <ConversationInterface />}
      {currentScreen === 'progress' && <ProgressTracking />}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;