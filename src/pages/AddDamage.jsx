import React, { useState, useEffect } from "react";
import { addDamage } from "../api/damagesAPI"; // Import addDamage from your API file
import { fetchProducts } from "../api/productsAPI";
import "../assets/styles/AddDamage.css";

const AddDamage = () => {
  const [damageData, setDamageData] = useState({
    product_id: "",
    quantity_damaged: "",
    damage_reason: "",
  });

  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fetch products from the backend
  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data))
      .catch(() => setMessage({ type: "error", text: "Failed to fetch products!" }));
  }, []);

  const handleChange = (e) => {
    setDamageData({ ...damageData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!damageData.product_id || !damageData.quantity_damaged || !damageData.damage_reason) {
      setMessage({ type: "error", text: "All fields are required!" });
      return;
    }

    // Use the addDamage function to send the damage data
    try {
      const result = await addDamage(damageData);
      setMessage({ type: "success", text: "Damage recorded successfully!" });
      setDamageData({ product_id: "", quantity_damaged: "", damage_reason: "" });
    } catch (error) {
      setMessage({ type: "error", text: "Failed to record damage!" });
    }
  };

  return (
    <div className="add-damage-container">
      <h2>Record Damaged Product</h2>

      {message.text && (
        <p className={message.type === "success" ? "success-message" : "error-message"}>
          {message.text}
        </p>
      )}

      <form className="add-damage-form" onSubmit={handleSubmit}>
        {/* Product Name (Dropdown) */}
        <div className="input-group">
          <label>Product Name</label>
          <select
            name="product_id"
            className="damage-product-name"
            value={damageData.product_id}
            onChange={handleChange}
          >
            <option value="">Select product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Damage Quantity */}
        <div className="input-group">
          <label>Quantity Damaged</label>
          <input
            type="number"
            name="quantity_damaged"
            className="damage-quantity"
            placeholder="Enter quantity damaged"
            value={damageData.quantity_damaged}
            onChange={handleChange}
          />
        </div>

        {/* Damage Reason */}
        <div className="input-group">
          <label>Reason for Damage</label>
          <textarea
            name="damage_reason"
            className="damage-reason"
            placeholder="Enter reason for damage"
            rows="3"
            value={damageData.damage_reason}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Submit Button */}
        <button type="submit" className="submit-btn">
          Record Damage
        </button>
      </form>
    </div>
  );
};

export default AddDamage;
