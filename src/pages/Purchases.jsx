import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPurchases } from "../api/purchasesAPI";
import "../assets/styles/purchases.css";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("today");
  const [currentPage, setCurrentPage] = useState(1);
  const purchasesPerPage = 5;

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const type = ["cigarette", "bread_tomato"].includes(currentTab) ? currentTab : null;
        console.log("Fetching purchases with type:", type); // Debug: Confirm type parameter
        const data = await fetchPurchases(type);
        console.log("Fetched purchases data:", data);
        // Debug: Log the purchase_type distribution in the response
        const typeCounts = data.reduce((acc, purchase) => {
          acc[purchase.purchase_type] = (acc[purchase.purchase_type] || 0) + 1;
          return acc;
        }, {});
        console.log("Purchase type distribution in response:", typeCounts);
        setPurchases(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch purchases", error);
        setPurchases([]);
      }
    };

    getPurchases();
  }, [currentTab]);

  // Filter based on search + tab
  const filteredPurchases = purchases.filter((purchase) => {
    const productName = purchase.product?.name?.toLowerCase() || "";
    const matchesSearch = productName.includes(searchTerm.toLowerCase());

    // For cigarette and bread_tomato tabs, ensure purchase_type matches
    if (currentTab === "cigarette" || currentTab === "bread_tomato") {
      return matchesSearch && purchase.purchase_type === currentTab;
    }

    // For today and all tabs, apply date-based filtering
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

      {/* Purchases Table */}
      <div className="table-wrapper">
        <table className="purchases-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Cost (K)</th>
              <th>Supplier</th>
              <th>Purchase Date</th>
              <th>Purchase Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPurchases.length > 0 ? (
              currentPurchases.map((purchase, index) => (
                <tr key={purchase.id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{purchase.product?.name || "N/A"}</td>
                  <td>{purchase.quantity}</td>
                  <td>{purchase.total_cost}</td>
                  <td>{purchase.supplier?.name || "N/A"}</td>
                  <td>
                    {new Date(purchase.purchase_date).toLocaleDateString()}
                  </td>
                  <td>{purchase.purchase_type}</td>
                  <td>
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
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