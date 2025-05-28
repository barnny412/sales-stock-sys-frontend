import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { fetchProductsWithCategory } from "../api/productsAPI";
import { createSale, fetchLastClosingStock } from "../api/salesAPI";
import "../assets/styles/POS.css";

const POS = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [manualQuantity, setManualQuantity] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [productStock, setProductStock] = useState({});

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const products = await fetchProductsWithCategory();
      const groupedItems = products.reduce((acc, product) => {
        const category = product.category_name || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        const price = Number(product.selling_price) || Number(product.cost_price) || 0;
        if (isNaN(price)) {
          console.warn(`Invalid price for product ${product.name}: setting price to 0`);
          return acc;
        }
        acc[category].push({
          id: product.id,
          name: product.name,
          price: price,
          requires_manual_quantity: product.requires_manual_quantity || false,
        });
        return acc;
      }, {});
      setMenuItems(groupedItems);

      const stockPromises = products.map(async (product) => {
        const stockData = await fetchLastClosingStock(product.id);
        return { id: product.id, stock: Number(stockData?.lastClosingStock) || 0 };
      });
      const stockResults = await Promise.all(stockPromises);
      const stockMap = stockResults.reduce((acc, { id, stock }) => {
        acc[id] = stock;
        return acc;
      }, {});
      setProductStock(stockMap);

      const categories = Object.keys(groupedItems);
      setSelectedCategory(categories.includes('cigarette') ? 'cigarette' : categories[0] || null);
    } catch (err) {
      setError(err.message || "Failed to load menu items or stock.");
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
        setError('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const checkStockAvailability = (item, requestedQuantity) => {
    const availableStock = productStock[item.id] || 0;
    const cartQuantity = cartItems.find((i) => i.id === item.id)?.quantity || 0;
    const totalRequested = cartQuantity + requestedQuantity;
    if (totalRequested > availableStock) {
      return {
        isAvailable: false,
        message: `Insufficient stock for ${item.name}. Available: ${availableStock}, Requested: ${totalRequested}.`,
      };
    }
    return { isAvailable: true };
  };

  const handleAddItem = async (item) => {
    const price = Number(item.price) || 0;
    if (isNaN(price)) {
      console.warn(`Invalid price for item ${item.name}: setting price to 0`);
      setError(`Invalid price for item ${item.name}.`);
      return;
    }

    const defaultQuantity = 1;
    const stockCheck = checkStockAvailability(item, defaultQuantity);
    if (!stockCheck.isAvailable) {
      setError(stockCheck.message);
      return;
    }

    if (item.requires_manual_quantity) {
      setSelectedItem(item);
      setManualQuantity('1');
      setQuantityError('');
      setIsQuantityModalOpen(true);
      return;
    }

    const existingItem = cartItems.find((i) => i.id === item.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCartItems([...cartItems, { ...item, price, quantity: 1 }]);
    }
  };

  const handleConfirmQuantity = () => {
    const parsedQuantity = parseFloat(manualQuantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setQuantityError("Please enter a valid positive quantity.");
      return;
    }

    const stockCheck = checkStockAvailability(selectedItem, parsedQuantity);
    if (!stockCheck.isAvailable) {
      setQuantityError(stockCheck.message);
      return;
    }

    const existingItem = cartItems.find((i) => i.id === selectedItem.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((i) =>
          i.id === selectedItem.id ? { ...i, quantity: i.quantity + parsedQuantity } : i
        )
      );
    } else {
      setCartItems([...cartItems, { ...selectedItem, price: selectedItem.price, quantity: parsedQuantity }]);
    }

    setIsQuantityModalOpen(false);
    setSelectedItem(null);
    setManualQuantity('');
    setQuantityError('');
  };

  const handleCloseQuantityModal = () => {
    setIsQuantityModalOpen(false);
    setSelectedItem(null);
    setManualQuantity('');
    setQuantityError('');
  };

  const handleRemoveItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, delta) => {
    const newQuantity = Math.max(1, cartItems[index].quantity + delta);
    const item = cartItems[index];

    const stockCheck = checkStockAvailability(item, newQuantity - item.quantity);
    if (!stockCheck.isAvailable) {
      setError(stockCheck.message);
      return;
    }

    setCartItems(
      cartItems
        .map((item, idx) =>
          idx === index ? { ...item, quantity: newQuantity } : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
    const tax = subtotal * 0.0;
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateTotal();

  const categories = Object.keys(menuItems).map((category) => ({
    value: category,
    label: category,
  }));

  const selectedCategoryValue = categories.find((option) => option.value === selectedCategory) || null;

  const handleCategoryChange = (selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
  };

  const filteredItems = selectedCategory && menuItems[selectedCategory]
    ? menuItems[selectedCategory].filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleChargeClick = () => {
    if (cartItems.length > 0) {
      setIsChargeModalOpen(true);
    } else {
      setError("Cart is empty. Add items before charging.");
    }
  };

const handleConfirmCharge = async () => {
  if (cartItems.length === 0) {
    setError("Cart is empty. Add items before confirming the sale.");
    return;
  }

  setIsSaving(true);
  setError('');
  setSuccessMessage('');

  try {
    const salesData = {
      sales_date: new Date().toISOString().split("T")[0],
      sale_type: (selectedCategory || 'Uncategorized').toLowerCase().includes("cigarette") ? "cigarette" : "bread_tomato",
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      })),
    };

    console.log("Saving sales:", JSON.stringify(salesData, null, 2));
    await createSale(salesData);

    setCartItems([]);
    setSuccessMessage("Sale recorded successfully!");
    setIsChargeModalOpen(false);

    await fetchData();
  } catch (err) {
    const errorMessage = err.response?.data?.message || err.message || "Failed to save sale. Please try again.";
    console.error("Save Sale Error:", err, "Detailed Message:", errorMessage);
    setError(errorMessage);
  } finally {
    setIsSaving(false);
  }
};

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handleCloseChargeModal = () => {
    setIsChargeModalOpen(false);
  };

  const handleCloseCartModal = () => {
    setIsCartModalOpen(false);
  };

  return (
    <div className="pos-container">
      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button className="error-close-btn" onClick={() => setError('')}>
            X
          </button>
        </div>
      )}
      {successMessage && (
        <div className="success-alert">
          <span>{successMessage}</span>
          <button className="success-close-btn" onClick={() => setSuccessMessage('')}>
            X
          </button>
        </div>
      )}
      {isLoading && (
        <div className="loading-container">
          <div className="spinner" />
          Loading...
        </div>
      )}
      {!isLoading && (
        <>
          <div className="pos-grid">
            <div className="item-selection">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSaving}
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                    X
                  </button>
                )}
              </div>

              <div className="category-select2">
                <Select
                  value={selectedCategoryValue}
                  onChange={handleCategoryChange}
                  options={categories}
                  classNamePrefix="react-select"
                  isClearable={false}
                  placeholder="Select category..."
                  aria-label="Select a category"
                  isDisabled={isSaving}
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
              </div>
                                              
              <div className="item-grid">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="item-card"
                      onClick={() => !isSaving && handleAddItem(item)}
                      title="Click to add to cart"
                    >
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">K{item.price.toFixed(2)}</span>
                      <span className="item-stock">Stock: {productStock[item.id] || 0}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'white', textAlign: 'center' }}>
                    No items found.
                  </div>
                )}
              </div>
            </div>

            <div className="cart-panel desktop-only">
              <div className="cart-items-scroll">
                {cartItems.length > 0 ? (
                  cartItems.map((item, index) => (
                    <div key={index} className="cart-item">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-quantity-label"></span>
                      <button
                        className="cart-item-decrease-btn"
                        onClick={() => handleQuantityChange(index, -1)}
                        title="Decrease quantity"
                        disabled={isSaving}
                      >
                        −
                      </button>
                      <span className="cart-item-quantity">{item.quantity}</span>
                      <button
                        className="cart-item-increase-btn"
                        onClick={() => handleQuantityChange(index, 1)}
                        title="Increase quantity"
                        disabled={isSaving}
                      >
                        +
                      </button>
                      <div className="cart-item-actions">
                        <span className="cart-item-price">K{(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          className="cart-item-remove-btn"
                          onClick={() => handleRemoveItem(index)}
                          title="Remove item from cart"
                          disabled={isSaving}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="cart-empty-message" style={{ color: 'white', textAlign: 'center' }}>
                    No items in cart.
                  </div>
                )}
              </div>
              <div className="cart-totals">
                <div className="cart-total cart-subtotal">
                  <span className="cart-total-label">Subtotal:</span>
                  <span className="cart-total-value">K{subtotal.toFixed(2)}</span>
                </div>
                <div className="cart-total cart-tax">
                  <span className="cart-total-label">Tax:</span>
                  <span className="cart-total-value">K{tax.toFixed(2)}</span>
                </div>
                <div className="cart-total cart-total-amount">
                  <span className="cart-total-label">Total:</span>
                  <span className="cart-total-value">K{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bottom-panel">
            <div className="bottom-left">
            </div>
            <div className="bottom-right">
              <div className="cart-actions">
                <button className="cart-btn" onClick={handleCartClick} disabled={isSaving}>
                  Cart ({cartItems.length})
                </button>
                <button className="charge-btn" onClick={handleChargeClick} disabled={isSaving}>
                  Charge K{total.toFixed(2)}
                </button>
              </div>
            </div>
          </div>

          {isQuantityModalOpen && selectedItem && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-header">Enter Quantity</h2>
                <div className="modal-body">
                  <p>Enter the quantity for <strong>{selectedItem.name}</strong>:</p>
                  <p>Available Stock: {productStock[selectedItem.id] || 0}</p>
                  <input
                    type="number"
                    className="quantity-input"
                    value={manualQuantity}
                    onChange={(e) => {
                      setManualQuantity(e.target.value);
                      setQuantityError('');
                    }}
                    min="1"
                    step="0.01"
                    placeholder="Enter quantity"
                    autoFocus
                    disabled={isSaving}
                  />
                  {quantityError && (
                    <div className="error-message">{quantityError}</div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="confirm-btn" onClick={handleConfirmQuantity} disabled={isSaving}>
                    Confirm
                  </button>
                  <button className="close-btn" onClick={handleCloseQuantityModal} disabled={isSaving}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {isCartModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-header">Cart Details</h2>
                <div className="modal-body">
                  {cartItems.length > 0 ? (
                    <>
                      <div className="cart-items-scroll">
                        {cartItems.map((item, index) => (
                          <div key={index} className="cart-item">
                            <span className="cart-item-name">{item.name}</span>
                            <span className="cart-item-quantity-label">x</span>
                            <button
                              className="cart-item-decrease-btn"
                              onClick={() => handleQuantityChange(index, -1)}
                              title="Decrease quantity"
                              disabled={isSaving}
                            >
                              −
                            </button>
                            <span className="cart-item-quantity">{item.quantity}</span>
                            <button
                              className="cart-item-increase-btn"
                              onClick={() => handleQuantityChange(index, 1)}
                              title="Increase quantity"
                              disabled={isSaving}
                            >
                              +
                            </button>
                            <div className="cart-item-actions">
                              <span className="cart-item-price">K{(item.price * item.quantity).toFixed(2)}</span>
                              <button
                                className="cart-item-remove-btn"
                                onClick={() => handleRemoveItem(index)}
                                title="Remove item from cart"
                                disabled={isSaving}
                              >
                                X
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="cart-totals">
                        <div className="cart-total cart-subtotal">
                          <span className="cart-total-label">Subtotal:</span>
                          <span className="cart-total-value">K{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="cart-total cart-tax">
                          <span className="cart-total-label">Tax:</span>
                          <span className="cart-total-value">K{tax.toFixed(2)}</span>
                        </div>
                        <div className="cart-total cart-total-amount">
                          <span className="cart-total-label">Total:</span>
                          <span className="cart-total-value">K{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-items-message">No items in cart.</div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="close-btn" onClick={handleCloseCartModal} disabled={isSaving}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {isChargeModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-header">Confirm Charge</h2>
                <div className="modal-body">
                  {cartItems.length > 0 ? (
                    <>
                      {cartItems.map((item, index) => (
                        <div key={index} className="charge-modal-item">
                          <span className="charge-modal-item-name">{item.name}</span>
                          <span className="charge-modal-item-quantity">x {item.quantity}</span>
                          <span className="charge-modal-item-price">K{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="charge-modal-totals">
                        <div className="charge-modal-total charge-modal-subtotal">
                          <span className="charge-modal-total-label">Subtotal:</span>
                          <span className="charge-modal-total-value">K{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="charge-modal-total charge-modal-tax">
                          <span className="charge-modal-total-label">Tax:</span>
                          <span className="charge-modal-total-value">K{tax.toFixed(2)}</span>
                        </div>
                        <div className="charge-modal-total charge-modal-total-amount">
                          <span className="charge-modal-total-label">Total:</span>
                          <span className="charge-modal-total-value">K{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-items-message">No items to charge.</div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="confirm-btn" onClick={handleConfirmCharge} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Confirm Sale"}
                  </button>
                  <button className="close-btn" onClick={handleCloseChargeModal} disabled={isSaving}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default POS;