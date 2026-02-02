import React, { useState } from 'react';
import API from '../api/axiosInstance';
import { Upload, User, Phone, IndianRupee, FileText, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LeadForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State for text fields
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    loanType: 'HOME_LOAN',
    loanAmount: ''
  });

  // State for files as per your backend fields
  const [files, setFiles] = useState({
    aadharCard: null,
    panCard: null,
    salarySlips: []
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (name === 'salarySlips') {
      setFiles({ ...files, [name]: Array.from(selectedFiles) });
    } else {
      setFiles({ ...files, [name]: selectedFiles[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Use FormData for file uploads
    const data = new FormData();
    data.append('customerName', formData.customerName);
    data.append('mobileNumber', formData.mobileNumber);
    data.append('loanType', formData.loanType);
    data.append('loanAmount', formData.loanAmount);

    // Append files correctly for Multer fields
    if (files.aadharCard) data.append('aadharCard', files.aadharCard);
    if (files.panCard) data.append('panCard', files.panCard);
    files.salarySlips.forEach((file) => {
      data.append('salarySlips', file);
    });


    try {
      await API.post('/leads/add', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Lead submitted successfully!' });
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit lead' });
      toast.error(err.response?.data?.message || 'Failed to submit lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="text-blue-600" /> Customer Loan Details
      </h2>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Customer Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input name="customerName" required className="pl-10 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="John Doe" onChange={handleInputChange} />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
              <input name="mobileNumber" required className="pl-10 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="9876543210" onChange={handleInputChange} />
            </div>
          </div>

          {/* Loan Type */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Loan Type</label>
            <select name="loanType" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white" onChange={handleInputChange}>
              <option value="HOME_LOAN">Home Loan</option>
              <option value="PERSONAL_LOAN">Personal Loan</option>
              <option value="BUSINESS_LOAN">Business Loan</option>
              <option value="PROPERTY_LOAN">Property Loan</option>
              <option value="VEHICLE_LOAN">Vehicle Loan</option>
            </select>
          </div>

          {/* Loan Amount */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-600">Expected Loan Amount</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 text-gray-400" size={18} />
              <input name="loanAmount" type="number" required className="pl-10 w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="500000" onChange={handleInputChange} />
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-gray-700 mb-2">Required Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FileInput label="Aadhar Card" name="aadharCard" onChange={handleFileChange} />
            <FileInput label="PAN Card" name="panCard" onChange={handleFileChange} />
            <FileInput label="Salary Slips (Multiple)" name="salarySlips" multiple onChange={handleFileChange} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? 'Processing Lead...' : 'Submit Lead'}
        </button>
      </form>
    </div>
  );
};

// Reusable File Input Component
const FileInput = ({ label, name, onChange, multiple = false }) => (
  <div className="flex flex-col gap-2">
    <span className="text-xs font-bold text-gray-500 uppercase">{label}</span>
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition">
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload className="w-8 h-8 text-gray-400 mb-2" />
        <p className="text-xs text-gray-500">Click to upload</p>
      </div>
      <input type="file" name={name} className="hidden" multiple={multiple} onChange={onChange} required={name !== 'salarySlips'} />
    </label>
  </div>
);

export default LeadForm;