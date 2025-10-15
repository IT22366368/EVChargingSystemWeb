import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { createStation } from "../../../services/chargingstations.service";

const CreateStation = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    stationName: "",
    type: "",
    address: "",
    city: "",
    stateProvince: "",
    totalSlots: 1,
    contactPhone: "",
    contactEmail: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "latitude" || name === "longitude") {
      const num = value === "" ? "" : Number(value);
      setForm((s) => ({
        ...s,
        [name]: value === "" ? "" : Number.isFinite(num) ? num : "",
      }));
      // clear field error while editing
      setFieldErrors((f) => {
        if (!f || !f[name]) return f;
        const copy = { ...f };
        delete copy[name];
        return copy;
      });
      return;
    }

    if (name === "totalSlots") {
      const num = value === "" ? "" : Number(value);
      setForm((s) => ({ ...s, [name]: value === "" ? "" : Number.isFinite(num) ? num : s[name] }));
      return;
    }

      setForm((s) => ({ ...s, [name]: value }));
      // clear field error while editing
      setFieldErrors((f) => {
        if (!f || !f[name]) return f;
        const copy = { ...f };
        delete copy[name];
        return copy;
      });
  };

  const validateField = (name, value) => {
    const tmp = {};
    switch (name) {
      case "stationName":
        if (!value || String(value).trim() === "") tmp.stationName = "Station name is required.";
        break;
      case "address":
        if (!value || String(value).trim() === "") tmp.address = "Address is required.";
        break;
      case "city":
        if (!value || String(value).trim() === "") tmp.city = "City is required.";
        break;
      case "type":
        if (!value || String(value).trim() === "") tmp.type = "Type is required.";
        break;
      case "stateProvince":
        if (!value || String(value).trim() === "") tmp.stateProvince = "State/Province is required.";
        break;
      case "totalSlots":
        if (value === "" || value == null) tmp.totalSlots = "Total slots is required.";
        else if (!Number.isInteger(Number(value)) || Number(value) < 0) tmp.totalSlots = "Total slots must be a non-negative integer.";
        break;
      case "contactEmail":
        if (value && String(value).trim() !== "") {
          const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRe.test(value)) tmp.contactEmail = "Enter a valid email address.";
        }
        break;
      case "contactPhone":
        if (value && String(value).trim() !== "") {
          const digits = String(value).replace(/[^0-9]/g, "");
          if (digits.length < 7) tmp.contactPhone = "Enter a valid phone number.";
        }
        break;
      case "latitude":
        if (value !== "" && value != null) {
          const nlat = Number(value);
          if (!Number.isFinite(nlat) || nlat < -90 || nlat > 90) tmp.latitude = "Latitude must be a number between -90 and 90.";
        }
        break;
      case "longitude":
        if (value !== "" && value != null) {
          const nlng = Number(value);
          if (!Number.isFinite(nlng) || nlng < -180 || nlng > 180) tmp.longitude = "Longitude must be a number between -180 and 180.";
        }
        break;
      default:
        break;
    }

    setFieldErrors((f) => ({ ...f, ...tmp }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // client-side validation
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix validation errors before submitting.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        stationName: form.stationName,
        type: form.type,
        address: form.address,
        city: form.city,
        stateProvince: form.stateProvince,
        totalSlots: Number(form.totalSlots) || 0,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
      const res = await createStation(payload);
      // Try to read created id from common response shapes and navigate to details if available
      const createdId = res?.station?._id || res?._id || res?.id;
      if (createdId) {
        navigate(`/admin/stations/${createdId}`);
      } else {
        // Fallback: go back to list
        navigate("/admin/stations");
      }
    } catch (err) {
      // Show backend message or full response body when available for easier debugging
      const serverMessage = err.response?.data?.message || err.response?.data || err.message;
      setError(serverMessage || "Failed to create station");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (values) => {
    const errs = {};

    if (!values.stationName || String(values.stationName).trim() === "") {
      errs.stationName = "Station name is required.";
    }
    // type is required by backend — validate here if needed
    if (!values.type || String(values.type).trim() === "") {
      errs.type = "Type is required.";
    }
    if (!values.address || String(values.address).trim() === "") {
      errs.address = "Address is required.";
    }
    if (!values.city || String(values.city).trim() === "") {
      errs.city = "City is required.";
    }
    if (!values.stateProvince || String(values.stateProvince).trim() === "") {
      errs.stateProvince = "State/Province is required.";
    }

    // totalSlots must be an integer >= 0
    if (values.totalSlots === "" || values.totalSlots == null) {
      errs.totalSlots = "Total slots is required.";
    } else if (!Number.isInteger(Number(values.totalSlots)) || Number(values.totalSlots) < 0) {
      errs.totalSlots = "Total slots must be a non-negative integer.";
    }

    // simple email validation when provided
    if (values.contactEmail && String(values.contactEmail).trim() !== "") {
      // basic regex
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(values.contactEmail)) {
        errs.contactEmail = "Enter a valid email address.";
      }
    }

    // phone optional but validate digits if provided
    if (values.contactPhone && String(values.contactPhone).trim() !== "") {
      const digits = String(values.contactPhone).replace(/[^0-9]/g, "");
      if (digits.length < 7) {
        errs.contactPhone = "Enter a valid phone number.";
      }
    }

    // latitude/longitude validation
    if (values.latitude !== "" && values.latitude != null) {
      const nlat = Number(values.latitude);
      if (!Number.isFinite(nlat) || nlat < -90 || nlat > 90) {
        errs.latitude = "Latitude must be a number between -90 and 90.";
      }
    }
    if (values.longitude !== "" && values.longitude != null) {
      const nlng = Number(values.longitude);
      if (!Number.isFinite(nlng) || nlng < -180 || nlng > 180) {
        errs.longitude = "Longitude must be a number between -180 and 180.";
      }
    }

    return errs;
  };

  return (
    <div className="min-h-screen bg-[#1a2955]">
      <Sidebar />
      <main className="pt-16 pb-8 px-6">
        <div className="max-w-3xl mx-auto text-white">
          <h1 className="text-3xl font-bold mb-4">Add New Charging Station</h1>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Station Name</label>
              <input name="stationName" value={form.stationName} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
              {fieldErrors.stationName && <p className="text-sm text-red-400 mt-1">{fieldErrors.stationName}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select name="type" value={form.type} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white">
                <option value="">Select type</option>
                <option value="AC">AC</option>
                <option value="DC">DC</option>
              </select>
              {fieldErrors.type && <p className="text-sm text-red-400 mt-1">{fieldErrors.type}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Address</label>
              <input name="address" value={form.address} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
              {fieldErrors.address && <p className="text-sm text-red-400 mt-1">{fieldErrors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">City</label>
                <input name="city" value={form.city} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
                {fieldErrors.city && <p className="text-sm text-red-400 mt-1">{fieldErrors.city}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">State/Province</label>
                  <input name="stateProvince" value={form.stateProvince} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
                  {fieldErrors.stateProvince && <p className="text-sm text-red-400 mt-1">{fieldErrors.stateProvince}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Total Slots</label>
              <input name="totalSlots" type="number" min="0" value={form.totalSlots} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-32 p-2 rounded bg-gray-900 text-white" />
              {fieldErrors.totalSlots && <p className="text-sm text-red-400 mt-1">{fieldErrors.totalSlots}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contact Phone</label>
                <input name="contactPhone" value={form.contactPhone} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
                {fieldErrors.contactPhone && <p className="text-sm text-red-400 mt-1">{fieldErrors.contactPhone}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Contact Email</label>
                <input name="contactEmail" value={form.contactEmail} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
                {fieldErrors.contactEmail && <p className="text-sm text-red-400 mt-1">{fieldErrors.contactEmail}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Latitude</label>
                <input name="latitude" value={form.latitude ?? ""} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
                {fieldErrors.latitude && <p className="text-sm text-red-400 mt-1">{fieldErrors.latitude}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Longitude</label>
                <input name="longitude" value={form.longitude ?? ""} onChange={handleChange} onBlur={(e) => validateField(e.target.name, e.target.value)} className="w-full p-2 rounded bg-gray-900 text-white" />
                {fieldErrors.longitude && <p className="text-sm text-red-400 mt-1">{fieldErrors.longitude}</p>}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="bg-[#ff7600] px-4 py-2 rounded text-white">{loading ? "Creating..." : "Create Station"}</button>
              <button type="button" onClick={() => navigate('/admin/stations')} className="bg-gray-600 px-4 py-2 rounded text-white">Cancel</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateStation;
