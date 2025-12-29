/**
 * AdminLogin - Admin authentication page
 */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin, selectAdminLoading, selectAdminError } from '../../store/slices/adminSlice';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);

  const [apiKey, setApiKey] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    dispatch(adminLogin(apiKey));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-dark-lighter border border-gray-800 rounded-lg p-8">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Admin Login</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-200 text-sm mb-2">Admin API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your admin key"
              className="w-full px-4 py-3 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !apiKey.trim()}
            className="w-full py-3 bg-primary text-white rounded font-semibold hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
