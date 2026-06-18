import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import CustomersPage from "./pages/CustomersPage";
import OrdersPage from "./pages/OrdersPage";

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");

  function renderPage() {
    switch (currentPage) {
      case "dashboard": return <Dashboard />;
      case "products": return <ProductsPage />;
      case "customers": return <CustomersPage />;
      case "orders": return <OrdersPage />;
      default: return <Dashboard />;
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📊</span>
          <h2>InvenTrack</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentPage === "dashboard" ? "active" : ""}`}
            onClick={() => setCurrentPage("dashboard")}
          >
            <span className="nav-icon">🏠</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${currentPage === "products" ? "active" : ""}`}
            onClick={() => setCurrentPage("products")}
          >
            <span className="nav-icon">📦</span>
            <span>Products</span>
          </button>
          <button
            className={`nav-item ${currentPage === "customers" ? "active" : ""}`}
            onClick={() => setCurrentPage("customers")}
          >
            <span className="nav-icon">👥</span>
            <span>Customers</span>
          </button>
          <button
            className={`nav-item ${currentPage === "orders" ? "active" : ""}`}
            onClick={() => setCurrentPage("orders")}
          >
            <span className="nav-icon">🛒</span>
            <span>Orders</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <p>Inventory & Order<br />Management System</p>
        </div>
      </aside>

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
