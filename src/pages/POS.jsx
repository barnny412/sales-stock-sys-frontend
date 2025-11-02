import React, { useState, useEffect, useMemo, useReducer, useCallback, useRef } from 'react';
import Select from 'react-select';
import { fetchProductsWithCategory } from "../api/productsAPI";
import { createSale, fetchLastClosingStock } from "../api/salesAPI";
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

// Modal Component with enhanced debugging
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  
  useEffect(() => {
    console.log('Modal useEffect - isOpen:', isOpen);
    
    const handleEscape = (event) => {
      if (event.keyCode === 27) {
        console.log('Escape pressed, closing modal');
        onClose();
      }
    };
    
    const handleClickOutside = (event) => {
      console.log('Click outside detected');
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        console.log('Clicked outside modal, closing');
        onClose();
      }
    };

    if (isOpen) {
      console.log('Adding event listeners for modal');
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      console.log('Cleaning up modal event listeners');
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  console.log('Modal render - isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('Modal not rendering because isOpen is false');
    return null;
  }
  
  console.log('Modal rendering content');
  return (
    <div className="modal-overlay" onClick={(e) => {
      console.log('Modal overlay clicked');
      e.stopPropagation();
    }}>
      <div ref={modalRef} className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-container">
          <h2 className="modal-header">{title}</h2>
          <button className="modal-close-btn" onClick={(e) => {
            console.log('Close button clicked');
            e.stopPropagation();
            onClose();
          }} aria-label="Close modal">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Reducer for state management
const initialState = {
  cartItems: [],
  selectedCategory: null,
  isChargeModalOpen: false,
  isCartModalOpen: false,
  isQuantityModalOpen: false,
  isPriceModalOpen: false,
  isChangeModalOpen: false,
  selectedItem: null,
  manualQuantity: '',
  manualTotalPrice: '',
  amountPaid: '',
  changeAmount: 0,
  searchQuery: '',
  menuItems: {},
  productStock: {},
  paymentMethod: 'cash',
  customerId: '1',
  isPosMenuOpen: false,
};

function posReducer(state, action) {
  console.log('Reducer action:', action.type, 'payload:', action.payload);
  
  switch (action.type) {
    case 'SET_CART_ITEMS':
      return { ...state, cartItems: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'OPEN_CHARGE_MODAL':
      console.log('Setting isChargeModalOpen to true');
      return { ...state, isChargeModalOpen: true };
    case 'CLOSE_CHARGE_MODAL':
      console.log('Setting isChargeModalOpen to false');
      return { ...state, isChargeModalOpen: false };
    case 'OPEN_CART_MODAL':
      return { ...state, isCartModalOpen: true };
    case 'CLOSE_CART_MODAL':
      return { ...state, isCartModalOpen: false };
    case 'OPEN_QUANTITY_MODAL':
      return { ...state, isQuantityModalOpen: true };
    case 'CLOSE_QUANTITY_MODAL':
      return { ...state, isQuantityModalOpen: false };
    case 'OPEN_PRICE_MODAL':
      return { ...state, isPriceModalOpen: true };
    case 'CLOSE_PRICE_MODAL':
      return { ...state, isPriceModalOpen: false };
    case 'OPEN_CHANGE_MODAL':
      return { ...state, isChangeModalOpen: true };
    case 'CLOSE_CHANGE_MODAL':
      return { ...state, isChangeModalOpen: false };
    case 'SET_SELECTED_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'SET_MANUAL_QUANTITY':
      return { ...state, manualQuantity: action.payload };
    case 'SET_MANUAL_TOTAL_PRICE':
      return { ...state, manualTotalPrice: action.payload };
    case 'SET_AMOUNT_PAID':
      return { ...state, amountPaid: action.payload };
    case 'SET_CHANGE_AMOUNT':
      return { ...state, changeAmount: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_MENU_ITEMS':
      return { ...state, menuItems: action.payload };
    case 'SET_PRODUCT_STOCK':
      return { ...state, productStock: action.payload };
    case 'SET_PAYMENT_METHOD':
      return { ...state, paymentMethod: action.payload };
    case 'SET_CUSTOMER_ID':
      return { ...state, customerId: action.payload };
    case 'TOGGLE_POS_MENU':
      return { ...state, isPosMenuOpen: !state.isPosMenuOpen };
    case 'RESET_MODALS':
      return {
        ...state,
        isChargeModalOpen: false,
        isCartModalOpen: false,
        isQuantityModalOpen: false,
        isPriceModalOpen: false,
        isChangeModalOpen: false,
        selectedItem: null,
        manualQuantity: '',
        manualTotalPrice: '',
        amountPaid: '',
        changeAmount: 0,
      };
    default:
      return state;
  }
}

const POS = () => {
  const [state, dispatch] = useReducer(posReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { error, successMessage, showError, showSuccess, clearError, clearSuccess } = useErrorHandler();
  
  // Destructure state for easier access
  const {
    cartItems,
    selectedCategory,
    isChargeModalOpen,
    isCartModalOpen,
    isQuantityModalOpen,
    isPriceModalOpen,
    isChangeModalOpen,
    selectedItem,
    manualQuantity,
    manualTotalPrice,
    amountPaid,
    changeAmount,
    searchQuery,
    menuItems,
    productStock,
    paymentMethod,
    customerId,
    isPosMenuOpen
  } = state;

  const [userId] = useState('1');

  // Debug modal states
  useEffect(() => {
    console.log('=== MODAL STATES UPDATED ===', {
      isChargeModalOpen,
      isCartModalOpen,
      isQuantityModalOpen,
      isPriceModalOpen,
      isChangeModalOpen
    });
  }, [isChargeModalOpen, isCartModalOpen, isQuantityModalOpen, isPriceModalOpen, isChangeModalOpen]);

  // Debug charge modal specifically
  useEffect(() => {
    console.log('>>> CHARGE MODAL STATE:', isChargeModalOpen);
  }, [isChargeModalOpen]);

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
      
      dispatch({ type: 'SET_MENU_ITEMS', payload: groupedItems });

      const stockPromises = products.map(async (product) => {
        const stockData = await fetchLastClosingStock(product.id);
        return { id: product.id, stock: Number(stockData?.lastClosingStock) || 0 };
      });
      
      const stockResults = await Promise.all(stockPromises);
      const stockMap = stockResults.reduce((acc, { id, stock }) => {
        acc[id] = stock;
        return acc;
      }, {});
      
      dispatch({ type: 'SET_PRODUCT_STOCK', payload: stockMap });

      const categories = Object.keys(groupedItems);
      const defaultCategory = categories.includes('cigarette') ? 'cigarette' : categories[0] || null;
      dispatch({ type: 'SET_SELECTED_CATEGORY', payload: defaultCategory });
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

  const handleAddItem = useCallback((item) => {
    const price = Number(item.price) || 0;
    
    if (isNaN(price)) {
      console.warn(`Invalid price for item ${item.name}: setting price to 0`);
      showError(`Invalid price for item ${item.name}.`);
      return;
    }

    if (item.requires_manual_price) {
      dispatch({ type: 'SET_SELECTED_ITEM', payload: item });
      dispatch({ type: 'SET_MANUAL_TOTAL_PRICE', payload: '' });
      dispatch({ type: 'OPEN_PRICE_MODAL' });
      return;
    }

    const defaultQuantity = 1;
    const stockCheck = checkStockAvailability(item, defaultQuantity);
    
    if (!stockCheck.isAvailable) {
      showError(stockCheck.message);
      return;
    }

    if (item.requires_manual_quantity) {
      dispatch({ type: 'SET_SELECTED_ITEM', payload: item });
      dispatch({ type: 'SET_MANUAL_QUANTITY', payload: '1' });
      dispatch({ type: 'OPEN_QUANTITY_MODAL' });
      return;
    }

    const existingItem = cartItems.find((i) => i.id === item.id);
    
    if (existingItem) {
      const updatedCart = cartItems.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      dispatch({ type: 'SET_CART_ITEMS', payload: updatedCart });
    } else {
      dispatch({ type: 'SET_CART_ITEMS', payload: [...cartItems, { ...item, price, quantity: 1 }] });
    }
  }, [cartItems, checkStockAvailability, showError]);

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
      dispatch({ type: 'SET_MANUAL_QUANTITY', payload: roundedQuantity.toFixed(2) });
      dispatch({ type: 'CLOSE_PRICE_MODAL' });
      dispatch({ type: 'OPEN_QUANTITY_MODAL' });
      return;
    }

    const existingItem = cartItems.find((i) => i.id === selectedItem.id);
    const updatedPrice = parsedTotalPrice / roundedQuantity;

    if (existingItem) {
      const newQuantity = existingItem.quantity + roundedQuantity;
      const updatedCart = cartItems.map((i) =>
        i.id === selectedItem.id ? { ...i, quantity: newQuantity, price: updatedPrice } : i
      );
      dispatch({ type: 'SET_CART_ITEMS', payload: updatedCart });
    } else {
      dispatch({ type: 'SET_CART_ITEMS', payload: [...cartItems, { ...selectedItem, price: updatedPrice, quantity: roundedQuantity }] });
    }

    dispatch({ type: 'CLOSE_PRICE_MODAL' });
    dispatch({ type: 'SET_SELECTED_ITEM', payload: null });
    dispatch({ type: 'SET_MANUAL_TOTAL_PRICE', payload: '' });
  }, [cartItems, manualTotalPrice, selectedItem, checkStockAvailability, showError]);

  const handleClosePriceModal = useCallback(() => {
    dispatch({ type: 'CLOSE_PRICE_MODAL' });
    dispatch({ type: 'SET_SELECTED_ITEM', payload: null });
    dispatch({ type: 'SET_MANUAL_TOTAL_PRICE', payload: '' });
  }, []);

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
      dispatch({ type: 'SET_CART_ITEMS', payload: updatedCart });
    } else {
      dispatch({ type: 'SET_CART_ITEMS', payload: [...cartItems, { ...selectedItem, price: selectedItem.price, quantity: parsedQuantity }] });
    }

    dispatch({ type: 'CLOSE_QUANTITY_MODAL' });
    dispatch({ type: 'SET_SELECTED_ITEM', payload: null });
    dispatch({ type: 'SET_MANUAL_QUANTITY', payload: '' });
  }, [cartItems, manualQuantity, selectedItem, checkStockAvailability, showError]);

  const handleCloseQuantityModal = useCallback(() => {
    dispatch({ type: 'CLOSE_QUANTITY_MODAL' });
    dispatch({ type: 'SET_SELECTED_ITEM', payload: null });
    dispatch({ type: 'SET_MANUAL_QUANTITY', payload: '' });
  }, []);

  const handleRemoveItem = useCallback((index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    dispatch({ type: 'SET_CART_ITEMS', payload: updatedCart });
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
    
    dispatch({ type: 'SET_CART_ITEMS', payload: updatedCart });
  }, [cartItems, checkStockAvailability, showError]);

  const calculateTotal = useCallback(() => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
    
    const tax = subtotal * 0.0;
    return { subtotal, tax, total: subtotal + tax };
  }, [cartItems]);

  const { subtotal, tax, total } = calculateTotal();

  const categories = useMemo(() => 
    Object.keys(menuItems).map((category) => ({
      value: category,
      label: category,
    })), [menuItems]);

  const selectedCategoryValue = useMemo(() => 
    categories.find((option) => option.value === selectedCategory) || null, 
    [categories, selectedCategory]);

  const handleCategoryChange = useCallback((selectedOption) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: selectedOption ? selectedOption.value : null });
  }, []);

  const filteredItems = useMemo(() => 
    selectedCategory && menuItems[selectedCategory]
      ? menuItems[selectedCategory].filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [], 
    [selectedCategory, menuItems, searchQuery]);

  const handleChargeClick = useCallback((e) => {
    console.log('=== CHARGE CLICK START ===');
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Event stopped from propagating');
    }
    
    console.log('Charge button clicked, cart items:', cartItems.length);
    
    if (cartItems.length > 0) {
      console.log('Dispatching OPEN_CHARGE_MODAL');
      dispatch({ type: 'OPEN_CHARGE_MODAL' });
      dispatch({ type: 'SET_AMOUNT_PAID', payload: '' });
      dispatch({ type: 'SET_CUSTOMER_ID', payload: '1' });
      console.log('=== CHARGE CLICK COMPLETE ===');
    } else {
      showError("Cart is empty. Add items before charging.");
    }
  }, [cartItems, showError]);

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

      console.log("Saving sales:", JSON.stringify(salesData, null, 2));
      const response = await createSale(salesData);

      const change = parsedAmountPaid - total;
      dispatch({ type: 'SET_CHANGE_AMOUNT', payload: change });

      dispatch({ type: 'SET_CART_ITEMS', payload: [] });
      showSuccess(`Sale recorded successfully! Sale ID: ${response.saleId}`);
      dispatch({ type: 'CLOSE_CHARGE_MODAL' });
      dispatch({ type: 'OPEN_CHANGE_MODAL' });

      await fetchData();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to save sale. Please try again.";
      console.error("Save Sale Error:", err, "Detailed Message:", errorMessage);
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [cartItems, amountPaid, total, paymentMethod, customerId, userId, fetchData, showError, showSuccess, clearError, clearSuccess, validateCustomerId]);

  const handleCloseChangeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_CHANGE_MODAL' });
    dispatch({ type: 'SET_CHANGE_AMOUNT', payload: 0 });
    dispatch({ type: 'SET_AMOUNT_PAID', payload: '' });
  }, []);

  const handlePrintReceipt = useCallback(() => {
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
            <div class="receipt-header">
              <h2>Receipt</h2>
              <p>Date: ${new Date().toLocaleString()}</p>
            </div>
            <div class="receipt-items">
              ${cartItems.map((item, index) => `
                <div class="receipt-item" key=${index}>
                  <span>${item.name} x ${item.quantity}</span>
                  <span>K${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            <div class="receipt-totals">
              <div class="receipt-total">
                <span>Subtotal:</span>
                <span>K${subtotal.toFixed(2)}</span>
              </div>
              <div class="receipt-total">
                <span>Tax:</span>
                <span>K${tax.toFixed(2)}</span>
              </div>
              <div class="receipt-total">
                <span>Total:</span>
                <span>K${total.toFixed(2)}</span>
              </div>
              <div class="receipt-total">
                <span>Amount Paid:</span>
                <span>K${parseFloat(amountPaid).toFixed(2)}</span>
              </div>
              <div class="receipt-total">
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
  }, [cartItems, subtotal, tax, total, amountPaid, changeAmount]);

  const handleCartClick = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    dispatch({ type: 'OPEN_CART_MODAL' });
  }, []);

  const handleCloseChargeModal = useCallback(() => {
    console.log('Closing charge modal');
    dispatch({ type: 'CLOSE_CHARGE_MODAL' });
    dispatch({ type: 'SET_AMOUNT_PAID', payload: '' });
    dispatch({ type: 'SET_CUSTOMER_ID', payload: '1' });
  }, []);

  const handleCloseCartModal = useCallback(() => {
    dispatch({ type: 'CLOSE_CART_MODAL' });
  }, []);

  const handleTogglePosMenu = useCallback(() => {
    dispatch({ type: 'TOGGLE_POS_MENU' });
  }, []);

  const paymentOptions = useMemo(() => [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'mobile', label: 'Mobile Money' },
  ], []);

  return (
    <div className="pos-container" onClick={() => console.log('POS container clicked')}>
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
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
                  disabled={isSaving}
                  aria-label="Search items"
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}>
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
                <button 
                  className="charge-btn" 
                  onClick={handleChargeClick} 
                  disabled={isSaving}
                  style={{ position: 'relative', zIndex: 1 }}
                >
                  Charge K{total.toFixed(2)}
                </button>
              </div>
            </div>
          </div>

          {/* Quantity Modal */}
          <Modal isOpen={isQuantityModalOpen} onClose={handleCloseQuantityModal} title="Enter Quantity">
            <div className="modal-body">
              <p>Enter the quantity for <strong>{selectedItem?.name}</strong>:</p>
              <p>Available Stock: {selectedItem ? productStock[selectedItem.id] || 0 : 0}</p>
              <input
                type="number"
                className="quantity-input"
                value={manualQuantity}
                onChange={(e) => {
                  dispatch({ type: 'SET_MANUAL_QUANTITY', payload: e.target.value });
                }}
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
              <button className="close-btn" onClick={handleCloseQuantityModal} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </Modal>

          {/* Price Modal */}
          <Modal isOpen={isPriceModalOpen} onClose={handleClosePriceModal} title="Enter Total Price">
            <div className="modal-body">
              <p>Enter the total price for <strong>{selectedItem?.name}</strong>:</p>
              <p>Available Stock: {selectedItem ? productStock[selectedItem.id] || 0 : 0}</p>
              <input
                type="number"
                className="price-input"
                value={manualTotalPrice}
                onChange={(e) => {
                  dispatch({ type: 'SET_MANUAL_TOTAL_PRICE', payload: e.target.value });
                }}
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
              <button className="close-btn" onClick={handleClosePriceModal} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </Modal>

          {/* Cart Modal */}
          <Modal isOpen={isCartModalOpen} onClose={handleCloseCartModal} title="Cart Details">
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
          </Modal>

          {/* Charge Modal */}
          <Modal isOpen={isChargeModalOpen} onClose={handleCloseChargeModal} title="Confirm Charge">
            <div className="modal-body">
              {cartItems.length > 0 ? (
                <div className="charge-modal-content">
                  {/* Order Summary */}
                  <div className="charge-order-summary">
                    <h4>Order Summary</h4>
                    {cartItems.slice(0, 3).map((item, index) => (
                      <div key={index} className="charge-order-item">
                        <span>{item.name} x {item.quantity}</span>
                        <span>K{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <div className="charge-order-more">+{cartItems.length - 3} more items</div>
                    )}
                  </div>

                  <div className="charge-modal-payment-method">
                    <label>Payment Method:</label>
                    <Select
                      value={paymentOptions.find(option => option.value === paymentMethod)}
                      onChange={(option) => {
                        console.log('Payment method changed to:', option.value);
                        dispatch({ type: 'SET_PAYMENT_METHOD', payload: option.value });
                      }}
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
                      onChange={(e) => {
                        console.log('Customer ID changed to:', e.target.value);
                        dispatch({ type: 'SET_CUSTOMER_ID', payload: e.target.value });
                      }}
                      placeholder="Enter Customer ID"
                      disabled={isSaving}
                      min="1"
                    />
                  </div>

                  <div className="charge-modal-totals">
                    <div className="total-breakdown">
                      <div className="total-row">
                        <span>Subtotal:</span>
                        <span>K{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="total-row">
                        <span>Tax:</span>
                        <span>K{tax.toFixed(2)}</span>
                      </div>
                      <div className="total-row main-total">
                        <span>Total:</span>
                        <span className="total-amount">K{total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="amount-paid-section">
                      <label>Amount Paid:</label>
                      <input
                        type="number"
                        className="amount-paid-input"
                        value={amountPaid}
                        onChange={(e) => {
                          console.log('Amount paid changed to:', e.target.value);
                          dispatch({ type: 'SET_AMOUNT_PAID', payload: e.target.value });
                        }}
                        min={total}
                        step="0.01"
                        placeholder={`Minimum: K${total.toFixed(2)}`}
                        autoFocus
                        disabled={isSaving}
                      />
                      {amountPaid && parseFloat(amountPaid) < total && (
                        <div className="amount-warning">
                          Amount must be at least K{total.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {amountPaid && parseFloat(amountPaid) > total && (
                      <div className="change-display">
                        <span>Change Due:</span>
                        <span className="change-amount">
                          K{(parseFloat(amountPaid) - total).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="no-items-message">No items to charge.</div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="confirm-btn" 
                onClick={() => {
                  console.log('Confirm Sale button clicked');
                  handleConfirmCharge();
                }} 
                disabled={isSaving || !amountPaid || parseFloat(amountPaid) < total}
              >
                {isSaving ? "Processing..." : "Confirm Sale"}
              </button>
              <button 
                className="close-btn" 
                onClick={() => {
                  console.log('Cancel button clicked');
                  handleCloseChargeModal();
                }} 
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </Modal>

          {/* Change Modal */}
          <Modal isOpen={isChangeModalOpen} onClose={handleCloseChangeModal} title="Change Due">
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
          </Modal>
        </>
      )}
    </div>
  );
};

export default POS;