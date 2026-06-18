import { useState, useEffect } from "react";
import api from "../api";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [orderItems, setOrderItems] = useState([{ product_id: "", quantity: "1" }]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [ordRes, prodRes, custRes] = await Promise.all([
        api.get("/orders/"),
        api.get("/products/"),
        api.get("/customers/"),
      ]);
      setOrders(ordRes.data);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  function addItemRow() {
    setOrderItems([...orderItems, { product_id: "", quantity: "1" }]);
  }

  function removeItemRow(index) {
    if (orderItems.length === 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  }

  function updateItem(index, field, value) {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCustomer) {
      setError("Please select a customer");
      return;
    }

    const items = orderItems.map((item) => ({
      product_id: parseInt(item.product_id),
      quantity: parseInt(item.quantity),
    }));

    // Validate each line item before sending
    for (let i = 0; i < items.length; i++) {
      if (!items[i].product_id || isNaN(items[i].product_id)) {
        setError(`Please select a product for item ${i + 1}`);
        return;
      }
      if (!items[i].quantity || items[i].quantity < 1) {
        setError(`Quantity must be at least 1 for item ${i + 1}`);
        return;
      }
    }

    try {
      await api.post("/orders/", {
        customer_id: parseInt(selectedCustomer),
        items,
      });
      setSuccess("Order created successfully!");
      setShowForm(false);
      setSelectedCustomer("");
      setOrderItems([{ product_id: "", quantity: "1" }]);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create order");
    }
  }

  async function viewOrder(orderId) {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      setError("Failed to load order details");
    }
  }

  function getEstimatedTotal() {
    let total = 0;
    for (const item of orderItems) {
      const product = products.find((p) => p.id === parseInt(item.product_id));
      if (product && item.quantity) {
        total += product.price * parseInt(item.quantity);
      }
    }
    return total;
  }

  function productName(id) {
    const p = products.find((p) => p.id === id);
    return p ? p.name : `Product #${id}`;
  }

  function customerName(id) {
    const c = customers.find((c) => c.id === id);
    return c ? c.name : `Customer #${id}`;
  }

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-subtitle">Create and track orders</p>
        </div>
        <button className="btn btn-primary"
          onClick={() => { setShowForm(!showForm); setError(""); setSuccess(""); }}>
          + Create Order
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {showForm && (
        <div className="form-card">
          <h2>Create New Order</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="customer">Customer</label>
              <select id="customer" value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)} required>
                <option value="">-- Select Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <div className="order-items-section">
              <h3>Order Items</h3>
              {orderItems.map((item, index) => (
                <div key={index} className="order-item-row">
                  <div className="form-group">
                    <label>Product</label>
                    <select value={item.product_id}
                      onChange={(e) => updateItem(index, "product_id", e.target.value)} required>
                      <option value="">-- Select Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.price.toFixed(2)} (Stock: {p.stock_quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" min="1" value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)} required />
                  </div>
                  {orderItems.length > 1 && (
                    <button type="button" className="btn btn-small btn-delete"
                      onClick={() => removeItemRow(index)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary" onClick={addItemRow}>
                + Add Item
              </button>
            </div>

            <div className="order-total">
              <strong>Estimated Total: ${getEstimatedTotal().toFixed(2)}</strong>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Place Order</button>
              <button type="button" className="btn btn-secondary"
                onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.id}</h2>
              <button className="btn btn-small btn-secondary"
                onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Customer:</strong> {customerName(selectedOrder.customer_id)}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              <p><strong>Total:</strong> ${selectedOrder.total_amount.toFixed(2)}</p>

              <h3>Items</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th><th>Quantity</th><th>Unit Price</th><th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td>{productName(item.product_id)}</td>
                        <td>{item.quantity}</td>
                        <td>${item.unit_price.toFixed(2)}</td>
                        <td>${(item.quantity * item.unit_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="section-header">
        <h2>Order History</h2>
      </div>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet. Click "Create Order" to place your first order.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Items</th>
                <th>Total</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{customerName(order.customer_id)}</td>
                  <td>{order.items.length} item(s)</td>
                  <td>${order.total_amount.toFixed(2)}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-small btn-edit"
                      onClick={() => viewOrder(order.id)}>View</button>
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

export default OrdersPage;
