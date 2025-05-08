import React, { useState, useEffect, useRef } from "react";
import { fetchStocks, setStock } from "../api/productsAPI";
import "../assets/styles/stocks.css";

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all"); // Default to "all" categories
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [newStockLevel, setNewStockLevel] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(8); // Initial value, will be dynamic
  const stockInputRef = useRef(null); // Ref for the input field

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

  // Calculate itemsPerPage based on screen height
  useEffect(() => {
    const calculateItemsPerPage = () => {
      // Row height based on CSS (.products-table td)
      const rowHeight = 50; // 24px (content) + 24px (padding) + 2px (border)

      // Fixed heights based on CSS
      const tableHeaderHeight = 50; // 24px (content) + 24px (padding) + 2px (border)
      const paginationHeight = 60; // 40px (pagination) + 20px (margin-top)
      const containerPaddingAndMargin = 110; // 40px (padding) + 70px (margin-top)
      const navbarHeight = 60; // From min-height: calc(100vh - 60px)

      // Determine top-bar height based on screen width (responsive layout)
      const isSmallScreen = window.innerWidth <= 768;
      const topBarHeight = isSmallScreen ? 171 : 66; // 151px + 20px (margin-bottom) vs 46px + 20px

      // Total fixed height
      const fixedHeight =
        topBarHeight +
        tableHeaderHeight +
        paginationHeight +
        containerPaddingAndMargin +
        navbarHeight;

      // Available height for the table body
      const availableHeight = window.innerHeight - fixedHeight;

      // Calculate maximum number of rows that can fit
      const maxRows = Math.floor(availableHeight / rowHeight);

      // Ensure at least 1 item per page, with a reasonable minimum and maximum
      const newItemsPerPage = Math.max(1, Math.min(maxRows, 15)); // Cap at 15 for practicality
      setItemsPerPage(newItemsPerPage);
    };

    calculateItemsPerPage();
    window.addEventListener("resize", calculateItemsPerPage);

    // Cleanup event listener
    return () => window.removeEventListener("resize", calculateItemsPerPage);
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

  // Handle Enter key press to update stock
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAdjustStock();
    }
  };

  // Focus and select input when modal opens
  useEffect(() => {
    if (showModal && stockInputRef.current) {
      stockInputRef.current.focus();
      stockInputRef.current.select(); // Highlights the input content
    }
  }, [showModal]);

  // Filter stocks based on search term and selected category
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch = stock.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || stock.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  // Extract unique categories for the select options
  const categories = [
    "all",
    ...new Set(stocks.map((stock) => stock.category).filter(Boolean)),
  ];

  return (
    <div className="products-container">
      {/* Search Input, Category Select & Total Stock Value */}
      <div className="top-bar">
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          aria-label="Search stocks"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
          aria-label="Filter by category"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
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
              onClick={() => setCurrentPage(currentPage + 1)} // Fixed typo from onChange to onClick
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
              onKeyPress={handleKeyPress} // Add Enter key listener
              ref={stockInputRef} // Attach ref to input
              autoFocus // Automatically focus on modal open
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