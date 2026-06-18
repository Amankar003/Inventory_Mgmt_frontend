/**
 * CustomersPage.jsx - Customers Management Page
 *
 * Features:
 * - List all customers in a table
 * - Add a new customer via a form
 * - Edit an existing customer
 * - Delete a customer
 */

import { useState, useEffect } from "react";
import api from "../api";

function CustomersPage() {
  // State for the list of customers
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for the add/edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Fetch customers when the component loads
  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const response = await api.get("/customers/");
      setCustomers(response.data);
    } catch (err) {
      setError("Failed to fetch customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle form input changes
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Open form to add a new customer
  function handleAdd() {
    setEditingId(null);
    setFormData({ name: "", email: "", phone: "" });
    setShowForm(true);
    setError("");
  }

  // Open form to edit an existing customer
  function handleEdit(customer) {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || "",
    });
    setShowForm(true);
    setError("");
  }

  // Submit the form (create or update)
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
      await fetchCustomers();
      setShowForm(false);
      setFormData({ name: "", email: "", phone: "" });
      setEditingId(null);
    } catch (err) {
      const message = err.response?.data?.detail || "Something went wrong";
      setError(message);
    }
  }

  // Delete a customer
  async function handleDelete(customerId) {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${customerId}`);
      await fetchCustomers();
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to delete customer";
      setError(message);
    }
  }

  // Cancel form
  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setError("");
  }

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="page-subtitle">Manage your customer directory</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Customer
        </button>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-card">
          <h2>{editingId ? "Edit Customer" : "Add New Customer"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone (optional)</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1-555-0123"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingId ? "Update" : "Create"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers Table */}
      {customers.length === 0 ? (
        <div className="empty-state">
          <p>No customers yet. Click "Add Customer" to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || "—"}</td>
                  <td>{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-small btn-edit"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDelete(customer.id)}
                      >
                        Delete
                      </button>
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
