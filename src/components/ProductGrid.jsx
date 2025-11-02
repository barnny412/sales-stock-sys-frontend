import React from 'react';

const ProductGrid = ({ 
  items, 
  productStock, 
  onAddItem, 
  isSaving 
}) => {
  return (
    <div className="item-grid">
      {items.length > 0 ? (
        items.map((item) => {
          const availableStock = productStock[item.id] || 0;
          const isOutOfStock = availableStock <= 0;
          
          return (
            <button
              key={item.id}
              className={`item-card ${isOutOfStock ? 'out-of-stock' : ''}`}
              onClick={() => !isSaving && !isOutOfStock && onAddItem(item)}
              title={
                isOutOfStock 
                  ? `${item.name} is out of stock` 
                  : `Add ${item.name} to cart. Price: K${item.price.toFixed(2)}. Stock: ${availableStock}`
              }
              disabled={isSaving || isOutOfStock}
              aria-label={`Add ${item.name} to cart`}
            >
              <span className="item-name">{item.name}</span>
              <span className="item-price">K{item.price.toFixed(2)}</span>
              <span className={`item-stock ${isOutOfStock ? 'stock-out' : ''}`}>
                Stock: {availableStock}
              </span>
              {isOutOfStock && (
                <div className="out-of-stock-overlay">Out of Stock</div>
              )}
              {(item.requires_manual_quantity || item.requires_manual_price) && (
                <div className="item-special-badge">
                  {item.requires_manual_quantity && 'Manual Qty'}
                  {item.requires_manual_quantity && item.requires_manual_price && ' / '}
                  {item.requires_manual_price && 'Manual Price'}
                </div>
              )}
            </button>
          );
        })
      ) : (
        <div className="no-items-found" style={{ color: 'white', textAlign: 'center', gridColumn: '1 / -1' }}>
          No items found.
        </div>
      )}
    </div>
  );
};

export default ProductGrid;