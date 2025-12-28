/**
 * RegionsTab - CRUD for regions
 */
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminData, selectAdminRegions, selectAdminCountries, selectAdminLoading } from '../../store/slices/adminSlice';
import api from '../../services/api';

const RegionsTab = () => {
  const dispatch = useDispatch();
  const regions = useSelector(selectAdminRegions);
  const countries = useSelector(selectAdminCountries);
  const loading = useSelector(selectAdminLoading);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', country_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filterCountry, setFilterCountry] = useState('');

  const apiKey = useSelector(state => state.admin.apiKey);

  const filteredRegions = filterCountry
    ? regions.filter(r => r.country_id === parseInt(filterCountry))
    : regions;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = { ...formData, country_id: parseInt(formData.country_id) };
      if (editingId) {
        await api.adminUpdateRegion(apiKey, editingId, data);
      } else {
        await api.adminCreateRegion(apiKey, data);
      }
      dispatch(fetchAdminData());
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (region) => {
    setFormData({ name: region.name, code: region.code || '', country_id: region.country_id.toString() });
    setEditingId(region.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this region?')) return;

    try {
      await api.adminDeleteRegion(apiKey, id);
      dispatch(fetchAdminData());
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', country_id: '' });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const getCountryName = (countryId) => {
    const country = countries.find(c => c.id === countryId);
    return country?.name || 'Unknown';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Regions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Region'}
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="px-4 py-2 bg-dark-lighter border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
        >
          <option value="">All Countries</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>{country.name}</option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Region' : 'Add Region'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Country</label>
                <select
                  value={formData.country_id}
                  onChange={(e) => setFormData({ ...formData, country_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Madrid"
                  required
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Code (optional)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., MAD"
                  maxLength={10}
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-dark-lighter rounded animate-pulse" />
          ))}
        </div>
      ) : filteredRegions.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-500 text-lg">No regions yet</div>
        </div>
      ) : (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Municipalities</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredRegions.map((region) => (
                <tr key={region.id} className="hover:bg-dark/50">
                  <td className="px-4 py-3 text-gray-400">{region.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{region.name}</td>
                  <td className="px-4 py-3 text-gray-400">{region.code || '-'}</td>
                  <td className="px-4 py-3 text-gray-400">{getCountryName(region.country_id)}</td>
                  <td className="px-4 py-3 text-gray-400">{region.municipality_count || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(region)}
                      className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(region.id)}
                      className="px-3 py-1 text-sm bg-red-600/20 text-red-400 rounded hover:bg-red-600/30 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegionsTab;
