import React, { useState, useEffect } from "react";
import { fetchProducts } from "../api/productsAPI"; // Assuming you have an API call to fetch products
import "../assets/styles/addDamage.css"; // Reusing Add Product CSS

const AddDamage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [damageQuantity, setDamageQuantity] = useState("");
  const [damageReason, setDamageReason] = useState("");
  const [damageList, setDamageList] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        setError("Failed to fetch products.");
        console.error("Fetch Products Error:", error);
      }
    };

    getProducts();
  }, []);

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  };

  const handleAddDamage = () => {
    if (!selectedProduct || !damageQuantity || !damageReason) {
      setError("All fields are required.");
      return;
    }

    if (damageList.some((damage) => damage.product_id === selectedProduct)) {
      setError("This product is already added.");
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    const totalCost = parseFloat(damageQuantity) * parseFloat(product.cost_price); // Assuming cost_price exists
    const damageDate = new Date().toISOString().split("T")[0]; // Get today's date

    setDamageList([
      ...damageList,
      {
        product_id: selectedProduct,
        product_name: product.name,
        quantity: parseInt(damageQuantity, 10),
        damage_reason: damageReason,
        total_cost: totalCost.toFixed(2),
        date: damageDate,
      },
    ]);

    setSelectedProduct("");
    setDamageQuantity("");
    setDamageReason("");
    setError("");
  };

  const handleSaveDamages = async () => {
    if (damageList.length === 0) {
      setError("Please add at least one damaged product.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    // Extract only necessary fields
    const damagesToSave = damageList.map(({ product_id, quantity, damage_reason }) => ({
      product_id: Number(product_id),
      quantity: Number(quantity),
      damage_reason,
    }));

    console.log("Sending payload:", JSON.stringify(damagesToSave, null, 2));

    try {
      // Replace with your API call to save damage records
      await fetch("/api/damages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(damagesToSave),
      });
      setSuccessMessage("Damages recorded successfully!");
      setDamageList([]);
    } catch (error) {
      setError("Error while saving damages. Please try again.");
      console.error("Save Damages Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-damage-container">
      <h2>Record Damaged Product</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="add-damage-form">
        {/* Product Selection */}
        <select
          value={selectedProduct}
          onChange={handleProductChange}
          className="product-select"
        >
          <option value="">Select Product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity Damaged"
          value={damageQuantity}
          onChange={(e) => setDamageQuantity(e.target.value)}
          className="quantity-input"
          min="1"
        />

        <textarea
          placeholder="Reason for Damage"
          value={damageReason}
          onChange={(e) => setDamageReason(e.target.value)}
          className="damage-reason-input"
          rows="3"
        />

        <button className="add-damage-btn" onClick={handleAddDamage}>
          Add Damage
        </button>
      </div>

      <div className="damage-list">
        <h3>Damages List</h3>
        <table className="damage-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Damage Reason</th>
              <th>Total Cost</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {damageList.length > 0 ? (
              damageList.map((damage, index) => (
                <tr key={index}>
                  <td>{damage.product_name}</td>
                  <td>{damage.quantity}</td>
                  <td>{damage.damage_reason}</td>
                  <td>{damage.total_cost}</td>
                  <td>{damage.date}</td>
                  <td>
                    <button
                      className="remove-btn"
                      onClick={() =>
                        setDamageList(damageList.filter((_, i) => i !== index))
                      }
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-damages-message">
                  No damages added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button className="save-damages-btn" onClick={handleSaveDamages} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Damages"}
        </button>
      </div>
    </div>
  );
};

export default AddDamage;
