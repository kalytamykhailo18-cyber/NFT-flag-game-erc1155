/**
 * Admin Index - Main admin layout with tab navigation
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  adminLogin,
  logout,
  fetchAdminData,
  selectAdminAuth,
  selectAdminStats,
  selectAdminLoading,
  selectAdminError,
} from '../../store/slices/adminSlice';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import CountriesTab from './CountriesTab';
import RegionsTab from './RegionsTab';
import MunicipalitiesTab from './MunicipalitiesTab';
import PlacesTab from './PlacesTab';
import SlicesTab from './SlicesTab';
import GeneratePlaceTab from './GeneratePlaceTab';

const AdminIndex = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectAdminAuth);
  const stats = useSelector(selectAdminStats);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAdminData());
    }
  }, [dispatch, isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', component: AdminDashboard },
    { id: 'countries', label: 'Countries', component: CountriesTab },
    { id: 'regions', label: 'Regions', component: RegionsTab },
    { id: 'municipalities', label: 'Municipalities', component: MunicipalitiesTab },
    { id: 'places', label: 'Places', component: PlacesTab },
    { id: 'slices', label: 'Slices', component: SlicesTab },
    { id: 'generate', label: 'Generate Place', component: GeneratePlaceTab },
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || AdminDashboard;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Admin Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Countries" value={stats.countries || 0} />
          <StatCard label="Regions" value={stats.regions || 0} />
          <StatCard label="Municipalities" value={stats.municipalities || 0} />
          <StatCard label="Places" value={stats.places || 0} />
          <StatCard label="Minted" value={stats.minted_places || 0} />
          <StatCard label="Slices" value={stats.slices || 0} />
          <StatCard label="Users" value={stats.users || 0} />
          <StatCard label="Active Auctions" value={stats.active_auctions || 0} />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-800 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <ActiveComponent />
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-dark-lighter border border-gray-800 rounded-lg p-4">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-gray-400 text-sm">{label}</div>
  </div>
);

export default AdminIndex;
