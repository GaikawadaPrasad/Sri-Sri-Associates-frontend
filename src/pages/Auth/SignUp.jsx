import React, { useState } from 'react';
import API from "../../api/axiosInstance";
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Briefcase, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Role is no longer in the UI, we set it here or let the backend default to CLIENT
    role: 'CLIENT' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      // We send the data with the fixed 'CLIENT' role
      await API.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'CLIENT' 
      });
      
      navigate('/login');
      toast.success('Registration successful! Please login.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
      
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-blue-900">Agent Registration</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Register as a Field Agent for SRI SRI ASSOCIATES</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={20} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              required
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
              placeholder="Full Name"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              required
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
              placeholder="Email address"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              required
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
              placeholder="Password"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="password"
              required
              className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
              placeholder="Confirm Password"
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400"
          >
            {loading ? 'Creating Account...' : 'Register as Agent'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;