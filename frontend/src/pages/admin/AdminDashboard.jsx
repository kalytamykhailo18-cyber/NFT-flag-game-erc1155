/**
 * AdminDashboard - Dashboard overview with quick actions
 */
import { useSelector } from 'react-redux';
import { selectAdminStats, selectAdminIpfsStatus } from '../../store/slices/adminSlice';

const AdminDashboard = () => {
  const stats = useSelector(selectAdminStats);
  const ipfsStatus = useSelector(selectAdminIpfsStatus);

  return (
    <div>
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionCard
            title="Generate Place"
            description="Create place from coordinates"
            icon="+"
          />
          <ActionCard
            title="Manage Places"
            description="View and edit places"
            icon="P"
          />
          <ActionCard
            title="View Slices"
            description="Manage photo slices"
            icon="S"
          />
          <ActionCard
            title="Add Country"
            description="Add new country"
            icon="C"
          />
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* IPFS Status */}
        <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">IPFS Status</h3>
          {ipfsStatus ? (
            <div className="space-y-3">
              <StatusRow
                label="Connection"
                value={ipfsStatus.connected ? 'Connected' : 'Disconnected'}
                status={ipfsStatus.connected ? 'success' : 'error'}
              />
              <StatusRow label="Gateway" value={ipfsStatus.gateway || 'N/A'} />
              <StatusRow label="Files Pinned" value={ipfsStatus.pinned_count || 0} />
            </div>
          ) : (
            <p className="text-gray-300">Loading IPFS status...</p>
          )}
        </div>

        {/* Database Stats */}
        <div className="bg-dark-lighter border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Database Summary</h3>
          {stats ? (
            <div className="space-y-3">
              <StatusRow label="Total Countries" value={stats.countries || 0} />
              <StatusRow label="Total Regions" value={stats.regions || 0} />
              <StatusRow label="Total Municipalities" value={stats.municipalities || 0} />
              <StatusRow label="Total Places" value={stats.places || 0} />
              <StatusRow
                label="Minted Places"
                value={`${stats.minted_places || 0} / ${stats.places || 0}`}
              />
              <StatusRow label="Total Slices" value={stats.slices || 0} />
            </div>
          ) : (
            <p className="text-gray-300">Loading database stats...</p>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionCard = ({ title, description, icon }) => (
  <div className="p-4 bg-dark border border-gray-800 rounded-lg hover:border-primary/50 transition-all cursor-pointer">
    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-bold mb-3">
      {icon}
    </div>
    <h4 className="text-white font-semibold mb-1">{title}</h4>
    <p className="text-gray-300 text-sm">{description}</p>
  </div>
);

const StatusRow = ({ label, value, status }) => {
  const statusColors = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
  };

  return (
    <div className="flex justify-between">
      <span className="text-gray-200">{label}</span>
      <span className={status ? statusColors[status] : 'text-white'}>{value}</span>
    </div>
  );
};

export default AdminDashboard;
