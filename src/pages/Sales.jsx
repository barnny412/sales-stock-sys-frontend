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
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const salesPerPage = 5;
  const navigate = useNavigate();

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      setError("");
      const type = ["cigarette", "bread_tomato"].includes(currentTab) ? currentTab : null;
      console.log("Fetching sales with type:", type);
      const [salesData] = await Promise.all([fetchSales(type)]);

      // Enhance sales data with fallback values and ensure numbers are parsed
      const enhancedSales = salesData.map((sale) => {
        const totalQuantity = parseFloat(sale.total_quantity) || 0;
        const totalAmount = parseFloat(sale.total_amount) || 0;
        let productName = sale.saleProduct?.name || "Unknown";

        // Fallback to first saleDetail product_id if saleProduct is null
        if (!sale.saleProduct && sale.saleDetails?.length > 0) {
          const firstDetail = sale.saleDetails[0];
          if (firstDetail.product_id) {
            productName = `Missing Product (ID: ${firstDetail.product_id})`;
          }
        }

        return {
          ...sale,
          saleDetails: sale.saleDetails || [],
          product_name: productName,
          total_quantity: totalQuantity, // Ensure number
          total_amount: totalAmount, // Ensure number
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

  // State to manage expanded rows
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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
              <th scope="col">Total Quantity</th>
              <th scope="col">Total Amount (K)</th>
              <th scope="col">Sale Date</th>
              <th scope="col">Sale Type</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSales.length > 0 ? (
              currentSales.map((sale, index) => (
                <React.Fragment key={sale.id}>
                  <tr>
                    <td>{indexOfFirstSale + index + 1}</td>
                    <td>{sale.product_name}</td>
                    <td>{sale.total_quantity.toFixed(2)}</td>
                    <td>{sale.total_amount.toFixed(2)}</td>
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
                      <button
                        className="toggle-btn"
                        onClick={() => toggleRow(sale.id)}
                        aria-label={`Toggle details for ${sale.product_name}`}
                      >
                        {expandedRows[sale.id] ? "Hide Details" : "Show Details"}
                      </button>
                    </td>
                  </tr>
                  {expandedRows[sale.id] && sale.saleDetails.length > 0 && (
                    <tr>
                      <td colSpan="7">
                        <table className="details-table">
                          <thead>
                            <tr>
                              <th>Detail ID</th>
                              <th>Quantity Sold</th>
                              <th>Unit Price (K)</th>
                              <th>Total Price (K)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sale.saleDetails.map((detail) => (
                              <tr key={detail.id}>
                                <td>{detail.id}</td>
                                <td>{Number(detail.quantity_sold).toFixed(2)}</td>
                                <td>{Number(detail.unit_price).toFixed(2)}</td>
                                <td>{Number(detail.total_price).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
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