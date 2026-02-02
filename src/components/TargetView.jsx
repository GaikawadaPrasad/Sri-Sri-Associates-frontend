import React, { useState } from "react";
import API from "../../api/axiosInstance";
import toast from "react-hot-toast";

const TargetView = ({ clients, fetchTargetProgress, targetProgress }) => {
  const [formData, setFormData] = useState({
    clientId: "",
    targetAmount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSetTarget = async () => {
    if (!formData.clientId || !formData.targetAmount) {
      toast.error("Please select a client and enter target amount");
      return;
    }
    try {
      await API.post("/targets/set", {
        client: formData.clientId,
        targetAmount: Number(formData.targetAmount),
        month: formData.month,
        year: formData.year,
      });
      toast.success("Target set successfully!");
      fetchTargetProgress(formData.clientId);
      setFormData({ ...formData, targetAmount: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to set target");
    }
  };

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <div key={client._id} className="p-4 border rounded-xl bg-gray-50">
          <h4 className="font-bold">{client.name}</h4>

          {/* Set Target Form */}
          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <input
              type="number"
              placeholder="Target Amount"
              name="targetAmount"
              value={formData.clientId === client._id ? formData.targetAmount : ""}
              onChange={handleChange}
              className="py-1 px-2 border rounded-lg w-36 text-sm"
            />
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="py-1 px-2 border rounded-lg text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="py-1 px-2 border rounded-lg w-24 text-sm"
            />
            <button
              onClick={() => {
                setFormData({ ...formData, clientId: client._id });
                handleSetTarget();
              }}
              className="py-1 px-3 bg-blue-600 text-white rounded-lg text-sm"
            >
              Set Target
            </button>
            <button
              onClick={() => fetchTargetProgress(client._id)}
              className="py-1 px-3 bg-green-600 text-white rounded-lg text-sm"
            >
              View Progress
            </button>
          </div>

          {/* Display target progress */}
          {targetProgress.client === client._id && (
            <div className="mt-2 text-sm space-y-1">
              <div>Target: ₹{targetProgress.targetAmount || 0}</div>
              <div>Completed: ₹{targetProgress.completedAmount || 0}</div>
              <div>Remaining: ₹{targetProgress.remainingAmount || 0}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TargetView;
