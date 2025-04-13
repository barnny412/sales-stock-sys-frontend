import React, { useState, useEffect } from "react";
import { fetchStocks } from "../api/stocksAPI"; // Import the fetchStocks function
import "../assets/styles/stocks.css";

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const getStocks = async () => {
      try {
        const data = await fetchStocks();
        setStocks(data);
      } catch (error) {
        console.error("Failed to fetch stocks:", error);
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

      <table className="products-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product Name</th>
            <th>Stock Quantity</th>
            <th>Selling Price (K)</th>
            <th>Stock Value (K)</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((stock, index) => (
            <tr key={stock.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{stock.name}</td>
              <td>{stock.stock}</td>
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
        >
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={indexOfLastItem >= filteredStocks.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Stocks;
