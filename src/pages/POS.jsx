import React, { useState, useEffect } from 'react';
import { fetchProductsWithCategory } from "../api/productsAPI";
import "../assets/styles/POS.css";

const POS = () => {
  const [ticketItems, setTicketItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('cigarette');
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false); // Renamed for clarity
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false); // Added for ticket modal
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
            price: price
          });
          return acc;
        }, {});
        setMenuItems(groupedItems);
      } catch (err) {
        setError(err.message || "Failed to load menu items.");
        console.error("Fetch Data Error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAddItem = (item) => {
    const price = Number(item.price) || 0;
    if (isNaN(price)) {
      console.warn(`Invalid price for item ${item.name}: setting price to 0`);
      return;
    }
    setTicketItems([...ticketItems, { ...item, price, quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setTicketItems(ticketItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = ticketItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
    const tax = subtotal * 0.0;
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateTotal();

  const filteredItems = menuItems[selectedCategory]?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleChargeClick = () => {
    setIsChargeModalOpen(true);
  };

  const handleTicketClick = () => {
    setIsTicketModalOpen(true);
  };

  const handleCloseChargeModal = () => {
    setIsChargeModalOpen(false);
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
  };

  return (
    <div className="pos-container">
      {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
      {isLoading ? (
        <div style={{ color: 'white', textAlign: 'center' }}>Loading...</div>
      ) : (
        <>
          <div className="pos-grid">
            {/* Left Panel: Item Selection */}
            <div className="item-selection">
              <div className="category-select">
                <select
                  className="category-dropdown"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {Object.keys(menuItems).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="item-grid">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="item-card"
                      onClick={() => handleAddItem(item)}
                    >
                      <span className="item-name">{item.name}</span>
                      <span className="item-price">${item.price.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'white', textAlign: 'center' }}>
                    No items found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Ticket */}
            <div className="ticket-panel">
              <div className="ticket-items-scroll">
                {ticketItems.length > 0 ? (
                  ticketItems.map((item, index) => (
                    <div key={index} className="ticket-item">
                      <span>{item.name} x {item.quantity}</span>
                      <div className="ticket-item-actions">
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveItem(index)}
                        >
                          X
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'white', textAlign: 'center' }}>
                    No items in ticket.
                  </div>
                )}
              </div>
              <div className="ticket-totals">
                <div className="ticket-total">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="ticket-total">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="ticket-total">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
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
              <div className="ticket-actions">
                <button className="ticket-btn" onClick={handleTicketClick}>
                  Ticket ({ticketItems.length})
                </button>
                <button className="charge-btn" onClick={handleChargeClick}>
                  Charge ${total.toFixed(2)}
                </button>
              </div>
            </div>
          </div>

          {/* Modal for Ticket Confirmation */}
          {isTicketModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="modal-header">Ticket Details</h2>
                <div className="modal-body">
                  {ticketItems.length > 0 ? (
                    <>
                      {ticketItems.map((item, index) => (
                        <div key={index} className="ticket-item">
                          <span>{item.name} x {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="ticket-totals">
                        <div className="ticket-total">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="ticket-total">
                          <span>Tax:</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="ticket-total">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="no-items-message">No items in ticket.</div>
                  )}
                </div>
                <div className="modal-actions">
                  <button className="close-btn" onClick={handleCloseTicketModal}>
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
                  {ticketItems.length > 0 ? (
                    <>
                      {ticketItems.map((item, index) => (
                        <div key={index} className="ticket-item">
                          <span>{item.name} x {item.quantity}</span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="ticket-totals">
                        <div className="ticket-total">
                          <span>Subtotal:</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="ticket-total">
                          <span>Tax:</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="ticket-total">
                          <span>Total:</span>
                          <span>${total.toFixed(2)}</span>
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