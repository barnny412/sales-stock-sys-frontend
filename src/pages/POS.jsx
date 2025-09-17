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
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [manualQuantity, setManualQuantity] = useState('');
  const [manualTotalPrice, setManualTotalPrice] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [quantityError, setQuantityError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [productStock, setProductStock] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerId, setCustomerId] = useState('1');
  const [userId] = useState('1');
  const [isPosMenuOpen, setIsPosMenuOpen] = useState(false);

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
          requires_manual_price: product.requires_manual_price || false,
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

    if (item.requires_manual_price) {
      setSelectedItem(item);
      setManualTotalPrice('');
      setPriceError('');
      setIsPriceModalOpen(true);
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

  const handleConfirmPrice = () => {
    const parsedTotalPrice = parseFloat(manualTotalPrice);
    if (isNaN(parsedTotalPrice) || parsedTotalPrice <= 0) {
      setPriceError("Please enter a valid positive total price.");
      return;
    }

    const unitPrice = selectedItem.price;
    if (!unitPrice || unitPrice <= 0) {
      setPriceError("Unit price is not available for this product.");
      return;
    }

    const calculatedQuantity = parsedTotalPrice / unitPrice;
    const roundedQuantity = Math.round(calculatedQuantity * 100) / 100;

    const stockCheck = checkStockAvailability(selectedItem, roundedQuantity);
    if (!stockCheck.isAvailable) {
      setPriceError(stockCheck.message);
      return;
    }

    if (selectedItem.requires_manual_quantity) {
      setManualQuantity(roundedQuantity.toFixed(2));
      setIsPriceModalOpen(false);
      setIsQuantityModalOpen(true);
      setPriceError('');
      return;
    }

    const existingItem = cartItems.find((i) => i.id === selectedItem.id);
    const updatedPrice = parsedTotalPrice / roundedQuantity;

    if (existingItem) {
      const newQuantity = existingItem.quantity + roundedQuantity;
      setCartItems(
        cartItems.map((i) =>
          i.id === selectedItem.id ? { ...i, quantity: newQuantity, price: updatedPrice } : i
        )
      );
    } else {
      setCartItems([...cartItems, { ...selectedItem, price: updatedPrice, quantity: roundedQuantity }]);
    }

    setIsPriceModalOpen(false);
    setSelectedItem(null);
    setManualTotalPrice('');
    setPriceError('');
  };

  const handleClosePriceModal = () => {
    setIsPriceModalOpen(false);
    setSelectedItem(null);
    setManualTotalPrice('');
    setPriceError('');
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
    const item = cartItems[index];
    const currentQuantity = item.quantity;
    const newQuantity = Math.max(1, currentQuantity + delta);

    const stockCheck = checkStockAvailability(item, newQuantity - currentQuantity);
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
      setAmountPaid('');
      setPaymentError('');
      setCustomerId('1');
    } else {
      setError("Cart is empty. Add items before charging.");
    }
  };

  const handleConfirmCharge = async () => {
    if (cartItems.length === 0) {
      setError("Cart is empty. Add items before confirming the sale.");
      return;
    }

    const parsedAmountPaid = parseFloat(amountPaid);
    if (isNaN(parsedAmountPaid) || parsedAmountPaid < total) {
      setPaymentError(`Please enter an amount greater than or equal to K${total.toFixed(2)}.`);
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const salesData = {
        sales_date: new Date().toISOString().split("T")[0],
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        payment_method: paymentMethod,
        customer_id: customerId,
        user_id: userId,
        tax_rate: 0.00,
        discount_rate: 0.00,
      };

      console.log("Saving sales:", JSON.stringify(salesData, null, 2));
      const response = await createSale(salesData);

      const change = parsedAmountPaid - total;
      setChangeAmount(change);

      setCartItems([]);
      setSuccessMessage(`Sale recorded successfully! Sale ID: ${response.saleId}`);
      setIsChargeModalOpen(false);
      setIsChangeModalOpen(true);

      await fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to save sale. Please try again.";
      console.error("Save Sale Error:", err, "Detailed Message:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseChangeModal = () => {
    setIsChangeModalOpen(false);
    setChangeAmount(0);
    setAmountPaid('');
  };

  const handlePrintReceipt = () => {
    const printWindow = window.open('', '_blank');
    const receiptContent = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .receipt { max-width: 300px; margin: auto; }
            .receipt-header { text-align: center; margin-bottom: 20px; }
            .receipt-item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .receipt-totals { margin-top: 10px; border-top: 1px solid #000; padding-top: 10px; }
            .receipt-total { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div className="receipt-header">
              <h2>Receipt</h2>
              <p>Date: ${new Date().toLocaleString()}</p>
            </div>
            <div className="receipt-items">
              ${cartItems.map((item, index) => `
                <div className="receipt-item" key=${index}>
                  <span>${item.name} x ${item.quantity}</span>
                  <span>K${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div className="receipt-totals">
              <div className="receipt-total">
                <span>Subtotal:</span>
                <span>K${subtotal.toFixed(2)}</span>
              </div>
              <div className="receipt-total">
                <span>Tax:</span>
                <span>K${tax.toFixed(2)}</span>
              </div>
              <div className="receipt-total">
                <span>Total:</span>
                <span>K${total.toFixed(2)}</span>
              </div>
              <div className="receipt-total">
                <span>Amount Paid:</span>
                <span>K${parseFloat(amountPaid).toFixed(2)}</span>
              </div>
              <div className="receipt-total">
                <span>Change:</span>
                <span>K${changeAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleCartClick = () => {
    setIsCartModalOpen(true);
  };

  const handleCloseChargeModal = () => {
    setIsChargeModalOpen(false);
    setAmountPaid('');
    setPaymentError('');
    setCustomerId('1');
  };

  const handleCloseCartModal = () => {
    setIsCartModalOpen(false);
  };

  const handleTogglePosMenu = () => {
    setIsPosMenuOpen(!isPosMenuOpen);
  };

  const paymentOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'mobile', label: 'Mobile Money' },
  ];

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
            <div className="bottom-left desktop-only">
              <button className="pos-menu-toggle-btn" onClick={handleTogglePosMenu} disabled={isSaving}>
                {isPosMenuOpen ? 'Close POS Menu' : 'Open POS Menu'}
              </button>
              {isPosMenuOpen && (
                <div className="pos-menu-panel">
                  {/* Add your POS menu items here */}
                  <button className="pos-menu-item" onClick={() => alert('POS Menu Item 1 Clicked')}>Item 1</button>
                  <button className="pos-menu-item" onClick={() => alert('POS Menu Item 2 Clicked')}>Item 2</button>
                  <button className="pos-menu-item" onClick={() => alert('POS Menu Item 3 Clicked')}>Item 3</button>
                </div>
              )}
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

          {isPriceModalOpen && selectedItem && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-header">Enter Total Price</h2>
                <div className="modal-body">
                  <p>Enter the total price for <strong>{selectedItem.name}</strong>:</p>
                  <p>Available Stock: {productStock[selectedItem.id] || 0}</p>
                  <input
                    type="number"
                    className="price-input"
                    value={manualTotalPrice}
                    onChange={(e) => {
                      setManualTotalPrice(e.target.value);
                      setPriceError('');
                    }}
                    min="0"
                    step="0.01"
                    placeholder="Enter total price"
                    autoFocus
                    disabled={isSaving}
                  />
                  {priceError && (
                    <div className="error-message">{priceError}</div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="confirm-btn" onClick={handleConfirmPrice} disabled={isSaving}>
                    Confirm
                  </button>
                  <button className="close-btn" onClick={handleClosePriceModal} disabled={isSaving}>
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
                      <div className="charge-modal-payment-method">
                        <label>Payment Method:</label>
                        <Select
                          value={paymentOptions.find(option => option.value === paymentMethod)}
                          onChange={(option) => setPaymentMethod(option.value)}
                          options={paymentOptions}
                          classNamePrefix="react-select"
                          isClearable={false}
                          placeholder="Select Payment Method..."
                          aria-label="Select payment method"
                          isDisabled={isSaving}
                          styles={{
                            input: (provided) => ({
                              ...provided,
                              color: '#333',
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              color: '#333',
                            }),
                          }}
                        />
                      </div>

                      <div className="charge-modal-customer-id">
                        <label>Customer ID:</label>
                        <input
                          type="number"
                          value={customerId}
                          onChange={(e) => setCustomerId(e.target.value)}
                          placeholder="Enter Customer ID"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="charge-modal-totals">
                        <div className="charge-modal-total charge-modal-total-amount standout-total">
                          <span className="charge-modal-total-label">Total:</span>
                          <h2 className="charge-modal-total-value">K{total.toFixed(2)}</h2>
                        </div>
                        <div className="charge-modal-total charge-modal-amount-paid">
                          <input
                            type="number"
                            className="amount-paid-input"
                            value={amountPaid}
                            onChange={(e) => {
                              setAmountPaid(e.target.value);
                              setPaymentError('');
                            }}
                            min="0"
                            step="0.01"
                            placeholder="Enter amount paid"
                            autoFocus
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      {paymentError && (
                        <div className="error-message">{paymentError}</div>
                      )}
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

          {isChangeModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-header">Change Due</h2>
                <div className="modal-body">
                  <p>Change to return to customer:</p>
                  <p className="change-amount">K{changeAmount.toFixed(2)}</p>
                </div>
                <div className="modal-actions">
                  <button className="confirm-btn" onClick={handlePrintReceipt}>
                    Print Receipt
                  </button>
                  <button className="close-btn" onClick={handleCloseChangeModal}>
                    OK
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