import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPurchases } from "../api/purchasesAPI"; // Ensure this file name matches exactly
import "../assets/styles/purchases.css";

const Purchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("today"); // "today" | "all"
  const [currentPage, setCurrentPage] = useState(1);
  const purchasesPerPage = 5;

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const data = await fetchPurchases();
        console.log("Fetched purchases data:", data);
        setPurchases(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch purchases", error);
        setPurchases([]);
      }
    };

    getPurchases();
  }, []);

  // Filter based on search + tab
  const filteredPurchases = purchases.filter((purchase) => {
    const productName = purchase.product?.name?.toLowerCase() || "";
    const matchesSearch = productName.includes(searchTerm.toLowerCase());

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
            setCurrentPage(1); // reset to page 1 on new search
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
      </div>

      {/* Purchases Table */}
      <div className="table-wrapper">
        <table className="purchases-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Cost ($)</th>
              <th>Supplier</th>
              <th>Purchase Date</th>
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
                  <td>
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
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
