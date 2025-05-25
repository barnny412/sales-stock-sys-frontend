import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { fetchProductsWithCategory } from "../api/productsAPI";
import "../assets/styles/POS.css";

const POS = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false); // New state for quantity modal
  const [selectedItem, setSelectedItem] = useState(null); // Track the item being added
  const [manualQuantity, setManualQuantity] = useState(''); // Track the input quantity
  const [quantityError, setQuantityError] = useState(''); // Error message for quantity input
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        const categories = Object.keys(groupedItems);
        setSelectedCategory(categories.includes('cigarette') ? 'cigarette' : categories[0] || null);
      } catch (err) {
        setError(err.message || "Failed to load menu items.");
        console.error("Fetch Data Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = (item) => {
    const price = Number(item.price) || 0;
    if (isNaN(price)) {
      console.warn(`Invalid price for item ${item.name}: setting price to 0`);
      setError(`Invalid price for item ${item.name}.`);
      return;
    }

    if (item.requires_manual_quantity) {
      // Open the custom modal instead of window.prompt
      setSelectedItem(item);
      setManualQuantity('1'); // Default value for the input
      setQuantityError(''); // Reset any previous error
      setIsQuantityModalOpen(true);
      return;
    }

    // Default behavior for items without requires_manual_quantity
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

    // Add the item to the cart with the entered quantity
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

    // Close the modal and reset states
    setIsQuantityModalOpen(false);
    setSelectedItem(null);
    setManualQuantity('');
    setQuantityError('');
  };

  const handleCloseQuantityModal = () => {
    // Close the modal without adding the item
    setIsQuantityModalOpen(false);
    setSelectedItem(null);
    setManualQuantity('');
    setQuantityError('');
  };

  const handleRemoveItem = (index) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, delta) => {
    setCartItems(
      cartItems
        .map((item, idx) =>
          idx === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
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
      if (window.confirm(`Confirm charge of K${total.toFixed(2)}?`)) {
        setIsChargeModalOpen(true);
      }
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
      {isLoading && (
        <div className="loading-container">
          <div className="spinner" />
          Loading...
        </div>
      )}
      {!isLoading && (
        <>
          <div className="pos-grid">
            {/* Left Panel: Item Selection */}
            <div className="item-selection">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                      onClick={() => handleAddItem(item)}
                      title="Click to add to cart"
                    >
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">K{item.price.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'white', textAlign: 'center' }}>
                    No items found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Cart (Visible only on Desktop) */}
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
                      >
                        −
                      </button>
                      <span className="cart-item-quantity">{item.quantity}</span>
                      <button
                        className="cart-item-increase-btn"
                        onClick={() => handleQuantityChange(index, 1)}
                        title="Increase quantity"
                      >
                        +
                      </button>
                      <div className="cart-item-actions">
                        <span className="cart-item-price">K{(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          className="cart-item-remove-btn"
                          onClick={() => handleRemoveItem(index)}
                          title="Remove item from cart"
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

          {/* Bottom Panel */}
          <div className="bottom-panel">
            <div className="bottom-left">
              {/* Placeholder for future buttons if needed */}
            </div>
            <div className="bottom-right">
              <div className="cart-actions">
                <button className="cart-btn" onClick={handleCartClick}>
                  Cart ({cartItems.length})
                </button>
                <button className="charge-btn" onClick={handleChargeClick}>
                  Charge K{total.toFixed(2)}
                </button>
              </div>
            </div>
          </div>

          {/* Modal for Quantity Entry */}
          {isQuantityModalOpen && selectedItem && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-header">Enter Quantity</h2>
                <div className="modal-body">
                  <p>Enter the quantity for <strong>{selectedItem.name}</strong>:</p>
                  <input
                    type="number"
                    className="quantity-input"
                    value={manualQuantity}
                    onChange={(e) => {
                      setManualQuantity(e.target.value);
                      setQuantityError(''); // Clear error on input change
                    }}
                    min="1"
                    step="0.01"
                    placeholder="Enter quantity"
                    autoFocus
                  />
                  {quantityError && (
                    <div className="error-message">{quantityError}</div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="confirm-btn" onClick={handleConfirmQuantity}>
                    Confirm
                  </button>
                  <button className="close-btn" onClick={handleCloseQuantityModal}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal for Cart Confirmation */}
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
                            >
                              −
                            </button>
                            <span className="cart-item-quantity">{item.quantity}</span>
                            <button
                              className="cart-item-increase-btn"
                              onClick={() => handleQuantityChange(index, 1)}
                              title="Increase quantity"
                            >
                              +
                            </button>
                            <div className="cart-item-actions">
                              <span className="cart-item-price">K{(item.price * item.quantity).toFixed(2)}</span>
                              <button
                                className="cart-item-remove-btn"
                                onClick={() => handleRemoveItem(index)}
                                title="Remove item from cart"
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
                          <span class="cart-total-value">K{tax.toFixed(2)}</span>
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
                  <button className="close-btn" onClick={handleCloseCartModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal for Charge Confirmation */}
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
                  <button className="close-btn" onClick={handleCloseChargeModal}>
                    Close
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