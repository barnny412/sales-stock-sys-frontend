import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPurchases, deletePurchase } from "../api/purchasesAPI";
import "../assets/styles/purchases.css";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("today");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const purchasesPerPage = 5;
  const navigate = useNavigate();

  const fetchPurchasesData = async () => {
    try {
      setLoading(true);
      setError("");
      const type = ["cigarette", "bread_tomato"].includes(currentTab) ? currentTab : null;
      console.log("Fetching purchases with type:", type);
      const data = await fetchPurchases(type);
      console.log("Fetched purchases data:", data);
      const typeCounts = data.reduce((acc, purchase) => {
        acc[purchase.purchase_type] = (acc[purchase.purchase_type] || 0) + 1;
        return acc;
      }, {});
      console.log("Purchase type distribution in response:", typeCounts);
      setPurchases(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch purchases:", error);
      setError(error.message || "Failed to fetch purchases. Please try again.");
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasesData();
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

  const handleEdit = (purchase) => {
    navigate(`/edit-purchase/${purchase.id}`, { state: { purchase } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deletePurchase(id);
      // Refetch purchases to ensure data consistency
      await fetchPurchasesData();
      setError("");
    } catch (error) {
      console.error("Failed to delete purchase:", error);
      setError(error.message || "Failed to delete purchase. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter based on search + tab
  const filteredPurchases = purchases.filter((purchase) => {
    const productName = purchase.product?.name?.toLowerCase() || "";
    const matchesSearch = productName.includes(searchTerm.toLowerCase());

    if (currentTab === "cigarette" || currentTab === "bread_tomato") {
      return matchesSearch && purchase.purchase_type === currentTab;
    }

    const purchaseDate = new Date(purchase.purchase_date).toDateString();
    const todayDate = new Date().toDateString();
    const isToday = purchaseDate === todayDate;

    return matchesSearch && (currentTab === "all" || isToday);
  });

  // Pagination
  const indexOfLast = currentPage * purchasesPerPage;
  const indexOfFirst = indexOfLast - purchasesPerPage;
  const currentPurchases = filteredPurchases.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPurchases.length / purchasesPerPage);

  // Debug: Log currentPurchases to ensure data integrity
  console.log("Current purchases:", currentPurchases);

  // Calculate total purchase cost for filtered purchases
  const totalPurchaseCost = filteredPurchases
    .reduce((total, purchase) => total + Number(purchase.total_cost), 0)
    .toFixed(2);

  return (
    <div className="purchases-container">
      {/* Search + Add */}
      <div className="header">
        <input
          type="text"
          placeholder="Search purchases..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
          aria-label="Search purchases"
        />
        <Link to="/add-purchase" className="add-purchase-btn" aria-label="Add a new purchase">
          + Add Purchase
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
          aria-label="View today's purchases"
        >
          Today's Purchases
        </button>
        <button
          className={currentTab === "all" ? "active" : ""}
          onClick={() => {
            setCurrentTab("all");
            setCurrentPage(1);
          }}
          aria-label="View all purchases"
        >
          All Purchases
        </button>
        <button
          className={currentTab === "cigarette" ? "active" : ""}
          onClick={() => {
            setCurrentTab("cigarette");
            setCurrentPage(1);
          }}
          aria-label="View cigarette purchases"
        >
          Cigarette
        </button>
        <button
          className={currentTab === "bread_tomato" ? "active" : ""}
          onClick={() => {
            setCurrentTab("bread_tomato");
            setCurrentPage(1);
          }}
          aria-label="View bread and tomato purchases"
        >
          Bread/Tomato
        </button>
      </div>

      {/* Loading and Error Messages */}
      {loading && <div className="loading-message">Loading purchases...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Total Purchase Cost */}
      {!loading && filteredPurchases.length > 0 && (
        <div className="total-purchase-cost">
          <strong>Total Purchase Cost:</strong> K{totalPurchaseCost}
        </div>
      )}

      {/* Purchases Table */}
      <div className="table-wrapper">
        <table className="purchases-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Product</th>
              <th scope="col">Quantity</th>
              <th scope="col">Price (K)</th>
              <th scope="col">Total Cost (K)</th>
              <th scope="col">Supplier</th>
              <th scope="col">Purchase Date</th>
              <th scope="col">Purchase Type</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPurchases.length > 0 ? (
              currentPurchases.map((purchase, index) => (
                <tr key={purchase.id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{purchase.product?.name || "N/A"}</td>
                  <td>{purchase.quantity}</td>
                  <td>{Number(purchase.price).toFixed(2)}</td>
                  <td>{Number(purchase.total_cost).toFixed(2)}</td>
                  <td>{purchase.supplier?.name || "N/A"}</td>
                  <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                  <td>{purchase.purchase_type || "N/A"}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(purchase)}
                      disabled={isDeleting}
                      aria-label={`Edit purchase for ${purchase.product?.name || "unknown product"}`}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(purchase.id)}
                      disabled={isDeleting}
                      aria-label={`Delete purchase for ${purchase.product?.name || "unknown product"}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  No purchases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPurchases.length > purchasesPerPage && (
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

export default Purchases;