import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchPurchases, updatePurchase, deletePurchase } from "../api/purchasesAPI";
import "../assets/styles/purchases.css";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("today");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const purchasesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const getPurchases = async () => {
      try {
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
        setError("");
      } catch (error) {
        console.error("Failed to fetch purchases", error);
        setError("Failed to fetch purchases. Please try again.");
        setPurchases([]);
      }
    };

    getPurchases();
  }, [currentTab]);

  const handleEdit = (purchase) => {
    navigate(`/edit-purchase/${purchase.id}`, { state: { purchase } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) {
      return;
    }

    try {
      await deletePurchase(id);
      setPurchases(purchases.filter((purchase) => purchase.id !== id));
      setError("");
    } catch (error) {
      console.error("Failed to delete purchase", error);
      setError("Failed to delete purchase. Please try again.");
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
        />
        <Link to="/add-purchase" className="add-purchase-btn">
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
        >
          Today's Purchases
        </button>
        <button
          className={currentTab === "all" ? "active" : ""}
          onClick={() => {
            setCurrentTab("all");
            setCurrentPage(1);
          }}
        >
          All Purchases
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

      {/* Purchases Table */}
      <div className="table-wrapper">
        <table className="purchases-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price (K)</th>
              <th>Total Cost (K)</th>
              <th>Supplier</th>
              <th>Purchase Date</th>
              <th>Purchase Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPurchases.length > 0 ? (
              currentPurchases.map((purchase, index) => {
                return (
                  <tr key={purchase.id}>
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{purchase.product?.name || "N/A"}</td>
                    <td>{purchase.quantity}</td>
                    <td>{Number(purchase.price).toFixed(2)}</td>
                    <td>{Number(purchase.total_cost).toFixed(2)}</td>
                    <td>{purchase.supplier?.name || "N/A"}</td>
                    <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                    <td>{purchase.purchase_type}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(purchase)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(purchase.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
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

export default Purchases;