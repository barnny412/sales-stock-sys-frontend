import React, { useState } from 'react';
import "../assets/styles/POS.css";

const POS = () => {
  const [ticketItems, setTicketItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Breakfast');
  const [takeout, setTakeout] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample menu items
  const menuItems = {
    Breakfast: [
      { id: 1, name: 'Flavo American Coffee', price: 4.00 },
      { id: 2, name: 'Pancakes with Honey', price: 6.50 },
      { id: 3, name: 'Chicken Salad Croissant', price: 6.00 },
      { id: 4, name: 'Extra Cheesy Breakfast Pitaz', price: 8.00 },
    ],
    Lunch: [
      { id: 5, name: 'Chicken Burger', price: 7.50 },
      { id: 6, name: 'Caesar Salad', price: 5.00 },
    ],
    'Hot Drinks': [
      { id: 7, name: 'Cappuccino', price: 4.50 },
    ],
    Favorites: [
      { id: 8, name: 'Cheesecake', price: 5.50 },
    ],
    'Fruits and Salads': [
      { id: 9, name: 'Orange Juice Fresh', price: 5.00 },
    ],
  };

  const handleAddItem = (item) => {
    setTicketItems([...ticketItems, { ...item, quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setTicketItems(ticketItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = ticketItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1; // 10% tax
    return { subtotal, tax, total: subtotal + tax };
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="pos-container">
      <div className="pos-grid">
        {/* Left Panel: Item Selection */}
        <div className="item-selection">
          <div className="category-select">
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-dropdown"
            >
              {Object.keys(menuItems).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="item-grid">
            {menuItems[selectedCategory].map((item) => (
              <div
                key={item.id}
                className="item-card"
                onClick={() => handleAddItem(item)}
              >
                <span className="item-name">{item.name}</span>
                <span className="item-price">${item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Ticket (Hidden on Mobile) */}
        <div className="ticket-panel">
          <h2 className="ticket-header">Ticket</h2>
          <div className="ticket-options">
          </div>
          {ticketItems.map((item, index) => (
            <div key={index} className="ticket-item">
              <span>{item.name} x {item.quantity}</span>
              <div className="ticket-item-actions">
                <span>K{(item.price * item.quantity).toFixed(2)}</span>
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveItem(index)}
                >
                  X
                </button>
              </div>
            </div>
          ))}
          <div className="ticket-total">
            <span>Subtotal</span>
            <span>K{subtotal.toFixed(2)}</span>
          </div>
          <div className="ticket-total">
            <span>Tax</span>
            <span>K{tax.toFixed(2)}</span>
          </div>
          <div className="ticket-total">
            <span>Total</span>
            <span>K{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      <div className="bottom-panel">
        <div className="bottom-left"></div>
        <div className="bottom-right">
          <div className="ticket-actions">
            <button
              className="ticket-btn"
              onClick={() => setIsModalOpen(true)}
            >
              Ticket ({ticketItems.length})
            </button>
            <button className="charge-btn">CHARGE</button>
          </div>
        </div>
      </div>

      {/* Ticket Modal (Visible on Mobile) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">Ticket</h3>
            <div className="modal-body">
              <div className="ticket-options">
                <label>
                  <input
                    type="checkbox"
                    checked={takeout}
                    onChange={(e) => setTakeout(e.target.checked)}
                  />
                  Take out
                </label>
              </div>
              {ticketItems.length === 0 ? (
                <p className="no-items-message">No items in the ticket.</p>
              ) : (
                ticketItems.map((item, index) => (
                  <div key={index} className="ticket-item">
                    <span>{item.name} x {item.quantity}</span>
                    <div className="ticket-item-actions">
                      <span>K{(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(index)}
                      >
                        X
                      </button>
                    </div>
                  </div>
                ))
              )}
              <div className="ticket-total">
                <span>Subtotal</span>
                <span>K{subtotal.toFixed(2)}</span>
              </div>
              <div className="ticket-total">
                <span>Tax</span>
                <span>K{tax.toFixed(2)}</span>
              </div>
              <div className="ticket-total">
                <span>Total</span>
                <span>K{total.toFixed(2)}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="charge-btn"
                onClick={() => setIsModalOpen(false)}
              >
                CHARGE
              </button>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
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