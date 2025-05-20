import React, { useState, useEffect } from "react";
import Select from "react-select";
import { createSale, fetchLastClosingStock } from "../api/salesAPI";
import { fetchProductsWithCategory } from "../api/productsAPI";
import { fetchCategories } from "../api/categoriesAPI";
import "../assets/styles/addSales.css";

const AddSales = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null); // Changed to null for react-select
  const [closingStock, setClosingStock] = useState("");
  const [price, setPrice] = useState("");
  const [salesList, setSalesList] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openingStock, setOpeningStock] = useState({});
  const [currentTab, setCurrentTab] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [productsData, categoriesData] = await Promise.all([
        fetchProductsWithCategory(),
        fetchCategories(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      if (categoriesData.length > 0) {
        setCurrentTab(categoriesData[0].name);
      }
    } catch (error) {
      setError(error.message || "Failed to fetch products or categories.");
      console.error("Fetch Data Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  // Reset form fields when the current tab changes
  useEffect(() => {
    setSelectedProduct(null); // Changed to null for react-select
    setClosingStock("");
    setPrice("");
    setError("");
  }, [currentTab]);

  const handleProductChange = (selectedOption) => {
    const productId = selectedOption ? selectedOption.value : null;
    setSelectedProduct(productId);

    const product = products.find((p) => String(p.id) === String(productId));
    setPrice(product ? parseFloat(product.selling_price).toFixed(2) : ""); // Format for display
  };

  const handleAddSale = async () => {
    if (!selectedProduct) {
      setError("Please select a product.");
      return;
    }
    if (!closingStock) {
      setError("Please enter the closing stock.");
      return;
    }
    if (!price) {
      setError("Please enter the price.");
      return;
    }

    if (salesList.some((sale) => sale.product_id === parseInt(selectedProduct))) {
      setError("This product is already added to the sales list.");
      return;
    }

    const priceValue = parseFloat(price);
    const closingStockValue = parseFloat(closingStock);

    if (isNaN(priceValue) || priceValue < 0) {
      setError("Price must be a valid non-negative number.");
      return;
    }
    if (isNaN(closingStockValue) || closingStockValue < 0) {
      setError("Closing stock must be a valid non-negative number.");
      return;
    }

    try {
      const lastClosingStock = await fetchLastClosingStock(selectedProduct);
      console.log("Last Closing Stock: ", lastClosingStock);

      const openingStockValue = parseFloat(lastClosingStock?.lastClosingStock) || 0.0;

      if (closingStockValue > openingStockValue) {
        setError(`Closing stock (${closingStockValue}) cannot exceed opening stock (${openingStockValue}).`);
        return;
      }

      const product = products.find((p) => p.id === parseInt(selectedProduct));
      if (!product) {
        setError("Selected product not found.");
        return;
      }

      const saleData = {
        product_id: parseInt(selectedProduct),
        opening_stock: openingStockValue,
        closing_stock: closingStockValue,
        price: priceValue,
        sales_date: new Date().toISOString().split("T")[0],
        sale_type: currentTab,
      };

      setSalesList([...salesList, saleData]);
      setOpeningStock({ ...openingStock, [selectedProduct]: openingStockValue });

      setSelectedProduct(null); // Reset to null for react-select
      setClosingStock("");
      setPrice("");
      setError("");
    } catch (error) {
      setError(error.message || "Failed to fetch opening stock.");
      console.error("Opening Stock Error:", error);
    }
  };

  const handleSaveSales = async () => {
    if (salesList.length === 0) {
      setError("Please add at least one sale before saving.");
      return;
    }

    const confirmSave = window.confirm("Are you sure you want to save these sales?");
    if (!confirmSave) {
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
      setSelectedProduct(null); // Reset to null for react-select
      setClosingStock("");
      setPrice("");
      await fetchData();
    } catch (error) {
      setError(error.message || "Error while saving sales. Please try again.");
      console.error("Save Sales Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter products based on the active tab (category)
  const filteredProducts = products.filter(
    (product) => product.category_name === currentTab
  );

  // Filter sales based on the active tab
  const filteredSales = salesList.filter(
    (sale) => sale.sale_type === currentTab
  );

  const productOptions = filteredProducts.map((product) => ({
    value: String(product.id),
    label: product.name,
  }));

  const selectedProductValue = productOptions.find((option) => String(option.value) === String(selectedProduct)) || null;

  const overallTotalSales = filteredSales.reduce(
    (total, sale) => total + (sale.opening_stock - sale.closing_stock) * sale.price,
    0
  );

  return (
    <div className="add-sales-container">
      <h2>Record Sales</h2>

      {/* Dynamic Tabs */}
      {categories.length > 0 ? (
        <div className="tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={currentTab === category.name ? "active" : ""}
              onClick={() => setCurrentTab(category.name)}
              aria-label={`Switch to ${category.name.replace("_", "/")} category`}
            >
              {category.name.replace("_", "/").replace(/\b\w/g, (char) => char.toUpperCase())}
            </button>
          ))}
        </div>
      ) : (
        <div className="error-message">No categories available.</div>
      )}

      {isLoading ? (
        <div className="loading-message">Loading data...</div>
      ) : (
        <>
          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="add-sales-form">
            <Select
              value={selectedProductValue}
              onChange={handleProductChange}
              options={productOptions}
              classNamePrefix="react-select"
              isClearable={true}
              isDisabled={isSaving}
              isLoading={isLoading}
              placeholder="Search or select product..."
              aria-label="Search or select a product"
              styles={{
                input: (provided) => ({
                  ...provided,
                  color: '#fff',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: '#fff',
                }),
              }}
            />

            <input
              type="number"
              placeholder="Closing Stock"
              value={closingStock}
              onChange={(e) => setClosingStock(e.target.value)}
              className="closing-stock-input"
              min="0"
              step="0.01"
              disabled={isSaving}
              aria-label="Enter closing stock"
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
              className="add-sale-btn"
              onClick={handleAddSale}
              disabled={isSaving}
              aria-label="Add sale to list"
            >
              Add Sale
            </button>
          </div>

          <div className="sales-list">
            <div className="top-bar">
              <h3>{currentTab.replace("_", "/").replace(/\b\w/g, (char) => char.toUpperCase())} Sales</h3>
              <div className="overall-total-sales">
                <strong>Overall Total Sales:</strong> K{overallTotalSales.toFixed(2)}
              </div>
            </div>
            <table className="sales-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Opening Stock</th>
                  <th scope="col">Closing Stock</th>
                  <th scope="col">Price</th>
                  <th scope="col">Total Sales Price</th>
                  <th scope="col">Sale Type</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale, index) => (
                    <tr key={index}>
                      <td>{products.find((p) => p.id === sale.product_id)?.name || "Unknown"}</td>
                      <td>{sale.opening_stock.toFixed(2)}</td>
                      <td>{sale.closing_stock.toFixed(2)}</td>
                      <td>{sale.price.toFixed(2)}</td>
                      <td>
                        {((sale.opening_stock - sale.closing_stock) * sale.price).toFixed(2)}
                      </td>
                      <td>{sale.sale_type.replace("_", "/").replace(/\b\w/g, (char) => char.toUpperCase())}</td>
                      <td>
                        <button
                          className="remove-btn"
                          onClick={() =>
                            setSalesList(salesList.filter((_, i) => i !== index))
                          }
                          disabled={isSaving}
                          aria-label={`Remove sale for ${products.find((p) => p.id === sale.product_id)?.name || "unknown product"}`}
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-sales-message">
                      No {currentTab.replace("_", "/").toLowerCase()} sales added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="actions">
            <button
              className="save-sales-btn"
              onClick={handleSaveSales}
              disabled={isSaving}
              aria-label="Save all sales"
            >
              {isSaving ? "Saving..." : "Save Sales"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AddSales;