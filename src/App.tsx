import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GroupProvider } from './contexts/GroupContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Home } from './pages/Home';
import { CreateGroup } from './pages/CreateGroup';
import { JoinGroup } from './pages/JoinGroup';
import { GroupPage } from './pages/GroupPage';

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <GroupProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateGroup />} />
            <Route path="/join" element={<JoinGroup />} />
            <Route path="/join/:code" element={<JoinGroup />} />
            <Route path="/g/:code" element={<GroupPage />} />
          </Routes>
        </GroupProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
