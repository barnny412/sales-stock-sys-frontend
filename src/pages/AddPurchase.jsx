import React, { useState, useEffect } from "react";
import { createPurchase } from "../api/purchasesAPI";
import { fetchProducts } from "../api/productsAPI";
import { fetchSuppliers } from "../api/suppliersAPI";
import "../assets/styles/addpurchases.css";

const AddPurchases = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [purchaseList, setPurchaseList] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("cigarette"); // Track active tab

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, suppliersData] = await Promise.all([
          fetchProducts(),
          fetchSuppliers(),
        ]);
        setProducts(productsData);
        setSuppliers(suppliersData);
      } catch (err) {
        setError("Failed to load products or suppliers.");
        console.error(err);
      }
    };

    loadData();
  }, []);

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);

    const product = products.find((p) => String(p.id) === String(productId));
    setPrice(product ? product.cost_price : "");
  };

  const handleAddPurchase = (e) => {
    e.preventDefault();

    const product = products.find((p) => String(p.id) === String(selectedProduct));
    const supplier = suppliers.find((s) => String(s.id) === String(selectedSupplier));

    if (!product || !supplier) return setError("Please select a valid product and supplier.");
    if (!quantity || Number(quantity) <= 0) return setError("Enter a valid quantity.");
    if (!price || Number(price) < 0) return setError("Enter a valid price.");

    const newPurchase = {
      product_id: product.id,
      product_name: product.name,
      supplier_id: supplier.id,
      supplier_name: supplier.name,
      quantity: Number(quantity),
      items_per_unit: product.items_per_unit,
      price: Number(price),
      total_cost: Number(price) * Number(quantity),
      date: new Date().toISOString().split("T")[0], // Format: YYYY-MM-DD
      purchase_type: activeTab, // Set purchase_type based on active tab
    };

    setPurchaseList([...purchaseList, newPurchase]);
    setSelectedProduct("");
    setSelectedSupplier("");
    setQuantity("");
    setPrice("");
    setError("");
  };

  const handleSavePurchases = async () => {
    if (purchaseList.length === 0) return setError("Please add at least one purchase.");

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    const formattedPurchases = purchaseList.map((p) => ({
      product_id: p.product_id,
      supplier_id: p.supplier_id,
      quantity: p.quantity,
      purchase_date: p.date,
      price: p.price,
      purchase_type: p.purchase_type, // Include purchase_type
    }));

    console.log("Sending purchases to server:", formattedPurchases);

    try {
      await createPurchase(formattedPurchases);
      setSuccessMessage("Purchases recorded successfully!");
      setPurchaseList([]);
    } catch (err) {
      setError("Failed to save purchases.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePurchase = (index) => {
    setPurchaseList(purchaseList.filter((_, i) => i !== index));
  };

  // Filter purchases based on the active tab
  const filteredPurchases = purchaseList.filter(
    (purchase) => purchase.purchase_type === activeTab
  );

  return (
    <div className="add-purchases-container">
      <h2>Record Purchases</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "cigarette" ? "active" : ""}
          onClick={() => setActiveTab("cigarette")}
        >
          Cigarette
        </button>
        <button
          className={activeTab === "bread_tomato" ? "active" : ""}
          onClick={() => setActiveTab("bread_tomato")}
        >
          Bread/Tomato
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form className="add-purchases-form" onSubmit={handleAddPurchase}>
        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="supplier-select"
        >
          <option value="">Select Supplier</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedProduct}
          onChange={handleProductChange}
          className="product-select"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="quantity-input"
          min="1"
        />

        <input
          type="number"
          placeholder="Price per Unit"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="price-input"
          min="0"
          step="0.01"
        />

        <button type="submit" className="add-purchase-btn">
          Add Purchase
        </button>
      </form>

      <div className="purchases-list">
        <h3>{activeTab === "cigarette" ? "Cigarette" : "Bread/Tomato"} Purchases</h3>
        <div className="table-wrapper">
          <table className="purchases-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total Cost</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.length > 0 ? (
                filteredPurchases.map((purchase, index) => (
                  <tr key={index}>
                    <td>{purchase.supplier_name}</td>
                    <td>{purchase.product_name}</td>
                    <td>{purchase.quantity}</td>
                    <td>K{purchase.price.toFixed(2)}</td>
                    <td>K{purchase.total_cost.toFixed(2)}</td>
                    <td>{purchase.date}</td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemovePurchase(
                          purchaseList.findIndex((p) => p === purchase)
                        )}
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
        >
          {isSaving ? "Saving..." : "Save Purchases"}
        </button>
      </div>
    </div>
  );
};

export default AddPurchases;