import React, { useState, useEffect } from "react";
import Select from "react-select";
import { addDamage } from "../api/damagesAPI";
import { fetchStocks } from "../api/productsAPI";
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
      const data = await fetchStocks();
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

  const handleProductChange = (selectedOption) => {
    setDamageData({ ...damageData, product_id: selectedOption ? selectedOption.value : "" });
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
      await fetchProductsData();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Failed to record damage!" });
      console.error("Record Damage Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const productOptions = products.map((product) => ({
    value: product.id,
    label: `${product.name} (Stock: ${product.stock})`,
  }));

  const customStyles = {
    input: (provided) => ({
      ...provided,
      color: "#fff",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#fff",
    }),
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
            <label>
              Product Name:
              <Select
                id="product_id"
                name="product_id"
                className="product-select" // Updated className for consistency
                classNamePrefix="react-select"
                value={productOptions.find((option) => option.value === parseInt(damageData.product_id))}
                onChange={handleProductChange}
                options={productOptions}
                isDisabled={isSubmitting}
                placeholder="Select product..."
                isClearable={false}
                required
                styles={customStyles}
                aria-label="Select a product"
                aria-required="true"
              />
            </label>

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