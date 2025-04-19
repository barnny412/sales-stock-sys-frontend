import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchSales, updateSale, deleteSale } from "../api/salesAPI";
import { fetchProducts } from "../api/productsAPI";
import "../assets/styles/sales.css";

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("today"); // "today" | "all" | "cigarette" | "bread_tomato"
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const salesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const getSalesData = async () => {
      try {
        const type = ["cigarette", "bread_tomato"].includes(currentTab) ? currentTab : null;
        console.log("Fetching sales with type:", type);
        const [salesData, products] = await Promise.all([
          fetchSales(type),
          fetchProducts(),
        ]);

        const productMap = {};
        products.forEach((product) => {
          productMap[product.id] = product.name;
        });

        const enhancedSales = salesData.map((sale) => {
          const sellingPrice = sale.price ? parseFloat(sale.price) : 0; // Use sale.price instead of product.selling_price
          return {
            ...sale,
            product_name: productMap[sale.product_id] || "Unknown",
            quantity_sold: sale.quantity_sold || sale.opening_stock - sale.closing_stock,
            price: sellingPrice, // Store as a number
          };
        });

        console.log("Enhanced sales:", enhancedSales);
        setSales(enhancedSales);
        setError("");
      } catch (error) {
        console.error("Failed to fetch sales or products", error);
        setError("Failed to fetch sales or products. Please try again.");
        setSales([]);
      }
    };

    getSalesData();
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

    try {
      await deleteSale(id);
      setSales(sales.filter((sale) => sale.id !== id));
      setError("");
    } catch (error) {
      console.error("Failed to delete sale", error);
      setError("Failed to delete sale. Please try again.");
    }
  };

  // Filter sales based on search term and tab selection
  const filteredSales = sales.filter((sale) => {
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
        />
        <Link to="/add-sales" className="add-sale-btn">
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
        >
          Today's Sales
        </button>
        <button
          className={currentTab === "all" ? "active" : ""}
          onClick={() => {
            setCurrentTab("all");
            setCurrentPage(1);
          }}
        >
          All Sales
        </button>
        <button
          className={currentTab === "cigarette" ? "active" : ""}
          onClick={() => {
            setCurrentTab("cigarette");
            setCurrentPage(1);
          }}
        >
          Cigarette
        </button>
        <button
          className={currentTab === "bread_tomato" ? "active" : ""}
          onClick={() => {
            setCurrentTab("bread_tomato");
            setCurrentPage(1);
          }}
        >
          Bread/Tomato
        </button>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Sales Table */}
      <div className="table-wrapper">
        <table className="sales-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Quantity Sold</th>
              <th>Price (K)</th>
              <th>Total Price (K)</th>
              <th>Sale Date</th>
              <th>Sale Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSales.length > 0 ? (
              currentSales.map((sale, index) => (
                <tr key={sale.id}>
                  <td>{indexOfFirstSale + index + 1}</td>
                  <td>{sale.product_name}</td>
                  <td>{sale.quantity_sold}</td>
                  <td>{sale.price.toFixed(2)}</td>
                  <td>{(sale.quantity_sold * sale.price).toFixed(2)}</td>
                  <td>{new Date(sale.sales_date).toLocaleDateString()}</td>
                  <td>{sale.sale_type}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(sale)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(sale.id)}>
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
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Sales;