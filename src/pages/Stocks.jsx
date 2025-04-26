import React, { useState, useEffect } from "react";
import { fetchStocks, setStock } from "../api/productsAPI";
import "../assets/styles/stocks.css";

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [newStockLevel, setNewStockLevel] = useState("");
  const itemsPerPage = 5;

  const fetchStocksData = async () => {
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

  useEffect(() => {
    fetchStocksData();
  }, []);

  const handleAdjustStockPrompt = (stock) => {
    setSelectedStock(stock);
    setNewStockLevel(stock.stock.toString());
    setShowModal(true);
  };

  const handleAdjustStock = async () => {
    if (!selectedStock) return;

    const stockValue = parseInt(newStockLevel);
    if (isNaN(stockValue)) {
      setError("Please enter a valid stock level.");
      return;
    }
    if (stockValue < 0) {
      setError("Stock level cannot be negative.");
      return;
    }

    try {
      await setStock(selectedStock.id, stockValue);
      // Refetch stocks to ensure data consistency
      await fetchStocksData();
      setShowModal(false);
      setSelectedStock(null);
      setNewStockLevel("");
    } catch (error) {
      setError(error.message || "Failed to set stock level. Please try again.");
      console.error("Set Stock Error:", error);
    }
  };

  const handleCancelAdjust = () => {
    setShowModal(false);
    setSelectedStock(null);
    setNewStockLevel("");
    setError("");
  };

  // Filter stocks based on search term
  const filteredStocks = stocks.filter((stock) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total stock value with type safety
  const totalStockValue = filteredStocks.reduce((total, stock) => {
    const sellingPrice = Number(stock.selling_price) || 0;
    const stockQuantity = Number(stock.stock) || 0;
    return total + sellingPrice * stockQuantity;
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
          aria-label="Search stocks"
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
                <th scope="col">#</th>
                <th scope="col">Product Name</th>
                <th scope="col">Stock Quantity</th>
                <th scope="col">Low Stock Alert</th>
                <th scope="col">Selling Price (K)</th>
                <th scope="col">Stock Value (K)</th>
                <th scope="col">Actions</th>
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
                  <td>{stock.low_stock_alert}</td>
                  <td>{Number(stock.selling_price).toFixed(2)}</td>
                  <td>{(Number(stock.stock) * Number(stock.selling_price)).toFixed(2)}</td>
                  <td>
                    <button
                      className="adjust-btn"
                      onClick={() => handleAdjustStockPrompt(stock)}
                      aria-label={`Adjust stock for ${stock.name}`}
                    >
                      Adjust Stock
                    </button>
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
              className="pagination-btn"
              aria-label="Previous page"
            >
              Prev
            </button>
            <span>Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastItem >= filteredStocks.length}
              className="pagination-btn"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Custom Adjust Stock Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Adjust Stock Level</h3>
            <p>Adjust stock for "{selectedStock?.name}"</p>
            <input
              type="number"
              value={newStockLevel}
              onChange={(e) => setNewStockLevel(e.target.value)}
              className="stock-input"
              min="0"
              placeholder="Enter new stock level"
              aria-label={`New stock level for ${selectedStock?.name}`}
            />
            <div className="modal-actions">
              <button
                className="modal-confirm-btn"
                onClick={handleAdjustStock}
                aria-label="Confirm stock adjustment"
              >
                Update Stock
              </button>
              <button
                className="modal-cancel-btn"
                onClick={handleCancelAdjust}
                aria-label="Cancel stock adjustment"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stocks;