import { MapProvider } from './context/MapContext';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <MapProvider>
      <MainLayout />
    </MapProvider>
  );
}

export default App;