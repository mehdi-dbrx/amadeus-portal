import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { LandingPage } from './pages/LandingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<LandingPage />} />
      </Route>
    </Routes>
  );
}
