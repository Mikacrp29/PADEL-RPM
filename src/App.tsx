import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GroupProvider } from './contexts/GroupContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { CreateGroup } from './pages/CreateGroup';
import { JoinGroup } from './pages/JoinGroup';
import { GroupPage } from './pages/GroupPage';
import { Tutorial } from './pages/Tutorial';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <GroupProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateGroup />} />
              <Route path="/join" element={<JoinGroup />} />
              <Route path="/join/:code" element={<JoinGroup />} />
              <Route path="/g/:code" element={<GroupPage />} />
              <Route path="/tutoriel" element={<Tutorial />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </GroupProvider>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
