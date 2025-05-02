import React, { useState, useEffect } from "react";
import { fetchCategories } from "../api/categoriesAPI";
import { addProduct } from "../api/productsAPI";
import "../assets/styles/addProduct.css";

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [itemsPerUnit, setItemsPerUnit] = useState("");
  const [costPricePerUnit, setCostPricePerUnit] = useState("");
  const [lowStockAlert, setLowStockAlert] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        setError("Failed to fetch categories.");
        console.error("Fetch Categories Error:", error);
      }
    };

    getCategories();
  }, []);

  useEffect(() => {
    if (costPrice && itemsPerUnit && parseInt(itemsPerUnit) > 0) {
      setCostPricePerUnit((parseFloat(costPrice) / parseInt(itemsPerUnit)).toFixed(2));
    } else {
      setCostPricePerUnit("");
    }
  }, [costPrice, itemsPerUnit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name || !categoryId || !costPrice || !sellingPrice || !itemsPerUnit || !lowStockAlert) {
      setError("All fields are required.");
      return;
    }

    if (parseFloat(costPricePerUnit) >= parseFloat(sellingPrice)) {
      setError("Selling price must be higher than cost price.");
      return;
    }

    if (parseInt(itemsPerUnit) <= 0) {
      setError("Items per unit must be greater than zero.");
      return;
    }

    if (parseInt(lowStockAlert) <= 0) {
      setError("Low stock alert must be greater than zero.");
      return;
    }

    setIsSaving(true);

    const productData = {
      name,
      category_id: Number(categoryId),
      cost_price: parseFloat(costPrice),
      selling_price: parseFloat(sellingPrice),
      items_per_unit: parseInt(itemsPerUnit),
      cost_price_per_unit: parseFloat(costPricePerUnit),
      low_stock_alert: parseInt(lowStockAlert),
    };

    try {
      await addProduct(productData);
      setSuccessMessage("Product added successfully!");
      setName("");
      setCategoryId("");
      setCostPrice("");
      setSellingPrice("");
      setItemsPerUnit("");
      setCostPricePerUnit("");
      setLowStockAlert("");
    } catch (error) {
      setError("Error adding product. Please try again.");
      console.error("Create Product Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-product-container">
      <div className="form-content">
        <h2>Add New Product</h2>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="input-group">
            <label htmlFor="productName">Product Name</label>
            <input
              type="text"
              id="productName"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="product-name"
            />
          </div>

          <div className="input-group">
            <label htmlFor="categorySelect">Category</label>
            <select
              id="categorySelect"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="product-category"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="costPrice">Cost Price</label>
            <input
              type="number"
              id="costPrice"
              placeholder="Enter cost price"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className="product-cost-price"
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label htmlFor="itemsPerUnit">Items Per Unit</label>
            <input
              type="number"
              id="itemsPerUnit"
              placeholder="Enter items per box/packet"
              value={itemsPerUnit}
              onChange={(e) => setItemsPerUnit(e.target.value)}
              className="product-items-per-unit"
              min="1"
            />
          </div>

          <div className="input-group">
            <label htmlFor="costPricePerUnit">Cost Price Per Unit</label>
            <input
              type="text"
              id="costPricePerUnit"
              placeholder="Auto-calculated"
              value={costPricePerUnit}
              readOnly
              className="product-cost-price-per-unit"
            />
          </div>

          <div className="input-group">
            <label htmlFor="sellingPrice">Selling Price</label>
            <input
              type="number"
              id="sellingPrice"
              placeholder="Enter selling price"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="product-selling-price"
              min="0"
              step="0.01"
            />
          </div>

          <div className="input-group">
            <label htmlFor="lowStockAlert">Low Stock Alert</label>
            <input
              type="number"
              id="lowStockAlert"
              placeholder="Enter low stock alert threshold"
              value={lowStockAlert}
              onChange={(e) => setLowStockAlert(e.target.value)}
              className="product-low-stock-alert"
              min="1"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;