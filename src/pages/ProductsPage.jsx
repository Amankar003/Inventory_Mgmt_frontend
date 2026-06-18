import { useState, useEffect } from "react";
import api from "../api";

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "", sku: "", price: "", stock_quantity: "",
  });

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await api.get("/products/");
      setProducts(res.data);
    } catch (err) {
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function openAddForm() {
    setEditingId(null);
    setFormData({ name: "", sku: "", price: "", stock_quantity: "" });
    setShowForm(true);
    setError("");
  }

  function openEditForm(product) {
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

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const body = {
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price),
      stock_quantity: parseInt(formData.stock_quantity),
    };

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, body);
      } else {
        await api.post("/products/", body);
      }
      await loadProducts();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      await loadProducts();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete product");
    }
  }

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p className="page-subtitle">Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>+ Add Product</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? "Edit Product" : "Add New Product"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input id="name" name="name" type="text" value={formData.name}
                  onChange={handleChange} placeholder="e.g. Wireless Mouse" required />
              </div>
              <div className="form-group">
                <label htmlFor="sku">SKU</label>
                <input id="sku" name="sku" type="text" value={formData.sku}
                  onChange={handleChange} placeholder="e.g. WM-001" required />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input id="price" name="price" type="number" step="0.01" min="0.01"
                  value={formData.price} onChange={handleChange} placeholder="e.g. 29.99" required />
              </div>
              <div className="form-group">
                <label htmlFor="stock_quantity">Stock Quantity</label>
                <input id="stock_quantity" name="stock_quantity" type="number" min="0"
                  value={formData.stock_quantity} onChange={handleChange} placeholder="e.g. 100" required />
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

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products yet. Click "Add Product" to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>SKU</th><th>Price</th>
                <th>Stock</th><th>Created</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td><code>{p.sku}</code></td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.stock_quantity < 10 ? "badge-danger" : "badge-success"}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-small btn-edit" onClick={() => openEditForm(p)}>Edit</button>
                      <button className="btn btn-small btn-delete" onClick={() => handleDelete(p.id)}>Delete</button>
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
