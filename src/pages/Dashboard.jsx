import React, { useState, useEffect } from "react";
import { fetchDashboardData } from "../api/dashboardAPI";
import "../assets/styles/dashboard.css";

const Dashboard = () => {
  const [salesData, setSalesData] = useState({});
  const [topSellingProductsOfDay, setTopSellingProductsOfDay] = useState([]);
  const [stockData, setStockData] = useState({});
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [cashflow, setCashflow] = useState({
    totalCashIn: "0.00",
    totalCashOut: "0.00",
    currentBalance: "0.00",
  });
  const [expenses, setExpenses] = useState({});
  const [damages, setDamages] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDashboardData();

        const defaultCashflow = {
          totalCashIn: "0.00",
          totalCashOut: "0.00",
          currentBalance: "0.00",
        };

        // Set dashboard data
        setSalesData(data.sales || {});
        setTopSellingProductsOfDay(
          Array.isArray(data.topSellingOfDay) ? data.topSellingOfDay : data.topSellingOfDay ? [data.topSellingOfDay] : []
        );
        setStockData(data.stock || {});
        setLowStockProducts(data.lowStock || []);
        setCashflow(data.cashflow || defaultCashflow);
        setExpenses(data.expenses || {});
        setDamages(data.damages || {});
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setCashflow({
          totalCashIn: "0.00",
          totalCashOut: "0.00",
          currentBalance: "0.00",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getDashboardData();
  }, []);

  if (isLoading) {
    return <div className="loading-message">Loading dashboard data...</div>;
  }

  return (
    <div className="dashboard_container">
      <h1>Dashboard</h1>

      {/* Sales Overview */}
      <div className="dashboard_section">
        <h2>Sales Overview</h2>
        <div className="dashboard_cards">
          <div className="card">
            Total Sales Today: K{salesData.totalSalesToday ?? 0}
          </div>
          <div className="card">
            Total Revenue Today: K{salesData.totalRevenueToday ?? "0.00"}
          </div>
          <div className="card">
            Total Sales This Month: K{salesData.totalSalesMonth ?? 0}
          </div>
          <div className="card">
            Total Revenue This Month: K{salesData.totalRevenueMonth ?? "0.00"}
          </div>
        </div>

        <h3>Top Selling Products</h3>
        <ul className="top-selling-list">
          {topSellingProductsOfDay.length > 0 ? (
            topSellingProductsOfDay.map((product, index) => (
              <li key={index}>
                {product.product_name || product.name} - {product.quantitySold ?? 0} Sold
              </li>
            ))
          ) : (
            <li>No sales recorded today.</li>
          )}
        </ul>
      </div>

      {/* Stock & Inventory */}
      <div className="dashboard_section">
        <h2>Stock & Inventory</h2>
        <div className="dashboard_cards">
          <div className="card">
            Total Products in Stock: {stockData.totalStock ?? 0}
          </div>
          <div className="card">
            Stock Value (Cost Price): K{stockData.totalStockValueCost ?? "0.00"}
          </div>
          <div className="card">
            Stock Value (Selling Price): K{stockData.totalStockValueSelling ?? "0.00"}
          </div>
          <div className="card">
            Low Stock Products: {stockData.lowStockProducts ?? 0}
          </div>
        </div>

        <h3>Low Stock Alerts</h3>
        <ul className="low-stock-list">
          {lowStockProducts.map((product, index) => (
            <li key={index}>
              {product.name} - {product.stock} remaining (Alert: {product.low_stock_alert ?? "N/A"})
            </li>
          ))}
        </ul>
      </div>

      {/* Cashflow Summary */}
      <div className="dashboard_section">
        <h2>Cashflow Summary</h2>
        <div className="dashboard_cards">
          <div className="card">
            Cash In: K{cashflow.totalCashIn}
          </div>
          <div className="card">
            Cash Out: K{cashflow.totalCashOut}
          </div>
          <div className="card">
            Current Balance: K{cashflow.currentBalance}
          </div>
        </div>
      </div>

      {/* Expenses Overview */}
      <div className="dashboard_section">
        <h2>Expenses Overview</h2>
        <div className="dashboard_cards">
          <div className="card">
            Total Expenses: K{expenses.totalExpenses ?? "0.00"}
          </div>
          <div className="card">
            Monthly Expenses: K{expenses.monthlyExpenses ?? "0.00"}
          </div>
          <div className="card">
            Yearly Expenses: K{expenses.yearlyExpenses ?? "0.00"}
          </div>
        </div>
      </div>

      {/* Damages & Losses */}
      <div className="dashboard_section">
        <h2>Product Damages</h2>
        <div className="dashboard_cards">
          <div className="card">
            Total Damaged Quantity: {damages.totalDamagedQuantity ?? 0}
          </div>
          <div className="card">
            Total Damage Value: K{damages.totalDamageValue ?? "0.00"}
          </div>
        </div>

        <h3>Most Damaged Products</h3>
        <ul>
          {(damages.mostDamagedProducts || []).map((product, index) => (
            <li key={index}>
              {product.name} - {product.quantity_damaged} damaged
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;