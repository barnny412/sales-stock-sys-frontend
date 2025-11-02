import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Select from 'react-select';
import { fetchProductsWithCategory } from "../api/productsAPI";
import { createSale, fetchLastClosingStock } from "../api/salesAPI";
import ProductGrid from '../components/ProductGrid';
import CartPanel from '../components/CartPanel';
import PosMenu from '../components/PosMenu';
import ChargeModal from '../components/ChargeModal';
import Receipt from '../components/Receipt';
import "../assets/styles/POS.css";

// Custom hook for error handling
const useErrorHandler = () => {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const showError = useCallback((message) => {
    setError(message);
    setTimeout(() => setError(''), 5000);
  }, []);

  const showSuccess = useCallback((message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  }, []);

  const clearError = useCallback(() => setError(''), []);
  const clearSuccess = useCallback(() => setSuccessMessage(''), []);

  return { error, successMessage, showError, showSuccess, clearError, clearSuccess };
};

// Simple Modal Component (kept inline)
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay">
      <div ref={modalRef} className="modal-content">
        <div className="modal-header-container">
          <h2 className="modal-header">{title}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const POS = () => {
  // Main State
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState({});
  const [productStock, setProductStock] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal States
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  
  // Modal-specific states
  const [selectedItem, setSelectedItem] = useState(null);
  const [manualQuantity, setManualQuantity] = useState('');
  const [manualTotalPrice, setManualTotalPrice] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerId, setCustomerId] = useState('1');
  const [isPosMenuOpen, setIsPosMenuOpen] = useState(false);

  const { error, successMessage, showError, showSuccess, clearError, clearSuccess } = useErrorHandler();
  const [userId] = useState('1');

  // Payment options
  const paymentOptions = useMemo(() => [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'mobile', label: 'Mobile Money' },
  ], []);

  // Close all modals function
  const closeAllModals = useCallback(() => {
    setIsChargeModalOpen(false);
    setIsCartModalOpen(false);
    setIsQuantityModalOpen(false);
    setIsPriceModalOpen(false);
    setIsChangeModalOpen(false);
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();
      
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
      const defaultCategory = categories.includes('cigarette') ? 'cigarette' : categories[0] || null;
      setSelectedCategory(defaultCategory);
    } catch (err) {
      showError(err.message || "Failed to load menu items or stock.");
      console.error("Fetch Data Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Stock check
  const checkStockAvailability = useCallback((item, requestedQuantity) => {
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
  }, [cartItems, productStock]);

  // Cart functions
  const handleAddItem = useCallback((item) => {
    const price = Number(item.price) || 0;
    
    if (isNaN(price)) {
      showError(`Invalid price for item ${item.name}.`);
      return;
    }

    if (item.requires_manual_price) {
      setSelectedItem(item);
      setManualTotalPrice('');
      setIsPriceModalOpen(true);
      return;
    }

    const defaultQuantity = 1;
    const stockCheck = checkStockAvailability(item, defaultQuantity);
    
    if (!stockCheck.isAvailable) {
      showError(stockCheck.message);
      return;
    }

    if (item.requires_manual_quantity) {
      setSelectedItem(item);
      setManualQuantity('1');
      setIsQuantityModalOpen(true);
      return;
    }

    const existingItem = cartItems.find((i) => i.id === item.id);
    
    if (existingItem) {
      const updatedCart = cartItems.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { ...item, price, quantity: 1 }]);
    }
  }, [cartItems, checkStockAvailability, showError]);

  const handleRemoveItem = useCallback((index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
  }, [cartItems]);

  const handleQuantityChange = useCallback((index, delta) => {
    const item = cartItems[index];
    const currentQuantity = item.quantity;
    const newQuantity = Math.max(1, currentQuantity + delta);

    const stockCheck = checkStockAvailability(item, newQuantity - currentQuantity);
    
    if (!stockCheck.isAvailable) {
      showError(stockCheck.message);
      return;
    }

    const updatedCart = cartItems
      .map((item, idx) =>
        idx === index ? { ...item, quantity: newQuantity } : item
      )
      .filter(item => item.quantity > 0);
    
    setCartItems(updatedCart);
  }, [cartItems, checkStockAvailability, showError]);

  // Modal handlers
  const handleConfirmPrice = useCallback(() => {
    const parsedTotalPrice = parseFloat(manualTotalPrice);
    
    if (isNaN(parsedTotalPrice) || parsedTotalPrice <= 0) {
      showError("Please enter a valid positive total price.");
      return;
    }

    const unitPrice = selectedItem.price;
    
    if (!unitPrice || unitPrice <= 0) {
      showError("Unit price is not available for this product.");
      return;
    }

    const calculatedQuantity = parsedTotalPrice / unitPrice;
    const roundedQuantity = Math.round(calculatedQuantity * 100) / 100;

    const stockCheck = checkStockAvailability(selectedItem, roundedQuantity);
    
    if (!stockCheck.isAvailable) {
      showError(stockCheck.message);
      return;
    }

    if (selectedItem.requires_manual_quantity) {
      setManualQuantity(roundedQuantity.toFixed(2));
      setIsPriceModalOpen(false);
      setIsQuantityModalOpen(true);
      return;
    }

    const existingItem = cartItems.find((i) => i.id === selectedItem.id);
    const updatedPrice = parsedTotalPrice / roundedQuantity;

    if (existingItem) {
      const newQuantity = existingItem.quantity + roundedQuantity;
      const updatedCart = cartItems.map((i) =>
        i.id === selectedItem.id ? { ...i, quantity: newQuantity, price: updatedPrice } : i
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { ...selectedItem, price: updatedPrice, quantity: roundedQuantity }]);
    }

    setIsPriceModalOpen(false);
    setSelectedItem(null);
    setManualTotalPrice('');
  }, [cartItems, manualTotalPrice, selectedItem, checkStockAvailability, showError]);

  const handleConfirmQuantity = useCallback(() => {
    const parsedQuantity = parseFloat(manualQuantity);
    
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      showError("Please enter a valid positive quantity.");
      return;
    }

    const stockCheck = checkStockAvailability(selectedItem, parsedQuantity);
    
    if (!stockCheck.isAvailable) {
      showError(stockCheck.message);
      return;
    }

    const existingItem = cartItems.find((i) => i.id === selectedItem.id);
    
    if (existingItem) {
      const updatedCart = cartItems.map((i) =>
        i.id === selectedItem.id ? { ...i, quantity: i.quantity + parsedQuantity } : i
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { ...selectedItem, price: selectedItem.price, quantity: parsedQuantity }]);
    }

    setIsQuantityModalOpen(false);
    setSelectedItem(null);
    setManualQuantity('');
  }, [cartItems, manualQuantity, selectedItem, checkStockAvailability, showError]);

  // Totals calculation
  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
    
    const tax = subtotal * 0.0;
    return { subtotal, tax, total: subtotal + tax };
  }, [cartItems]);

  // Categories and filtering
  const categories = useMemo(() => 
    Object.keys(menuItems).map((category) => ({
      value: category,
      label: category,
    })), [menuItems]);

  const selectedCategoryValue = useMemo(() => 
    categories.find((option) => option.value === selectedCategory) || null, 
    [categories, selectedCategory]);

  const handleCategoryChange = useCallback((selectedOption) => {
    setSelectedCategory(selectedOption ? selectedOption.value : null);
  }, []);

  const filteredItems = useMemo(() => 
    selectedCategory && menuItems[selectedCategory]
      ? menuItems[selectedCategory].filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [], 
    [selectedCategory, menuItems, searchQuery]);

  // Charge functionality
  const handleChargeClick = useCallback(() => {
    if (cartItems.length > 0) {
      closeAllModals();
      setTimeout(() => {
        setIsChargeModalOpen(true);
        setAmountPaid('');
        setCustomerId('1');
      }, 10);
    } else {
      showError("Cart is empty. Add items before charging.");
    }
  }, [cartItems, showError, closeAllModals]);

  const validateCustomerId = useCallback((id) => {
    return /^\d+$/.test(id) && parseInt(id) > 0;
  }, []);

  const handleConfirmCharge = useCallback(async () => {
    if (cartItems.length === 0) {
      showError("Cart is empty. Add items before confirming the sale.");
      return;
    }

    if (!validateCustomerId(customerId)) {
      showError("Please enter a valid customer ID");
      return;
    }

    const parsedAmountPaid = parseFloat(amountPaid);
    
    if (isNaN(parsedAmountPaid) || parsedAmountPaid < total) {
      showError(`Please enter an amount greater than or equal to K${total.toFixed(2)}.`);
      return;
    }

    setIsSaving(true);
    clearError();
    clearSuccess();

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

      const response = await createSale(salesData);

      const change = parsedAmountPaid - total;
      setChangeAmount(change);

      setCartItems([]);
      showSuccess(`Sale recorded successfully! Sale ID: ${response.saleId}`);
      setIsChargeModalOpen(false);
      setIsChangeModalOpen(true);

      await fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to save sale. Please try again.";
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [cartItems, amountPaid, total, paymentMethod, customerId, userId, fetchData, showError, showSuccess, clearError, clearSuccess, validateCustomerId]);

  // Receipt handler
  const handlePrintReceipt = useCallback(() => {
    Receipt({ cartItems, subtotal, tax, total, amountPaid, changeAmount })();
  }, [cartItems, subtotal, tax, total, amountPaid, changeAmount]);

  return (
    <div className="pos-container">
      {error && (
        <div className="error-alert">
          <span>{error}</span>
          <button className="error-close-btn" onClick={clearError}>
            X
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="success-alert">
          <span>{successMessage}</span>
          <button className="success-close-btn" onClick={clearSuccess}>
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
                  aria-label="Search items"
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
                                              
              <ProductGrid
                items={filteredItems}
                productStock={productStock}
                onAddItem={handleAddItem}
                isSaving={isSaving}
              />
            </div>

            <CartPanel
              cartItems={cartItems}
              onQuantityChange={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              subtotal={subtotal}
              tax={tax}
              total={total}
              isSaving={isSaving}
            />
          </div>

          <div className="bottom-panel">
            <PosMenu
              isPosMenuOpen={isPosMenuOpen}
              onTogglePosMenu={() => setIsPosMenuOpen(!isPosMenuOpen)}
              isSaving={isSaving}
            />
            <div className="bottom-right">
              <div className="cart-actions">
                <button className="cart-btn" onClick={() => setIsCartModalOpen(true)} disabled={isSaving}>
                  Cart ({cartItems.length})
                </button>
                <button className="charge-btn" onClick={handleChargeClick} disabled={isSaving}>
                  Charge K{total.toFixed(2)}
                </button>
              </div>
            </div>
          </div>

          {/* Quantity Modal */}
          <Modal 
            isOpen={isQuantityModalOpen} 
            onClose={() => {
              setIsQuantityModalOpen(false);
              setSelectedItem(null);
              setManualQuantity('');
            }} 
            title="Enter Quantity"
          >
            <div className="modal-body">
              <p>Enter the quantity for <strong>{selectedItem?.name}</strong>:</p>
              <p>Available Stock: {selectedItem ? productStock[selectedItem.id] || 0 : 0}</p>
              <input
                type="number"
                className="quantity-input"
                value={manualQuantity}
                onChange={(e) => setManualQuantity(e.target.value)}
                min="1"
                step="0.01"
                placeholder="Enter quantity"
                autoFocus
                disabled={isSaving}
              />
            </div>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleConfirmQuantity} disabled={isSaving}>
                Confirm
              </button>
              <button className="close-btn" onClick={() => setIsQuantityModalOpen(false)} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </Modal>

          {/* Price Modal */}
          <Modal 
            isOpen={isPriceModalOpen} 
            onClose={() => {
              setIsPriceModalOpen(false);
              setSelectedItem(null);
              setManualTotalPrice('');
            }} 
            title="Enter Total Price"
          >
            <div className="modal-body">
              <p>Enter the total price for <strong>{selectedItem?.name}</strong>:</p>
              <p>Available Stock: {selectedItem ? productStock[selectedItem.id] || 0 : 0}</p>
              <input
                type="number"
                className="price-input"
                value={manualTotalPrice}
                onChange={(e) => setManualTotalPrice(e.target.value)}
                min="0"
                step="0.01"
                placeholder="Enter total price"
                autoFocus
                disabled={isSaving}
              />
            </div>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handleConfirmPrice} disabled={isSaving}>
                Confirm
              </button>
              <button className="close-btn" onClick={() => setIsPriceModalOpen(false)} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </Modal>

          {/* Cart Modal */}
          <Modal isOpen={isCartModalOpen} onClose={() => setIsCartModalOpen(false)} title="Cart Details">
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
              <button className="close-btn" onClick={() => setIsCartModalOpen(false)} disabled={isSaving}>
                Close
              </button>
            </div>
          </Modal>

          {/* Charge Modal Component */}
          <ChargeModal
            isOpen={isChargeModalOpen}
            onClose={() => setIsChargeModalOpen(false)}
            cartItems={cartItems}
            subtotal={subtotal}
            tax={tax}
            total={total}
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            customerId={customerId}
            onCustomerIdChange={setCustomerId}
            amountPaid={amountPaid}
            onAmountPaidChange={setAmountPaid}
            onConfirmCharge={handleConfirmCharge}
            isSaving={isSaving}
            paymentOptions={paymentOptions}
          />

          {/* Change Modal */}
          <Modal isOpen={isChangeModalOpen} onClose={() => setIsChangeModalOpen(false)} title="Change Due">
            <div className="modal-body">
              <p>Change to return to customer:</p>
              <p className="change-amount">K{changeAmount.toFixed(2)}</p>
            </div>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={handlePrintReceipt}>
                Print Receipt
              </button>
              <button className="close-btn" onClick={() => setIsChangeModalOpen(false)}>
                OK
              </button>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default POS;