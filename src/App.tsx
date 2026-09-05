import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { GroupProvider } from './contexts/GroupContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

import { Home } from './pages/Home';

const CreateGroup = lazy(() =>
  import('./pages/CreateGroup').then((m) => ({
    default: m.CreateGroup,
  }))
);

const JoinGroup = lazy(() =>
  import('./pages/JoinGroup').then((m) => ({
    default: m.JoinGroup,
  }))
);

const GroupPage = lazy(() =>
  import('./pages/GroupPage').then((m) => ({
    default: m.GroupPage,
  }))
);

const Tutorial = lazy(() =>
  import('./pages/Tutorial').then((m) => ({
    default: m.Tutorial,
  }))
);

const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({
    default: m.AdminPage,
  }))
);

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <GroupProvider>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<CreateGroup />} />
                <Route path="/join" element={<JoinGroup />} />
                <Route path="/join/:code" element={<JoinGroup />} />
                <Route path="/g/:code" element={<GroupPage />} />
                <Route path="/tutoriel" element={<Tutorial />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </Suspense>
          </GroupProvider>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;