import React from 'react';

const Receipt = ({ cartItems, subtotal, tax, total, amountPaid, changeAmount }) => {
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
  };

  return handlePrintReceipt;
};

export default Receipt;