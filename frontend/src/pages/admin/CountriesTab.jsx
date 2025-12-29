/**
 * CountriesTab - CRUD for countries
 */
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminData, selectAdminCountries, selectAdminLoading, selectAdminApiKey } from '../../store/slices/adminSlice';
import api from '../../services/api';

const CountriesTab = () => {
  const dispatch = useDispatch();
  const countries = useSelector(selectAdminCountries);
  const loading = useSelector(selectAdminLoading);
  const apiKey = useSelector(selectAdminApiKey);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingId) {
        await api.adminUpdateCountry(apiKey, editingId, formData);
      } else {
        await api.adminCreateCountry(apiKey, formData);
      }
      dispatch(fetchAdminData());
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (country) => {
    setFormData({ name: country.name, code: country.code });
    setEditingId(country.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this country?')) return;

    try {
      await api.adminDeleteCountry(apiKey, id);
      dispatch(fetchAdminData());
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '' });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Countries</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Country'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Country' : 'Add Country'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-200 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Spain"
                  required
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-200 text-sm mb-2">Code (2-3 letters)</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., ES"
                  maxLength={3}
                  required
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
      ) : countries.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-300 text-lg">No countries yet</div>
        </div>
      ) : (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-200 uppercase">Regions</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-200 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {countries.map((country) => (
                <tr key={country.id} className="hover:bg-dark/50">
                  <td className="px-4 py-3 text-gray-200">{country.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{country.name}</td>
                  <td className="px-4 py-3 text-gray-200">{country.code}</td>
                  <td className="px-4 py-3 text-gray-200">{country.region_count || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(country)}
                      className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(country.id)}
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

export default CountriesTab;
