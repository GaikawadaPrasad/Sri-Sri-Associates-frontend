// import React, { useState } from "react";
// import API from "../../api/axiosInstance";
// import toast from "react-hot-toast";

// const AddLeadForm = () => {
//   const [loanType, setLoanType] = useState("");
//   const [formData, setFormData] = useState({});
//   const [files, setFiles] = useState([]);

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const data = new FormData();
    
//     // Core Fields
//     data.append("customerName", formData.customerName);
//     data.append("mobileNumber", formData.mobileNumber);
//     data.append("loanAmount", formData.loanAmount);
//     data.append("loanType", loanType);

//     // Dynamic loanDetails (rest of the fields)
//     Object.keys(formData).forEach(key => {
//         if(!['customerName', 'mobileNumber', 'loanAmount'].includes(key)) {
//             data.append(key, formData[key]);
//         }
//     });

//     if (files) {
//       Array.from(files).forEach(file => data.append("documents", file));
//     }

//     try {
//       await API.post("/leads/create", data);
//       toast.success("Lead created successfully");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Error creating lead");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-lg space-y-4">
//       <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">New Loan Lead</h2>
      
//       <div className="grid grid-cols-2 gap-4">
//         <input name="customerName" placeholder="Customer Name" onChange={handleInputChange} className="p-3 border rounded-xl w-full" required />
//         <input name="mobileNumber" placeholder="Mobile Number" onChange={handleInputChange} className="p-3 border rounded-xl w-full" required />
//         <input name="loanAmount" type="number" placeholder="Loan Amount" onChange={handleInputChange} className="p-3 border rounded-xl w-full" required />
        
//         <select onChange={(e) => setLoanType(e.target.value)} className="p-3 border rounded-xl w-full" required>
//           <option value="">Select Loan Type</option>
//           <option value="Home Loan">Home Loan</option>
//           <option value="Personal Loan">Personal Loan</option>
//           <option value="Business Loan">Business Loan</option>
//           <option value="LAP Loan">LAP Loan</option>
//           <option value="Vehicle Loan">Vehicle Loan</option>
//         </select>
//       </div>

//       {/* DYNAMIC FIELDS START */}
//       <div className="grid grid-cols-1 gap-4 p-4 bg-slate-50 rounded-2xl">
//         {(loanType === "Home Loan" || loanType === "LAP Loan") && (
//           <>
//             <input name="sqFt" placeholder="Square Feet (Required)" onChange={handleInputChange} className="p-3 border rounded-xl" required />
//             <input name="area" placeholder="Area Location (Required)" onChange={handleInputChange} className="p-3 border rounded-xl" required />
//             <input name="houseValue" placeholder="Property Value (Required)" onChange={handleInputChange} className="p-3 border rounded-xl" required />
//           </>
//         )}

//         {loanType === "Personal Loan" && (
//           <>
//             <input name="income" placeholder="Monthly Income (Required)" onChange={handleInputChange} className="p-3 border rounded-xl" required />
//             <input name="residence" placeholder="Residence Type (Required)" onChange={handleInputChange} className="p-3 border rounded-xl" required />
//           </>
//         )}

//         {loanType === "Business Loan" && (
//           <>
//             <input name="income" placeholder="Annual Income (Required)" onChange={handleInputChange} className="p-3 border rounded-xl" required />
//             <input name="businessType" placeholder="Business Type (Required)" onChange={handleInputChange} className="p-3 border rounded-xl" required />
//             <div className="flex gap-4 p-2">
//                 <span className="text-sm font-bold uppercase">ITR/GST:</span>
//                 <label><input type="radio" name="itrGst" value="Yes" onChange={handleInputChange} /> Yes</label>
//                 <label><input type="radio" name="itrGst" value="No" onChange={handleInputChange} /> No</label>
//             </div>
//           </>
//         )}

//         {loanType === "Vehicle Loan" && (
//           <>
//             <select name="vehicleType" onChange={handleInputChange} className="p-3 border rounded-xl" required>
//                 <option value="">Select Vehicle</option>
//                 <option value="Car">Car</option>
//                 <option value="Bike">Bike</option>
//                 <option value="Tractor">Tractor</option>
//             </select>
//             <input name="vehicleModel" placeholder="Model Name/Year (Required)" onChange={handleInputChange} className="p-3 border rounded-xl" required />
//             <input name="vehicleNumber" placeholder="Vehicle Number" onChange={handleInputChange} className="p-3 border rounded-xl" />
//           </>
//         )}
//       </div>

//       <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="w-full p-2 border border-dashed rounded-xl" />
      
//       <button type="submit" className="w-full bg-[#0A1D37] text-white p-4 rounded-xl font-black uppercase tracking-widest">
//         Submit Lead
//       </button>
//     </form>
//   );
// };

// export default AddLeadForm;