import React, { useState, useEffect } from "react";
import { createSale } from "../api/salesAPI";
import { fetchProducts } from "../api/productsAPI";
import { fetchLastClosingStock } from "../api/salesAPI";
import "../assets/styles/addSales.css";

const AddSales = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [closingStock, setClosingStock] = useState("");
  const [price, setPrice] = useState("");
  const [salesList, setSalesList] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openingStock, setOpeningStock] = useState({});
  const [currentTab, setCurrentTab] = useState("cigarette"); // "cigarette" | "bread_tomato"

  useEffect(() => {
    const getProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        setError("Failed to fetch products.");
        console.error("Fetch Products Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, []);

  useEffect(() => {
    // Clear success/error messages after 5 seconds
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);

    const product = products.find((p) => String(p.id) === String(productId));
    setPrice(product ? Number(product.selling_price).toFixed(2) : "");
  };

  const handleAddSale = async () => {
    if (!selectedProduct || !closingStock || !price) {
      setError("Product, Closing Stock, and Price are required.");
      return;
    }

    if (salesList.some((sale) => sale.product_id === parseInt(selectedProduct))) {
      setError("This product is already added.");
      return;
    }

    if (Number(price) < 0) {
      setError("Price cannot be negative.");
      return;
    }

    try {
      const lastClosingStock = await fetchLastClosingStock(selectedProduct);
      console.log("Last Closing Stock: ", lastClosingStock);

      const openingStockValue = lastClosingStock?.lastClosingStock || 0;

      const product = products.find((p) => p.id === parseInt(selectedProduct));
      if (!product) {
        setError("Selected product not found.");
        return;
      }

      if (parseInt(closingStock, 10) > openingStockValue) {
        setError("Closing stock cannot exceed opening stock.");
        return;
      }

      const saleData = {
        product_id: parseInt(selectedProduct),
        opening_stock: openingStockValue,
        closing_stock: parseInt(closingStock, 10),
        price: Number(price),
        sales_date: new Date().toISOString().split("T")[0],
        sale_type: currentTab, // Add sale_type based on active tab
      };

      setSalesList([...salesList, saleData]);
      setOpeningStock({ ...openingStock, [selectedProduct]: openingStockValue });

      setSelectedProduct("");
      setClosingStock("");
      setPrice("");
      setError("");
    } catch (error) {
      setError("Failed to fetch opening stock.");
      console.error("Opening Stock Error:", error);
    }
  };

  const handleSaveSales = async () => {
    if (salesList.length === 0) {
      setError("Please add at least one sale.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSaving(true);

    try {
      await createSale(salesList);
      setSuccessMessage("Sales recorded successfully!");
      setSalesList([]);
      setOpeningStock({});
      setSelectedProduct("");
      setClosingStock("");
      setPrice("");
    } catch (error) {
      setError("Error while saving sales. Please try again.");
      console.error("Save Sales Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const overallTotalSales = salesList
    .reduce((total, sale) => total + (sale.opening_stock - sale.closing_stock) * sale.price, 0)
    .toFixed(2);

  return (
    <div className="add-sales-container">
      <h2>Record Sales</h2>

      {isLoading ? (
        <div className="loading-message">Loading products...</div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          {/* Tabs */}
          <div className="tabs">
            <button
              className={currentTab === "cigarette" ? "active" : ""}
              onClick={() => {
                setCurrentTab("cigarette");
                setSelectedProduct(""); // Reset selected product when tab changes
              }}
            >
              Cigarette
            </button>
            <button
              className={currentTab === "bread_tomato" ? "active" : ""}
              onClick={() => {
                setCurrentTab("bread_tomato");
                setSelectedProduct(""); // Reset selected product when tab changes
              }}
            >
              Bread/Tomato
            </button>
          </div>

          <div className="add-sales-form">
            <select
              value={selectedProduct}
              onChange={handleProductChange}
              className="product-select"
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (Price: ${product.selling_price})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Closing Stock"
              value={closingStock}
              onChange={(e) => setClosingStock(e.target.value)}
              className="closing-stock-input"
              min="0"
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
            />

            <button className="add-sale-btn" onClick={handleAddSale}>
              Add Sale
            </button>
          </div>

          <div className="sales-list">
            <div className="top-bar">
              <h3>Sales List</h3>
              <div className="overall-total-sales">
                <strong>Overall Total Sales:</strong> ${overallTotalSales}
              </div>
            </div>
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Opening Stock</th>
                  <th>Closing Stock</th>
                  <th>Price</th>
                  <th>Total Sales Price</th>
                  <th>Sale Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salesList.length > 0 ? (
                  salesList.map((sale, index) => (
                    <tr key={index}>
                      <td>{products.find((p) => p.id === sale.product_id)?.name}</td>
                      <td>{sale.opening_stock}</td>
                      <td>{sale.closing_stock}</td>
                      <td>{sale.price.toFixed(2)}</td>
                      <td>
                        ${((sale.opening_stock - sale.closing_stock) * sale.price).toFixed(2)}
                      </td>
                      <td>{sale.sale_type}</td>
                      <td>
                        <button
                          className="remove-btn"
                          onClick={() =>
                            setSalesList(salesList.filter((_, i) => i !== index))
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-sales-message">
                      No sales added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="actions">
            <button className="save-sales-btn" onClick={handleSaveSales} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Sales"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddSales;