import { useEffect, useState } from "react";
import {
  getAllEVOwners,
  getDeactivatedEVOwners,
  reactivateEVOwner,
  deleteEVOwner,
  adminCreateEVOwner,
  adminUpdateEVOwner,
  deactivateEVOwner,
} from "../../../services/evowners.service";
import Sidebar from "../../../components/Sidebar";

export default function EVOwners() {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeactivated, setShowDeactivated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [searchNIC, setSearchNIC] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    nic: "",
    phone: "",
  });

  const fetchOwners = async () => {
    setLoading(true);
    try {
      const data = showDeactivated
        ? await getDeactivatedEVOwners()
        : await getAllEVOwners();
      setOwners(data);
      setFilteredOwners(data);
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

  useEffect(() => {
    if (searchNIC.trim() === "") {
      setFilteredOwners(owners);
    } else {
      const filtered = owners.filter((owner) =>
        owner.nic.toLowerCase().includes(searchNIC.toLowerCase())
      );
      setFilteredOwners(filtered);
    }
  }, [searchNIC, owners]);

  const handleReactivate = async (nic) => {
    try {
      await reactivateEVOwner(nic);
      fetchOwners();
      alert(`EV Owner ${nic} reactivated successfully!`);
    } catch {
      alert("Failed to reactivate owner.");
    }
  };

  const handleDeactivate = async (nic) => {
    if (!window.confirm(`Are you sure you want to deactivate EV Owner ${nic}?`))
      return;
    try {
      await deactivateEVOwner(nic);
      fetchOwners();
      alert(`EV Owner ${nic} deactivated successfully!`);
    } catch {
      alert("Failed to deactivate owner.");
    }
  };

  const handleDelete = async (nic) => {
    if (!window.confirm(`Are you sure you want to delete EV Owner ${nic}?`))
      return;
    try {
      await deleteEVOwner(nic);
      setOwners((prev) => prev.filter((o) => o.nic !== nic));
      alert(`EV Owner ${nic} deleted successfully!`);
    } catch {
      alert("Failed to delete owner.");
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedOwner(null);
    setFormData({
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      nic: "",
      phone: "",
    });
    setShowModal(true);
  };

  const openUpdateModal = (owner) => {
    setModalMode("update");
    setSelectedOwner(owner);
    setFormData({
      username: owner.username || "",
      email: owner.email || "",
      firstName: owner.firstName || "",
      lastName: owner.lastName || "",
      password: "",
      nic: owner.nic || "",
      phone: owner.phone || "",
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (modalMode === "create") {
        if (
          !formData.username ||
          !formData.email ||
          !formData.firstName ||
          !formData.lastName ||
          !formData.password ||
          !formData.nic ||
          !formData.phone
        ) {
          alert("All fields are required for creating an EV Owner.");
          return;
        }

        await adminCreateEVOwner(formData);
        alert("EV Owner created successfully!");
      } else {
        const updateData = {};
        if (formData.email) updateData.email = formData.email;
        if (formData.firstName) updateData.firstName = formData.firstName;
        if (formData.lastName) updateData.lastName = formData.lastName;
        if (formData.password) updateData.password = formData.password;
        if (formData.phone) updateData.phone = formData.phone;

        await adminUpdateEVOwner(selectedOwner.nic, updateData);
        alert("EV Owner updated successfully!");
      }

      setShowModal(false);
      fetchOwners();
    } catch (err) {
      alert(`Failed to ${modalMode} EV Owner: ${err.message || err}`);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2955] to-[#0f1a3a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ff7600] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading EV owners...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a2955] to-[#0f1a3a] flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 max-w-md">
          <p className="text-red-400 text-lg font-semibold">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar />
      <main className="pt-16 px-6 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-white py-8">
            <h1 className="text-4xl font-bold mb-2">EV Owner Management</h1>
            <p className="text-gray-300 text-lg">
              Manage and monitor all EV owner accounts
            </p>
          </div>
        </div>
      </main>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/10 shadow-xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-wrap gap-3">
              <button
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  !showDeactivated
                    ? "bg-gradient-to-r from-[#ff7600] to-[#ff8c00] text-white shadow-lg shadow-orange-900/50"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setShowDeactivated(false)}
              >
                <div className="flex items-center gap-2">
                  <span>All EV Owners</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {owners.filter((o) => o.isActive).length}
                  </span>
                </div>
              </button>

              <button
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  showDeactivated
                    ? "bg-gradient-to-r from-[#ff7600] to-[#ff8c00] text-white shadow-lg shadow-orange-900/50"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setShowDeactivated(true)}
              >
                <div className="flex items-center gap-2">
                  <span>Deactivated</span>
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {owners.filter((o) => !o.isActive).length}
                  </span>
                </div>
              </button>

              {/* Orange Create Button */}
              <button
                onClick={openCreateModal}
                className="px-6 py-2.5 rounded-xl font-medium transition-all duration-200 bg-gradient-to-r from-[#ff7600] to-[#ff8c00] text-white shadow-lg shadow-orange-900/50 hover:from-[#e66900] hover:to-[#ff7600]"
              >
                Create
              </button>
            </div>

            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <input
                  type="text"
                  placeholder="Search by NIC..."
                  value={searchNIC}
                  onChange={(e) => setSearchNIC(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:border-[#ff7600] focus:ring-2 focus:ring-[#ff7600]/20 text-white placeholder-gray-400 transition-all duration-200"
                />
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3.5 top-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              {searchNIC && (
                <button
                  onClick={() => setSearchNIC("")}
                  className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-xl transition-all duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    NIC
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOwners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <svg
                        className="w-16 h-16 text-gray-600 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-gray-400 text-lg font-medium">
                        {searchNIC
                          ? "No EV owners found matching your search"
                          : "No EV owners found"}
                      </p>
                      <p className="text-gray-500 text-sm mt-2">
                        {searchNIC
                          ? "Try adjusting your search criteria"
                          : "Click 'Create EV Owner' to add a new owner"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOwners.map((owner) => (
                    <tr
                      key={owner.nic}
                      className="hover:bg-white/5 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {owner.nic}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {owner.firstName} {owner.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {owner.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {owner.phone}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {owner.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold border border-gray-500/30">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {owner.isActive ? (
                            <>
                              <button
                                onClick={() => openUpdateModal(owner)}
                                className="px-3 py-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-xs font-medium transition-all duration-200 border border-blue-500/30"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDeactivate(owner.nic)}
                                className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded-lg text-xs font-medium transition-all duration-200 border border-yellow-500/30"
                              >
                                Deactivate
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleReactivate(owner.nic)}
                              className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-medium transition-all duration-200 border border-green-500/30"
                            >
                              Reactivate
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(owner.nic)}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-all duration-200 border border-red-500/30"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 w-full max-w-md border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {modalMode === "create"
                  ? "Create New EV Owner"
                  : "Update EV Owner"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#ff7600] focus:ring-2 focus:ring-[#ff7600]/20"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#ff7600] focus:ring-2 focus:ring-[#ff7600]/20"
              />
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#ff7600] focus:ring-2 focus:ring-[#ff7600]/20"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#ff7600] focus:ring-2 focus:ring-[#ff7600]/20"
              />
              {modalMode === "create" && (
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#ff7600] focus:ring-2 focus:ring-[#ff7600]/20"
                />
              )}
              <input
                type="text"
                name="nic"
                placeholder="NIC"
                value={formData.nic}
                onChange={handleInputChange}
                disabled={modalMode === "update"}
                className={`px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#ff7600] focus:ring-2 focus:ring-[#ff7600]/20 ${
                  modalMode === "update" ? "opacity-60 cursor-not-allowed" : ""
                }`}
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:outline-none focus:border-[#ff7600] focus:ring-2 focus:ring-[#ff7600]/20"
              />

              <button
                onClick={handleSubmit}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-[#ff7600] to-[#ff8c00] hover:from-[#e66900] hover:to-[#ff7600] text-white rounded-xl font-semibold shadow-lg shadow-orange-900/50 transition-all duration-200"
              >
                {modalMode === "create" ? "Create" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
