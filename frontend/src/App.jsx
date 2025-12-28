import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Countries from './pages/Countries';
import Regions from './pages/Regions';
import Municipalities from './pages/Municipalities';
import Places from './pages/Places';
import PlaceDetail from './pages/PlaceDetail';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import Rankings from './pages/Rankings';
import Profile from './pages/Profile';
import Admin from './pages/admin';

function App() {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/countries/:countryId/regions" element={<Regions />} />
          <Route path="/regions/:regionId/municipalities" element={<Municipalities />} />
          <Route path="/municipalities/:municipalityId/places" element={<Places />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:id" element={<PlaceDetail />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auctions/:id" element={<AuctionDetail />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
