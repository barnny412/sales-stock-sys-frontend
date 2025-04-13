import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchSales } from "../api/salesAPI";
import { fetchProducts } from "../api/productsAPI"; // Fetch product names
import "../assets/styles/sales.css";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("today"); // "today" | "all"
  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 5;

  useEffect(() => {
    const getSalesData = async () => {
      try {
        const [salesData, products] = await Promise.all([
          fetchSales(),
          fetchProducts(),
        ]);

        const productMap = {};
        products.forEach((product) => {
          productMap[product.id] = product.name;
        });

        const enhancedSales = salesData.map((sale) => ({
          ...sale,
          product_name: productMap[sale.product_id] || "Unknown",
          quantity_sold: sale.opening_stock - sale.closing_stock,
        }));

        console.log("Fetched sales:", enhancedSales);
        setSales(enhancedSales);
      } catch (error) {
        console.error("Failed to fetch sales or products", error);
      }
    };

    getSalesData();
  }, []);

  // Filter sales based on search term and tab selection
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.product_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isToday =
      new Date(sale.sales_date).toDateString() ===
      new Date().toDateString();
    return matchesSearch && (currentTab === "all" || isToday);
  });

  // Pagination Logic
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);

  return (
    <div className="sales-container">
      <div className="header">
        <input
          type="text"
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Link to="/add-sales" className="add-sale-btn">
          + Add Sale
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={currentTab === "today" ? "active" : ""}
          onClick={() => setCurrentTab("today")}
        >
          Today's Sales
        </button>
        <button
          className={currentTab === "all" ? "active" : ""}
          onClick={() => setCurrentTab("all")}
        >
          All Sales
        </button>
      </div>

      {/* Sales Table */}
      <table className="sales-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Quantity Sold</th>
            <th>Sale Price (K)</th>
            <th>Total Price (K)</th>
            <th>Sale Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentSales.map((sale, index) => (
            <tr key={sale.id}>
              <td>{indexOfFirstSale + index + 1}</td>
              <td>{sale.product_name}</td>
              <td>{sale.quantity_sold}</td>
              <td>{sale.product?.selling_price}</td>
              <td>{(sale.quantity_sold * sale.product?.selling_price).toFixed(2)}</td>
              <td>{new Date(sale.sales_date).toLocaleDateString()}</td>
              <td>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastSale >= filteredSales.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Sales;
