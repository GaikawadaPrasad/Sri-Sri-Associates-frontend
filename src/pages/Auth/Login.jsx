import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from "../../api/axiosInstance";
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';


const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/login', formData);
      
      // Save to Context & LocalStorage
      login(data.user, data.token);

      // Role-based redirection
      if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
        toast.success('Welcome Admin!');
      } else {
        navigate('/client/dashboard');
        toast.success('Login Successful!');

      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-blue-900">
            SRI SRI ASSOCIATES
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to manage your loan leads
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="email"
                required
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="password"
                required
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          New here? <Link to="/signup" className="text-blue-600 font-bold">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;