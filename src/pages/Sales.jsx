import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchSales, deleteSale } from "../api/salesAPI";
import "../assets/styles/sales.css";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("today"); // "today" | "all" | "cigarette" | "bread_tomato"
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // Added for delete loading state
  const [error, setError] = useState("");
  const salesPerPage = 5;
  const navigate = useNavigate();

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError("");
      const type = ["cigarette", "bread_tomato"].includes(currentTab) ? currentTab : null;
      console.log("Fetching sales with type:", type);
      const [salesData] = await Promise.all([fetchSales(type)]); // Removed fetchStocks for now, adjust if needed

      const enhancedSales = salesData.map((sale) => {
        const unitPrice =
          Number(sale.unit_price) ||
          Number(sale.price) ||
          Number(sale.saleProduct?.selling_price) || // Use saleProduct.selling_price as fallback
          0; // Default to 0 if no price is available
        const quantitySold =
          Number(sale.quantity_sold) ||
          (Number(sale.opening_stock) - Number(sale.closing_stock)) ||
          0; // Handle both Sale and SaleDetails
        return {
          ...sale,
          product_name: sale.product_name || sale.saleProduct?.name || "Unknown", // Use saleProduct alias
          quantity_sold: quantitySold,
          unit_price: unitPrice,
        };
      });

      console.log("Enhanced sales:", enhancedSales);
      setSales(enhancedSales);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch sales. Please try again.");
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [currentTab]);

  useEffect(() => {
    // Clear error messages after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleEdit = (sale) => {
    navigate(`/edit-sale/${sale.id}`, { state: { sale } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSale(id);
      // Refetch sales to ensure data consistency
      await fetchSalesData();
      setError("");
    } catch (error) {
      console.error("Failed to delete sale:", error);
      setError(error.response?.data?.message || error.message || "Failed to delete sale. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Memoize filteredSales to prevent unnecessary recomputation
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const productName = sale.product_name?.toLowerCase() || "";
      const matchesSearch = productName.includes(searchTerm.toLowerCase());

      if (currentTab === "cigarette" || currentTab === "bread_tomato") {
        return matchesSearch && sale.sale_type === currentTab;
      }

      const saleDate = new Date(sale.sales_date).toDateString();
      const todayDate = new Date().toDateString();
      const isToday = saleDate === todayDate;

      return matchesSearch && (currentTab === "all" || isToday);
    });
  }, [sales, searchTerm, currentTab]);

  // Pagination Logic
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
  const totalPages = Math.ceil(filteredSales.length / salesPerPage);

  return (
    <div className="sales-container">
      <div className="header">
        <input
          type="text"
          placeholder="Search sales..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
          aria-label="Search sales"
        />
        <Link to="/add-sales" className="add-sale-btn" aria-label="Add a new sale">
          + Add Sale
        </Link>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={currentTab === "today" ? "active" : ""}
          onClick={() => {
            setCurrentTab("today");
            setCurrentPage(1);
          }}
          aria-label="View today's sales"
        >
          Today's Sales
        </button>
        <button
          className={currentTab === "all" ? "active" : ""}
          onClick={() => {
            setCurrentTab("all");
            setCurrentPage(1);
          }}
          aria-label="View all sales"
        >
          All Sales
        </button>
        <button
          className={currentTab === "cigarette" ? "active" : ""}
          onClick={() => {
            setCurrentTab("cigarette");
            setCurrentPage(1);
          }}
          aria-label="View cigarette sales"
        >
          Cigarette
        </button>
        <button
          className={currentTab === "bread_tomato" ? "active" : ""}
          onClick={() => {
            setCurrentTab("bread_tomato");
            setCurrentPage(1);
          }}
          aria-label="View bread and tomato sales"
        >
          Bread/Tomato
        </button>
      </div>

      {/* Loading and Error Messages */}
      {loading && <div className="loading-message">Loading sales...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Sales Table */}
      <div className="table-wrapper">
        <table className="sales-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Product</th>
              <th scope="col">Quantity Sold</th>
              <th scope="col">Price (K)</th>
              <th scope="col">Total Price (K)</th>
              <th scope="col">Sale Date</th>
              <th scope="col">Sale Type</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSales.length > 0 ? (
              currentSales.map((sale, index) => (
                <tr key={sale.id}>
                  <td>{indexOfFirstSale + index + 1}</td>
                  <td>{sale.product_name}</td>
                  <td>{sale.quantity_sold.toFixed(2)}</td>
                  <td>{sale.unit_price.toFixed(2)}</td>
                  <td>{(sale.quantity_sold * sale.unit_price).toFixed(2)}</td>
                  <td>{new Date(sale.sales_date).toLocaleDateString()}</td>
                  <td>{sale.sale_type || "N/A"}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(sale)}
                      disabled={isDeleting}
                      aria-label={`Edit sale for ${sale.product_name}`}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(sale.id)}
                      disabled={isDeleting}
                      aria-label={`Delete sale for ${sale.product_name}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No sales found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredSales.length > salesPerPage && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Sales;