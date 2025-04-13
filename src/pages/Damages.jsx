import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDamages, deleteDamage } from "../api/damagesAPI";
import "../assets/styles/damages.css";

const Damages = () => {
  const [damages, setDamages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const getDamages = async () => {
      try {
        const data = await fetchDamages();
        setDamages(data);
      } catch (error) {
        console.error("Failed to fetch damages");
      }
    };
    getDamages();
  }, []);

  // Filter damages based on search term
  const filteredDamages = damages.filter((damage) =>
    damage?.damage_reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDamages.slice(indexOfFirstItem, indexOfLastItem);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      await deleteDamage(id);
      setDamages(damages.filter((damage) => damage.id !== id));
    }
  };

  return (
    <div className="damages-container">
      <div className="header">
        <input
          type="text"
          placeholder="Search damages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Link to="/add-damage" className="add-damage-btn">
          + Add Damage
        </Link>
      </div>

      <table className="damages-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Total</th>
            <th>Reason</th>
            <th>Reported At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((damage, index) => (
            <tr key={damage.id}>
              <td>{indexOfFirstItem + index + 1}</td>
              <td>{damage.Product?.name}</td>
              <td>{damage.quantity_damaged}</td>
              <td>{damage.Product?.selling_price}</td>
              <td>{(damage.quantity_damaged * damage.Product?.selling_price).toFixed(2)}</td>
              <td>{damage.damage_reason}</td>
              <td>{new Date(damage.damage_date).toLocaleDateString()}</td>
              <td>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(damage.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={indexOfLastItem >= filteredDamages.length}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Damages;
