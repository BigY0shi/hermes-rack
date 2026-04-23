import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="launch-systems" element={<Home />} />
        <Route path="operating-systems" element={<Home />} />
        <Route path="growth-systems" element={<Home />} />
        <Route path="intelligence-systems" element={<Home />} />
        <Route path="method" element={<Home />} />
        <Route path="clients" element={<Home />} />
        <Route path="settings" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;