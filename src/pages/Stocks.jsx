import React, { useState, useEffect } from "react";
import { fetchStocks } from "../api/stocksAPI";
import "../assets/styles/stocks.css";

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    const getStocks = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await fetchStocks();
        setStocks(data);
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
        setError("Failed to fetch stocks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getStocks();
  }, []);

  // Filter stocks based on search term
  const filteredStocks = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total stock value
  const totalStockValue = filteredStocks.reduce((total, stock) => {
    return total + stock.selling_price * stock.stock;
  }, 0);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStocks.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="products-container">
      {/* Search Input & Total Stock Value */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="total-stock-value">
          <strong>Total Stock Value:</strong> K {totalStockValue.toFixed(2)}
        </div>
      </div>

      {loading && <p className="loading-message">Loading stocks...</p>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && filteredStocks.length === 0 && (
        <p className="no-stocks-message">No stocks available.</p>
      )}
      {!loading && !error && filteredStocks.length > 0 && (
        <>
          <table className="products-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Stock Quantity</th>
                <th>Low Stock Alert</th> {/* Added column for transparency */}
                <th>Selling Price (K)</th>
                <th>Stock Value (K)</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((stock, index) => (
                <tr
                  key={stock.id}
                  className={stock.stock <= stock.low_stock_alert ? "low-stock-row" : ""}
                >
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{stock.name}</td>
                  <td>{stock.stock}</td>
                  <td>{stock.low_stock_alert}</td> {/* Display low stock alert */}
                  <td>{Number(stock.selling_price).toFixed(2)}</td>
                  <td>{(stock.stock * stock.selling_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Prev
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastItem >= filteredStocks.length}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Stocks;