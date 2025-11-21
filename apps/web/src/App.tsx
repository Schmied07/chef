import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import EditorPage from './pages/EditorPage';
import HomePage from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
