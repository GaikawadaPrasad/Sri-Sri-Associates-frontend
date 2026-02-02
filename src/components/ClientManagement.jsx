import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { Users, Target, Power, CheckCircle, XCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [targetAmount, setTargetAmount] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      
      const { data } = await API.get('/users/clients'); 
      setClients(data.data);
      toast.success("Clients loaded");
    } catch (err) {
      console.error("Error fetching clients", err);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      // Logic to toggle isActive
      await API.patch(`/auth/users/${id}/toggle-status`);
      setClients(clients.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
    } catch (err) {
      alert("Failed to update status");
      console.error("Status toggle failed", err);
    }
  };

  const handleSetTarget = async (e) => {
    e.preventDefault();
    const now = new Date();
    try {
      // Using your setTarget controller logic
      await API.post('/targets/set', {
        client: selectedClient._id,
        targetAmount: Number(targetAmount),
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });
      alert(`Target set for ${selectedClient.name}`);
      setSelectedClient(null);
      setTargetAmount('');
    } catch (err) {
      alert("Error setting target");
      console.error("Set target failed", err);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 text-center">Loading Agents...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-purple-600" /> Field Agent Management
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search agents..." 
            className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <div key={client._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-2 h-full ${client.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{client.name}</h3>
                <p className="text-sm text-gray-500">{client.email}</p>
              </div>
              {client.isActive ? <CheckCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
            </div>

            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => setSelectedClient(client)}
                className="flex-1 bg-purple-50 text-purple-700 py-2 rounded-lg text-sm font-bold hover:bg-purple-100 flex items-center justify-center gap-2"
              >
                <Target size={16} /> Set Target
              </button>
              <button 
                onClick={() => { toggleStatus(client._id, client.isActive); toast.info(`Agent ${client.isActive ? 'deactivated' : 'activated'}`); }}
                className={`p-2 rounded-lg ${client.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}
                title={client.isActive ? "Deactivate Agent" : "Activate Agent"}
              >
                <Power size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Target Setting Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Set Monthly Target</h3>
            <p className="text-sm text-gray-600 mb-6">Setting target for <span className="font-bold">{selectedClient.name}</span> for the current month.</p>
            
            <form onSubmit={handleSetTarget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (₹)</label>
                <input 
                  type="number" 
                  required 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 5000000"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedClient(null)} className="flex-1 py-3 text-gray-500 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">Save Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;