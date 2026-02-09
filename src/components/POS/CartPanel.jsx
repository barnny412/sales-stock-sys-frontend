import React from 'react';
import '../../assets/styles/POS/CartPanel.css';

const CartPanel = ({ cartItems, onQuantityChange, onRemoveItem, subtotal, tax, total, isSaving }) => {
  return (
    <div className="cart-panel desktop-only">
      <div className="cart-items-scroll">
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div key={index} className="cart-item">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-quantity-label"></span>
              <button
                className="cart-item-decrease-btn"
                onClick={() => onQuantityChange(index, -1)}
                title="Decrease quantity"
                disabled={isSaving}
                aria-label={`Decrease quantity of ${item.name}`}
              >
                −
              </button>
              <span className="cart-item-quantity">{item.quantity}</span>
              <button
                className="cart-item-increase-btn"
                onClick={() => onQuantityChange(index, 1)}
                title="Increase quantity"
                disabled={isSaving}
                aria-label={`Increase quantity of ${item.name}`}
              >
                +
              </button>
              <div className="cart-item-actions">
                <span className="cart-item-price">K{(item.price * item.quantity).toFixed(2)}</span>
                <button
                  className="cart-item-remove-btn"
                  onClick={() => onRemoveItem(index)}
                  title="Remove item from cart"
                  disabled={isSaving}
                  aria-label={`Remove ${item.name} from cart`}
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
  );
};

export default CartPanel;