import React, { useState, useEffect } from 'react';
import { fetchProductsWithCategory } from "../api/productsAPI";
import "../assets/styles/POS.css";

const POS = () => {
  const [ticketItems, setTicketItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('cigarette');
  const [takeout, setTakeout] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products and group them by category
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const products = await fetchProductsWithCategory();
        // Group products by category_name and ensure price is a number
        const groupedItems = products.reduce((acc, product) => {
          const category = product.category_name || 'Uncategorized';
          if (!acc[category]) acc[category] = [];
          const price = Number(product.selling_price) || Number(product.cost_price) || 0;
          if (isNaN(price)) {
            console.warn(`Invalid price for product ${product.name}: setting price to 0`);
            return acc; // Skip items with invalid prices
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

  // Clear error messages after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Ensure valid price when adding items to ticket
  const handleAddItem = (item) => {
    const price = Number(item.price) || 0; // Fallback to 0 if price is invalid
    if (isNaN(price)) {
      console.warn(`Invalid price for item ${item.name}: setting price to 0`);
      return; // Skip adding items with invalid prices
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
    const tax = subtotal * 0.0; // 10% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateTotal();

  // Filter items based on search query
  const filteredItems = menuItems[selectedCategory]?.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="pos-container">
      {isLoading && <div className="loading-message">Loading menu items...</div>}
      {error && <div className="error-message">{error}</div>}
      {!isLoading && !error && (
        <div className="pos-grid">
          {/* Left Panel: Item Selection */}
          <div className="item-selection">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search items"
              />
            </div>
            <div className="category-select">
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="category-dropdown"
                aria-label="Select category"
              >
                {Object.keys(menuItems).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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
                    <span className="item-price">K{(Number(item.price) || 0).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="no-items-message">No items available in this category.</p>
              )}
            </div>
          </div>

          {/* Right Panel: Ticket (Fixed) */}
          <div className="ticket-panel">
            <div className="ticket-options"></div>
            <div className="ticket-items-scroll">
              {ticketItems.map((item, index) => (
                <div key={index} className="ticket-item">
                  <span>{item.name} x {item.quantity}</span>
                  <div className="ticket-item-actions">
                    <span>K{(Number(item.price) * Number(item.quantity) || 0).toFixed(2)}</span>
                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(index)}
                      aria-label={`Remove ${item.name} from ticket`}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="ticket-totals">
              <div className="ticket-total">
                <span>Subtotal</span>
                <span>K{(subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="ticket-total">
                <span>Tax</span>
                <span>K{(tax || 0).toFixed(2)}</span>
              </div>
              <div className="ticket-total">
                <span>Total</span>
                <span>K{(total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Panel */}
      {!isLoading && !error && (
        <div className="bottom-panel">
          <div className="bottom-left"></div>
          <div className="bottom-right">
            <div className="ticket-actions">
              <button
                className="ticket-btn"
                onClick={() => setIsModalOpen(true)}
                aria-label={`Open ticket with ${ticketItems.length} items`}
              >
                Ticket ({ticketItems.length})
              </button>
              <button className="charge-btn" aria-label="Charge ticket">
                CHARGE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal (Visible on Mobile) */}
      {isModalOpen && !isLoading && !error && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">Ticket</h3>
            <div className="modal-body">
              <div className="ticket-options"></div>
              {ticketItems.length === 0 ? (
                <p className="no-items-message">No items in the ticket.</p>
              ) : (
                ticketItems.map((item, index) => (
                  <div key={index} className="ticket-item">
                    <span>{item.name} x {item.quantity}</span>
                    <div className="ticket-item-actions">
                      <span>K{(Number(item.price) * Number(item.quantity) || 0).toFixed(2)}</span>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(index)}
                        aria-label={`Remove ${item.name} from ticket`}
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div className="ticket-total">
                <span>Subtotal</span>
                <span>K{(subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="ticket-total">
                <span>Tax</span>
                <span>K{(tax || 0).toFixed(2)}</span>
              </div>
              <div className="ticket-total">
                <span>Total</span>
                <span>K{(total || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="charge-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Charge ticket"
              >
                CHARGE
              </button>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close ticket modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;