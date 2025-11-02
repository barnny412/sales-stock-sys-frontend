import React from 'react';

const ProductGrid = ({ items, productStock, onAddItem, isSaving }) => {
  return (
    <div className="item-grid">
      {items.length > 0 ? (
        items.map((item) => (
          <button
            key={item.id}
            className="item-card"
            onClick={() => !isSaving && onAddItem(item)}
            title={`Add ${item.name} to cart. Price: K${item.price.toFixed(2)}. Stock: ${productStock[item.id] || 0}`}
            disabled={isSaving}
            aria-label={`Add ${item.name} to cart`}
          >
            <span className="item-name">{item.name}</span>
            <span className="item-price">K{item.price.toFixed(2)}</span>
            <span className="item-stock">Stock: {productStock[item.id] || 0}</span>
          </button>
        ))
      ) : (
        <div style={{ color: 'white', textAlign: 'center', gridColumn: '1 / -1' }}>
          No items found.
        </div>
      )}
    </div>
  );
};

export default ProductGrid;