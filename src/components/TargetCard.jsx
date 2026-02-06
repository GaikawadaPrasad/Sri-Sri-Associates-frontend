// import React, { useEffect, useState } from "react";
// import API from "../api/axiosInstance";

// const TargetCard = () => {
//   const [targetData, setTargetData] = useState(null);

//   useEffect(() => {
//     const fetchTarget = async () => {
//       try {
//         const now = new Date();
//         const { data } = await API.get(
//           `/targets/progress?month=${now.getMonth() + 1}&year=${now.getFullYear()}`,
//         );
//         setTargetData(data);
//       } catch (err) {
//         console.error("Error fetching target data:", err);
//       }
//     };

//     fetchTarget();
//   }, []);

//   if (!targetData) return null;

//   const percentage =
//     (targetData.completedAmount / targetData.targetAmount) * 100 || 0;

//   return (
//     <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-1 md:col-span-1">
//       <p className="text-gray-500 text-sm font-medium">
//         Monthly Target Progress
//       </p>

//       <div className="flex justify-between mt-2 mb-1">
//         <span className="text-xs font-semibold text-blue-600">
//           ₹{targetData.completedAmount}
//         </span>
//         <span className="text-xs font-semibold text-gray-400">
//           Goal: ₹{targetData.targetAmount}
//         </span>
//       </div>

//       <div className="w-full bg-gray-200 rounded-full h-2.5">
//         <div
//           className="bg-blue-600 h-2.5 rounded-full"
//           style={{ width: `${Math.min(percentage, 100)}%` }}
//         ></div>
//       </div>
//     </div>
//   );
// };

// export default TargetCard;
