import { useState, useEffect } from "react";
import api from "../api";

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  useEffect(() => { loadCustomers(); }, []);

  async function loadCustomers() {
    try {
      setLoading(true);
      const res = await api.get("/customers/");
      setCustomers(res.data);
    } catch (err) {
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function openAddForm() {
    setEditingId(null);
    setFormData({ name: "", email: "", phone: "" });
    setShowForm(true);
    setError("");
  }

  function openEditForm(customer) {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
    });
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const body = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || null,
    };

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, body);
      } else {
        await api.post("/customers/", body);
      }
      await loadCustomers();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      await loadCustomers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete customer");
    }
  }

  if (loading) return <div className="loading">Loading customers...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="page-subtitle">Manage your customer directory</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>+ Add Customer</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? "Edit Customer" : "Add New Customer"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" type="text" value={formData.name}
                  onChange={handleChange} placeholder="e.g. John Doe" required />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={formData.email}
                  onChange={handleChange} placeholder="e.g. john@example.com" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone (optional)</label>
                <input id="phone" name="phone" type="text" value={formData.phone}
                  onChange={handleChange} placeholder="e.g. +1-555-0123" />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update" : "Create"}
              </button>
              <button type="button" className="btn btn-secondary"
                onClick={() => { setShowForm(false); setEditingId(null); setError(""); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {customers.length === 0 ? (
        <div className="empty-state">
          <p>No customers yet. Click "Add Customer" to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th>
                <th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || "—"}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-small btn-edit" onClick={() => openEditForm(c)}>Edit</button>
                      <button className="btn btn-small btn-delete" onClick={() => handleDelete(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomersPage;
