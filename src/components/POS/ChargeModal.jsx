import React from 'react';
import Select from 'react-select';
import '../../assets/styles/POS/ChargeModal.css';

const ChargeModal = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  tax,
  total,
  paymentMethod,
  onPaymentMethodChange,
  customerId,
  onCustomerIdChange,
  amountPaid,
  onAmountPaidChange,
  onConfirmCharge,
  isSaving,
  paymentOptions
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header-container">
          <h2 className="modal-header">Confirm Charge</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="modal-body">
          {cartItems.length > 0 ? (
            <div className="charge-modal-content">
              <div className="charge-modal-payment-method">
                <label>Payment Method:</label>
                <Select
                  value={paymentOptions.find(option => option.value === paymentMethod)}
                  onChange={(option) => onPaymentMethodChange(option.value)}
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
                  onChange={(e) => onCustomerIdChange(e.target.value)}
                  placeholder="Enter Customer ID"
                  disabled={isSaving}
                  min="1"
                />
              </div>

              <div className="charge-modal-totals">
                <div className="total-breakdown">
                  <div className="total-row main-total">
                    <span>Total Amount:</span>
                    <span className="total-amount">K{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="amount-paid-section">
                  <label>Amount Paid:</label>
                  <input
                    type="number"
                    className="amount-paid-input"
                    value={amountPaid}
                    onChange={(e) => onAmountPaidChange(e.target.value)}
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
              </div>
            </div>
          ) : (
            <div className="no-items-message">No items to charge.</div>
          )}
        </div>
        <div className="modal-actions">
          <button 
            className="confirm-btn" 
            onClick={onConfirmCharge} 
            disabled={isSaving || !amountPaid || parseFloat(amountPaid) < total}
          >
            {isSaving ? "Processing..." : "Confirm Sale"}
          </button>
          <button 
            className="close-btn" 
            onClick={onClose} 
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChargeModal;