import React, { useState, useEffect } from "react";
import Select from "react-select";
import { createPurchase } from "../api/purchasesAPI";
import { fetchProductsWithCategory } from "../api/productsAPI";
import { fetchSuppliers } from "../api/suppliersAPI";
import "../assets/styles/addpurchases.css";

const AddPurchase = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // Changed to null initially
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [purchaseList, setPurchaseList] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("cigarette");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [productsData, suppliersData] = await Promise.all([
        fetchProductsWithCategory(),
        fetchSuppliers(),
      ]);
      setProducts(productsData || []);
      setSuppliers(suppliersData || []);
    } catch (err) {
      setError(err.message || "Failed to load products or suppliers.");
      console.error("Fetch Data Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const handleProductChange = (selectedOption) => {
    console.log("Selected Option:", selectedOption); // Debug log
    const productId = selectedOption ? selectedOption.value : null;
    setSelectedProduct(productId);

    if (!selectedOption) {
      setPrice(""); // Reset price when cleared
      console.log("Cleared selection, price reset");
      return;
    }

    const product = products.find((p) => String(p.id) === String(productId));
    console.log("Found Product:", product); // Debug log
    if (product) {
      const costPrice = parseFloat(product.cost_price);
      setPrice(isNaN(costPrice) || costPrice < 0 ? "" : costPrice.toFixed(2));
    } else {
      setPrice("");
    }
  };

  const handleAddPurchase = (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      setError("Please select a product.");
      return;
    }
    if (!quantity) {
      setError("Please enter the quantity.");
      return;
    }
    if (!price) {
      setError("Please enter the price.");
      return;
    }

    const product = products.find((p) => String(p.id) === String(selectedProduct));
    const supplier = selectedSupplier
      ? suppliers.find((s) => String(s.id) === String(selectedSupplier))
      : null;

    if (!product) {
      setError("Please select a valid product.");
      return;
    }

    const quantityValue = parseFloat(quantity);
    const priceValue = parseFloat(price);

    if (isNaN(quantityValue) || quantityValue <= 0) {
      setError("Quantity must be a valid number greater than 0.");
      return;
    }
    if (isNaN(priceValue) || priceValue < 0) {
      setError("Price must be a valid non-negative number.");
      return;
    }

    const newPurchase = {
      product_id: product.id,
      product_name: product.name,
      supplier_id: supplier ? supplier.id : null,
      supplier_name: supplier ? supplier.name : null,
      quantity: quantityValue,
      items_per_unit: product.items_per_unit,
      price: priceValue,
      total_cost: priceValue * quantityValue,
      date: new Date().toISOString().split("T")[0],
      purchase_type: activeTab,
    };

    setPurchaseList([...purchaseList, newPurchase]);
    setSelectedProduct(null); // Reset to null after adding
    setSelectedSupplier("");
    setQuantity("");
    setPrice("");
    setError("");
  };

  const handleSavePurchases = async () => {
    if (purchaseList.length === 0) {
      setError("Please add at least one purchase before saving.");
      return;
    }

    const confirmSave = window.confirm("Are you sure you want to save these purchases?");
    if (!confirmSave) {
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    const formattedPurchases = purchaseList.map((p) => ({
      product_id: p.product_id,
      supplier_id: p.supplier_id,
      quantity: p.quantity,
      purchase_date: p.date,
      price: Number(p.price),
      purchase_type: p.purchase_type,
    }));

    console.log("Sending purchases to server:", formattedPurchases);

    try {
      await createPurchase(formattedPurchases);
      setSuccessMessage("Purchases recorded successfully!");
      setPurchaseList([]);
      setSelectedProduct(null);
      setSelectedSupplier("");
      setQuantity("");
      setPrice("");
      await fetchData(); // Refresh data after saving
    } catch (err) {
      setError(err.message || "Failed to save purchases. Please try again.");
      console.error("Save Purchases Error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePurchase = (index) => {
    setPurchaseList(purchaseList.filter((_, i) => i !== index));
  };

  const filteredPurchases = purchaseList.filter(
    (purchase) => purchase.purchase_type === activeTab
  );

  const filteredProducts = products.filter(
    (product) => product.category_name === activeTab
  );

  const productOptions = filteredProducts.map((p) => ({
    value: String(p.id), // Ensure value is a string to match selectedProduct
    label: p.name,
  }));

  console.log("Product Options:", productOptions); // Debug log
  console.log("Selected Product:", selectedProduct); // Debug log

  const totalPurchaseCost = filteredPurchases
    .reduce((total, purchase) => total + Number(purchase.total_cost), 0)
    .toFixed(2);

  return (
    <div className="add-purchases-container">
      <h2>Record Purchases</h2>

      <div className="tabs">
        <button
          className={activeTab === "cigarette" ? "active" : ""}
          onClick={() => setActiveTab("cigarette")}
          aria-label="Switch to cigarette category"
        >
          Cigarette
        </button>
        <button
          className={activeTab === "bread_tomato" ? "active" : ""}
          onClick={() => setActiveTab("bread_tomato")}
          aria-label="Switch to bread/tomato category"
        >
          Bread/Tomato
        </button>
      </div>

      {isLoading ? (
        <div className="loading-message">Loading products and suppliers...</div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <form className="add-purchases-form" onSubmit={handleAddPurchase}>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="supplier-select"
              disabled={isSaving}
              aria-label="Select a supplier"
            >
              <option value="">No Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <Select
              value={
                productOptions.find((option) => String(option.value) === String(selectedProduct)) || null
              } // Strict type matching
              onChange={handleProductChange}
              options={productOptions}
              classNamePrefix="react-select"
              isClearable={true}
              isDisabled={isSaving}
              isLoading={isLoading}
              placeholder="Search or select product..."
              aria-label="Search or select a product"
            />

            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="quantity-input"
              min="0.01"
              step="0.01"
              disabled={isSaving}
              aria-label="Enter quantity"
            />

            <input
              type="number"
              placeholder="Price per Unit"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="price-input"
              min="0"
              step="0.01"
              required
              disabled={isSaving}
              aria-label="Enter price per unit"
            />

            <button
              type="submit"
              className="add-purchase-btn"
              disabled={isSaving}
              aria-label="Add purchase to list"
            >
              Add Purchase
            </button>
          </form>

          <div className="purchases-list">
            <div className="top-bar">
              <h3>{activeTab === "cigarette" ? "Cigarette" : "Bread/Tomato"} Purchases</h3>
              <div className="total-purchase-cost">
                <strong>Total Purchase Cost:</strong> K{totalPurchaseCost}
              </div>
            </div>
            <div className="table-wrapper">
              <table className="purchases-table">
                <thead>
                  <tr>
                    <th scope="col">Supplier</th>
                    <th scope="col">Product</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Price</th>
                    <th scope="col">Total Cost</th>
                    <th scope="col">Date</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.length > 0 ? (
                    filteredPurchases.map((purchase, index) => (
                      <tr key={index}>
                        <td>{purchase.supplier_name || "N/A"}</td>
                        <td>{purchase.product_name}</td>
                        <td>{purchase.quantity}</td>
                        <td>K{Number(purchase.price).toFixed(2)}</td>
                        <td>K{Number(purchase.total_cost).toFixed(2)}</td>
                        <td>{purchase.date}</td>
                        <td>
                          <button
                            className="remove-btn"
                            onClick={() => handleRemovePurchase(index)}
                            disabled={isSaving}
                            aria-label={`Remove purchase for ${purchase.product_name}`}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-purchases-message">
                        No {activeTab === "cigarette" ? "cigarette" : "bread/tomato"} purchases added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="actions">
            <button
              className="save-purchases-btn"
              onClick={handleSavePurchases}
              disabled={isSaving}
              aria-label="Save all purchases"
            >
              {isSaving ? "Saving..." : "Save Purchases"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddPurchase;