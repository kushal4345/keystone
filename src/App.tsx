
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { HomePage } from '@/components/HomePage';
import { GraphPage } from '@/components/GraphPage';

/**
 * Main application component with routing
 */
function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-keystone-primary">
          <main className="h-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/graph/:documentId" element={<GraphPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;