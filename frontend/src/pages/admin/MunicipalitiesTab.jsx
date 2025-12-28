/**
 * MunicipalitiesTab - CRUD for municipalities
 */
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminData, selectAdminMunicipalities, selectAdminRegions, selectAdminLoading } from '../../store/slices/adminSlice';
import api from '../../services/api';

const MunicipalitiesTab = () => {
  const dispatch = useDispatch();
  const municipalities = useSelector(selectAdminMunicipalities);
  const regions = useSelector(selectAdminRegions);
  const loading = useSelector(selectAdminLoading);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', region_id: '', latitude: '', longitude: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [filterRegion, setFilterRegion] = useState('');

  const apiKey = useSelector(state => state.admin.apiKey);

  const filteredMunicipalities = filterRegion
    ? municipalities.filter(m => m.region_id === parseInt(filterRegion))
    : municipalities;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = {
        name: formData.name,
        region_id: parseInt(formData.region_id),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };
      if (editingId) {
        await api.adminUpdateMunicipality(apiKey, editingId, data);
      } else {
        await api.adminCreateMunicipality(apiKey, data);
      }
      dispatch(fetchAdminData());
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (municipality) => {
    setFormData({
      name: municipality.name,
      region_id: municipality.region_id.toString(),
      latitude: municipality.latitude?.toString() || '',
      longitude: municipality.longitude?.toString() || '',
    });
    setEditingId(municipality.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this municipality?')) return;

    try {
      await api.adminDeleteMunicipality(apiKey, id);
      dispatch(fetchAdminData());
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', region_id: '', latitude: '', longitude: '' });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const getRegionName = (regionId) => {
    const region = regions.find(r => r.id === regionId);
    return region?.name || 'Unknown';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Municipalities</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Municipality'}
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterRegion}
          onChange={(e) => setFilterRegion(e.target.value)}
          className="px-4 py-2 bg-dark-lighter border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>{region.name}</option>
          ))}
        </select>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? 'Edit Municipality' : 'Add Municipality'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Region</label>
                <select
                  value={formData.region_id}
                  onChange={(e) => setFormData({ ...formData, region_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white focus:outline-none focus:border-primary"
                >
                  <option value="">Select Region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Madrid City"
                  required
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 40.4168"
                  className="w-full px-4 py-2 bg-dark border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., -3.7038"
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
      ) : filteredMunicipalities.length === 0 ? (
        <div className="text-center py-16 bg-dark-lighter border border-gray-800 rounded-lg">
          <div className="text-gray-500 text-lg">No municipalities yet</div>
        </div>
      ) : (
        <div className="bg-dark-lighter border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-dark">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Region</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Coordinates</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Places</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredMunicipalities.map((municipality) => (
                <tr key={municipality.id} className="hover:bg-dark/50">
                  <td className="px-4 py-3 text-gray-400">{municipality.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{municipality.name}</td>
                  <td className="px-4 py-3 text-gray-400">{getRegionName(municipality.region_id)}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {municipality.latitude && municipality.longitude
                      ? `${municipality.latitude}, ${municipality.longitude}`
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{municipality.place_count || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleEdit(municipality)}
                      className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(municipality.id)}
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

export default MunicipalitiesTab;
