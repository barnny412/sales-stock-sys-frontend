import React, { useState, useEffect } from "react";
import { addDamage } from "../api/damagesAPI";
import { fetchStocks } from "../api/productsAPI"; // Updated to use fetchStocks
import "../assets/styles/addDamage.css";

const AddDamage = () => {
  const [damageData, setDamageData] = useState({
    product_id: "",
    quantity_damaged: "",
    damage_reason: "",
  });
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProductsData = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: "", text: "" });
      const data = await fetchStocks(); // Updated to use fetchStocks
      setProducts(data);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to fetch products!" });
      console.error("Fetch Products Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  useEffect(() => {
    // Clear success/error messages after 5 seconds
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    setDamageData({ ...damageData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!damageData.product_id) {
      setMessage({ type: "error", text: "Please select a product." });
      return;
    }
    if (!damageData.quantity_damaged) {
      setMessage({ type: "error", text: "Please enter the quantity damaged." });
      return;
    }
    if (!damageData.damage_reason) {
      setMessage({ type: "error", text: "Please enter the reason for damage." });
      return;
    }

    const quantityDamaged = Number(damageData.quantity_damaged);
    if (isNaN(quantityDamaged) || quantityDamaged <= 0) {
      setMessage({ type: "error", text: "Quantity damaged must be a valid number greater than 0." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const formattedData = {
        product_id: parseInt(damageData.product_id),
        quantity_damaged: quantityDamaged,
        damage_reason: damageData.damage_reason,
      };
      await addDamage(formattedData);
      setMessage({ type: "success", text: "Damage recorded successfully!" });
      setDamageData({ product_id: "", quantity_damaged: "", damage_reason: "" });
      // Refetch products to reflect any stock changes
      await fetchProductsData();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to record damage!" });
      console.error("Record Damage Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-damage-container">
      <h2>Record Damaged Product</h2>

      {isLoading ? (
        <div className="loading-message">Loading products...</div>
      ) : (
        <>
          {message.text && (
            <p className={message.type === "success" ? "success-message" : "error-message"}>
              {message.text}
            </p>
          )}

          <form className="add-damage-form" onSubmit={handleSubmit}>
            {/* Product Name (Dropdown) */}
            <div className="input-group">
              <label htmlFor="product_id">Product Name</label>
              <select
                id="product_id"
                name="product_id"
                className="damage-product-name"
                value={damageData.product_id}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-label="Select a product"
                aria-required="true"
              >
                <option value="">Select product</option>
                {products.length > 0 ? (
                  products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No products available
                  </option>
                )}
              </select>
            </div>

            {/* Damage Quantity */}
            <div className="input-group">
              <label htmlFor="quantity_damaged">Quantity Damaged</label>
              <input
                id="quantity_damaged"
                type="number"
                name="quantity_damaged"
                className="damage-quantity"
                placeholder="Enter quantity damaged"
                value={damageData.quantity_damaged}
                onChange={handleChange}
                min="1"
                disabled={isSubmitting}
                aria-label="Enter quantity damaged"
                aria-required="true"
              />
            </div>

            {/* Damage Reason */}
            <div className="input-group">
              <label htmlFor="damage_reason">Reason for Damage</label>
              <textarea
                id="damage_reason"
                name="damage_reason"
                className="damage-reason"
                placeholder="Enter reason for damage"
                rows="3"
                value={damageData.damage_reason}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-label="Enter reason for damage"
                aria-required="true"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting}
              aria-label="Record damage"
            >
              {isSubmitting ? "Recording..." : "Record Damage"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AddDamage;