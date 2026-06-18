import { useState, useEffect } from "react";
import api from "../api";

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const [prodRes, custRes, ordRes] = await Promise.all([
        api.get("/products/"),
        api.get("/customers/"),
        api.get("/orders/"),
      ]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setOrders(ordRes.data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  const lowStock = products.filter((p) => p.stock_quantity < 10);
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="page-subtitle">Overview of your inventory and orders</p>

      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{products.length}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{customers.length}</h3>
            <p>Total Customers</p>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>{orders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card stat-card-gold">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>${totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="alert-section">
          <h2>⚠️ Low Stock Alerts</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td><span className="badge badge-danger">{p.stock_quantity}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {orders.length > 0 && (
        <div className="recent-section">
          <h2>📋 Recent Orders</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer ID</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customer_id}</td>
                    <td>${order.total_amount.toFixed(2)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
