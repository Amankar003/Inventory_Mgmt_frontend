/**
 * ProductsPage.jsx - Products Management Page
 *
 * Features:
 * - List all products in a table
 * - Add a new product via a form
 * - Edit an existing product (inline form)
 * - Delete a product
 */

import { useState, useEffect } from "react";
import api from "../api";

function ProductsPage() {
  // State for the list of products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for the add/edit form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding, number = editing
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock_quantity: "",
  });

  // Fetch products when the component loads
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      setLoading(true);
      const response = await api.get("/products/");
      setProducts(response.data);
    } catch (err) {
      setError("Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle form input changes
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // Open the form to add a new product
  function handleAdd() {
    setEditingId(null);
    setFormData({ name: "", sku: "", price: "", stock_quantity: "" });
    setShowForm(true);
    setError("");
  }

  // Open the form to edit an existing product
  function handleEdit(product) {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
    });
    setShowForm(true);
    setError("");
  }

  // Submit the form (create or update)
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Build the request body
    const body = {
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
    };

    try {
      if (editingId) {
        // Update existing product
        await api.put(`/products/${editingId}`, body);
      } else {
        // Create new product
        await api.post("/products/", body);
      }
      // Refresh the list and close the form
      await fetchProducts();
      setShowForm(false);
      setFormData({ name: "", sku: "", price: "", stock_quantity: "" });
      setEditingId(null);
    } catch (err) {
      // Show the error message from the backend
      const message = err.response?.data?.detail || "Something went wrong";
      setError(message);
    }
  }

  // Delete a product
  async function handleDelete(productId) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`);
      await fetchProducts();
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to delete product";
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
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Add Product
        </button>
      </div>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="form-card">
          <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Mouse"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="sku">SKU</label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. WM-001"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 29.99"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="stock_quantity">Stock Quantity</label>
                <input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  required
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

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products yet. Click "Add Product" to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td><code>{product.sku}</code></td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge ${
                        product.stock_quantity < 10
                          ? "badge-danger"
                          : "badge-success"
                      }`}
                    >
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td>{new Date(product.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-small btn-edit"
                        onClick={() => handleEdit(product)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-small btn-delete"
                        onClick={() => handleDelete(product.id)}
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

export default ProductsPage;
