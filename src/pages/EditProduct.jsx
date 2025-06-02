import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCategories } from "../api/categoriesAPI";
import { getProductById, updateProduct } from "../api/productsAPI";
import "../assets/styles/addProduct.css";

const EditProduct = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate(); // For redirecting after update
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [itemsPerUnit, setItemsPerUnit] = useState("");
  const [costPricePerUnit, setCostPricePerUnit] = useState("");
  const [lowStockAlert, setLowStockAlert] = useState("");
  const [requiresManualQuantity, setRequiresManualQuantity] = useState(false);
  const [requiresManualPrice, setRequiresManualPrice] = useState(false); // New state
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch categories and product data on mount
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

    const getProduct = async () => {
      try {
        const product = await getProductById(id);
        setName(product.name);
        setCategoryId(product.category_id);
        setCostPrice(product.cost_price);
        setSellingPrice(product.selling_price);
        setItemsPerUnit(product.items_per_unit);
        setCostPricePerUnit(product.cost_price_per_unit);
        setLowStockAlert(product.low_stock_alert);
        setRequiresManualQuantity(product.requires_manual_quantity || false);
        setRequiresManualPrice(product.requires_manual_price || false); // Populate new field
      } catch (error) {
        setError("Failed to fetch product details.");
        console.error("Fetch Product Error:", error);
      }
    };

    getCategories();
    getProduct();
  }, [id]);

  // Auto-calculate cost price per unit when cost price or items per unit change
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

    // Validate all required fields
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
      requires_manual_quantity: requiresManualQuantity,
      requires_manual_price: requiresManualPrice, // Include new field
    };

    try {
      await updateProduct(id, productData);
      setSuccessMessage("Product updated successfully!");
      setTimeout(() => navigate("/products"), 1500); // Redirect to products page after 1.5 seconds
    } catch (error) {
      setError("Error updating product. Please try again.");
      console.error("Update Product Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Edit Product</h2>

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

        <div className="input-group">
          <label htmlFor="requiresManualQuantity">
            <input
              type="checkbox"
              id="requiresManualQuantity"
              checked={requiresManualQuantity}
              onChange={(e) => setRequiresManualQuantity(e.target.checked)}
              className="product-requires-manual-quantity"
            />
            Requires Manual Quantity Entry
          </label>
        </div>

        <div className="input-group">
          <label htmlFor="requiresManualPrice">
            <input
              type="checkbox"
              id="requiresManualPrice"
              checked={requiresManualPrice}
              onChange={(e) => setRequiresManualPrice(e.target.checked)}
              className="product-requires-manual-price"
            />
            Requires Manual Price Entry
          </label>
        </div>

        <button type="submit" className="submit-btn" disabled={isSaving}>
          {isSaving ? "Updating..." : "Update Product"}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;