// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   getAllEVOwners,
//   deleteEVOwner,
//   deactivateEVOwner,
//   reactivateEVOwner,
// } from "../../../services/evowners.service";

// export default function EVOwners() {
//   const [owners, setOwners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchOwners = async () => {
//       try {
//         const data = await getAllEVOwners();
//         setOwners(data);
//       } catch (err) {
//         console.error("Fetch error:", err);
//         setError("Failed to load EV owners.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchOwners();
//   }, []);

//   const handleDelete = async (nic) => {
//     if (!window.confirm("Are you sure you want to delete this EV Owner?")) return;
//     try {
//       await deleteEVOwner(nic);
//       setOwners((prev) => prev.filter((o) => o.nic !== nic));
//     } catch {
//       alert("Failed to delete owner.");
//     }
//   };

//   const handleDeactivate = async () => {
//     // Only logged-in user can call this
//     if (!window.confirm("Are you sure you want to deactivate your account?")) return;
//     try {
//       await deactivateEVOwner();
//       alert("Your account has been deactivated.");
//       // Optional: redirect after deactivation
//       navigate("/");
//     } catch {
//       alert("Failed to deactivate your account.");
//     }
//   };

//   const handleReactivate = async (nic) => {
//     try {
//       await reactivateEVOwner(nic);
//       setOwners((prev) =>
//         prev.map((o) => (o.nic === nic ? { ...o, isActive: true } : o))
//       );
//     } catch {
//       alert("Failed to reactivate owner.");
//     }
//   };

//   if (loading)
//     return <div className="text-white p-6">Loading EV owners...</div>;
//   if (error)
//     return <div className="text-red-400 p-6 font-semibold">{error}</div>;

//   return (
//     <div className="min-h-screen bg-[#1a2955] text-white p-6">
//       <h1 className="text-2xl font-semibold mb-6">EV Owner Management</h1>

//       <div className="overflow-x-auto bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
//         <table className="min-w-full text-left">
//           <thead className="bg-gray-700 text-gray-200 uppercase text-sm">
//             <tr>
//               <th className="px-4 py-3">NIC</th>
//               <th className="px-4 py-3">Name</th>
//               <th className="px-4 py-3">Email</th>
//               <th className="px-4 py-3">Phone</th>
//               <th className="px-4 py-3">Status</th>
//               <th className="px-4 py-3 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {owners.length === 0 ? (
//               <tr>
//                 <td colSpan="6" className="px-4 py-3 text-center text-gray-400">
//                   No EV owners found.
//                 </td>
//               </tr>
//             ) : (
//               owners.map((owner) => (
//                 <tr
//                   key={owner.nic}
//                   className="border-t border-gray-700 hover:bg-gray-700/50"
//                 >
//                   <td className="px-4 py-3">{owner.nic}</td>
//                   <td className="px-4 py-3">{owner.firstName} {owner.lastName}</td>
//                   <td className="px-4 py-3">{owner.email}</td>
//                   <td className="px-4 py-3">{owner.phone}</td>
//                   <td className="px-4 py-3">
//                     {owner.isActive ? (
//                       <span className="text-green-400 font-medium">Active</span>
//                     ) : (
//                       <span className="text-gray-400 font-medium">Inactive</span>
//                     )}
//                   </td>
//                   <td className="px-4 py-3 text-center space-x-3">
//                     <button
//                       onClick={() => handleDelete(owner.nic)}
//                       className="text-red-500 hover:text-red-400 font-medium"
//                     >
//                       Delete
//                     </button>
//                     {owner.isActive ? (
//                       <button
//                         onClick={handleDeactivate}
//                         className="text-yellow-400 hover:text-yellow-300 font-medium"
//                       >
//                         Deactivate
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => handleReactivate(owner.nic)}
//                         className="text-green-400 hover:text-green-300 font-medium"
//                       >
//                         Reactivate
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import {
  getAllEVOwners,
  getDeactivatedEVOwners,
  reactivateEVOwner,
  deleteEVOwner,
} from "../../../services/evowners.service";

export default function EVOwners() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const data = showDeactivated
        ? await getDeactivatedEVOwners()
        : await getAllEVOwners();
      setOwners(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load EV owners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, [showDeactivated]);

  const handleReactivate = async (nic) => {
    try {
      await reactivateEVOwner(nic);
      setOwners((prev) =>
        prev.map((o) => (o.nic === nic ? { ...o, isActive: true } : o))
      );
      alert(`EV Owner ${nic} reactivated successfully!`);
    } catch {
      alert("Failed to reactivate owner.");
    }
  };

  const handleDelete = async (nic) => {
    if (!window.confirm(`Are you sure you want to delete EV Owner ${nic}?`)) return;
    try {
      await deleteEVOwner(nic);
      setOwners((prev) => prev.filter((o) => o.nic !== nic));
      alert(`EV Owner ${nic} deleted successfully!`);
    } catch {
      alert("Failed to delete owner.");
    }
  };

  if (loading) return <div className="text-white p-6">Loading EV owners...</div>;
  if (error) return <div className="text-red-400 p-6 font-semibold">{error}</div>;

  return (
    <div className="min-h-screen bg-[#1a2955] text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin EV Owner Management</h1>

      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded-lg mr-2 ${
            !showDeactivated ? "bg-[#ff7600]" : "bg-gray-600"
          }`}
          onClick={() => setShowDeactivated(false)}
        >
          All EV Owners
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            showDeactivated ? "bg-[#ff7600]" : "bg-gray-600"
          }`}
          onClick={() => setShowDeactivated(true)}
        >
          Deactivated EV Owners
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-2xl border border-gray-700 shadow-lg">
        <table className="min-w-full text-left">
          <thead className="bg-gray-700 text-gray-200 uppercase text-sm">
            <tr>
              <th className="px-4 py-3">NIC</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {owners.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-3 text-center text-gray-400">
                  No EV owners found.
                </td>
              </tr>
            ) : (
              owners.map((owner) => (
                <tr key={owner.nic} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="px-4 py-3">{owner.nic}</td>
                  <td className="px-4 py-3">{owner.firstName} {owner.lastName}</td>
                  <td className="px-4 py-3">{owner.email}</td>
                  <td className="px-4 py-3">{owner.phone}</td>
                  <td className="px-4 py-3">
                    {owner.isActive ? (
                      <span className="text-green-400 font-medium">Active</span>
                    ) : (
                      <span className="text-gray-400 font-medium">Inactive</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center space-x-3">
                    {!owner.isActive && (
                      <button
                        onClick={() => handleReactivate(owner.nic)}
                        className="text-green-400 hover:text-green-300 font-medium"
                      >
                        Reactivate
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(owner.nic)}
                      className="text-red-500 hover:text-red-400 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
