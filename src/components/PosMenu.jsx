import React from 'react';

const PosMenu = ({ isPosMenuOpen, onTogglePosMenu, isSaving }) => {
  return (
    <div className="bottom-left desktop-only">
      <button 
        className="pos-menu-toggle-btn" 
        onClick={onTogglePosMenu} 
        disabled={isSaving}
      >
        {isPosMenuOpen ? 'Close POS Menu' : 'Open POS Menu'}
      </button>
      {isPosMenuOpen && (
        <div className="pos-menu-panel">
          <button className="pos-menu-item" onClick={() => alert('POS Menu Item 1 Clicked')}>
            Item 1
          </button>
          <button className="pos-menu-item" onClick={() => alert('POS Menu Item 2 Clicked')}>
            Item 2
          </button>
          <button className="pos-menu-item" onClick={() => alert('POS Menu Item 3 Clicked')}>
            Item 3
          </button>
        </div>
      )}
    </div>
  );
};

export default PosMenu;