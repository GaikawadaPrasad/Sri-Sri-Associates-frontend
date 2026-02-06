import React, { useState } from "react";
import API from "../api/axiosInstance";
import {
  TrendingUp,
  Calendar,
  IndianRupee,
} from "lucide-react";
import toast from "react-hot-toast";

const TargetView = ({ clients = [] }) => {
  const [targetStats, setTargetStats] = useState({});
  const [loadingIds, setLoadingIds] = useState([]);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  /* ---------------- FETCH PROGRESS ---------------- */
  const fetchProgress = async (clientId) => {
    try {
      setLoadingIds((prev) => [...prev, clientId]);
      const { data } = await API.get(
        `/targets/progress?clientId=${clientId}&month=${formData.month}&year=${formData.year}`
      );
      setTargetStats((prev) => ({ ...prev, [clientId]: data }));
    } catch (err) {
      toast.error("Failed to fetch progress");
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== clientId));
    }
  };

  /* ---------------- SET TARGET ---------------- */
  const handleSetTarget = async (clientId, amount) => {
    if (!amount || amount <= 0) {
      return toast.error("Enter a valid target amount");
    }

    try {
      await API.post("/targets/set", {
        client: clientId,
        targetAmount: Number(amount),
        month: formData.month,
        year: formData.year,
      });

      toast.success("Target updated successfully");
      fetchProgress(clientId);
    } catch (err) {
      toast.error("Failed to set target");
    }
  };

  /* ---------------- EMPTY STATE ---------------- */
  if (!clients.length) {
    return (
      <div className="bg-white p-10 rounded-3xl border text-center text-gray-400 font-black uppercase">
        No clients available to assign targets
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">
              Target Period
            </p>
            <p className="text-sm font-black uppercase">
              {new Date(0, formData.month - 1).toLocaleString("default", {
                month: "long",
              })}{" "}
              {formData.year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl">
          <select
            value={formData.month}
            onChange={(e) =>
              setFormData({ ...formData, month: Number(e.target.value) })
            }
            className="bg-transparent text-[10px] font-black uppercase px-4 py-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={formData.year}
            onChange={(e) =>
              setFormData({ ...formData, year: Number(e.target.value) })
            }
            className="w-20 bg-white border rounded-xl px-3 py-2 text-[10px] font-black"
          />
        </div>
      </div>

      {/* CLIENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clients.map((client) => (
          <AgentTargetCard
            key={client._id}
            client={client}
            progress={targetStats[client._id]}
            isLoading={loadingIds.includes(client._id)}
            onFetch={() => fetchProgress(client._id)}
            onSetTarget={(amt) => handleSetTarget(client._id, amt)}
          />
        ))}
      </div>
    </div>
  );
};

/* ---------------- CARD ---------------- */
const AgentTargetCard = ({ client, progress, onFetch, onSetTarget, isLoading }) => {
  const [inputAmt, setInputAmt] = useState("");

  const percentage =
    progress && progress.targetAmount > 0
      ? Math.min(
          (progress.completedAmount / progress.targetAmount) * 100,
          100
        )
      : 0;

  return (
    <div className="bg-white rounded-3xl p-8 border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="font-black uppercase">{client.name}</h4>
          <p className="text-[10px] text-gray-400">{client.email}</p>
        </div>
        <button onClick={onFetch} className="text-gray-300 hover:text-blue-600">
          <TrendingUp size={18} />
        </button>
      </div>

      {!progress ? (
        <>
          <input
            type="number"
            placeholder="Set Monthly Target"
            className="w-full px-4 py-3 rounded-xl bg-gray-50 text-xs font-black mb-3"
            value={inputAmt}
            onChange={(e) => setInputAmt(e.target.value)}
          />
          <button
            onClick={() => onSetTarget(inputAmt)}
            className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black"
          >
            Assign Target
          </button>
        </>
      ) : (
        <>
          <p className="text-xl font-black">
            ₹{progress.completedAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            Target ₹{progress.targetAmount.toLocaleString()}
          </p>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${
                percentage >= 100 ? "bg-green-500" : "bg-blue-600"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-[10px] font-black text-gray-400">
            {percentage.toFixed(1)}% achieved
          </p>

          <button
            onClick={onFetch}
            className="w-full mt-4 py-2 text-[10px] font-black border rounded-xl"
          >
            {isLoading ? "Syncing..." : "Refresh Stats"}
          </button>
        </>
      )}
    </div>
  );
};

export default TargetView;
