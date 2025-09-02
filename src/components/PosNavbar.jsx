import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, IconButton, useMediaQuery, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import Select from 'react-select';
import '../assets/styles/PosNavbar.css';

const PosNavbar = ({ searchQuery, setSearchQuery, menuItems, selectedCategory, setSelectedCategory, onFilterChange, isSaving }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  // Prepare categories for Select component
  const categories = Object.keys(menuItems || {}).map((category) => ({
    value: category,
    label: category,
  }));
  const selectedCategoryValue = categories.find((option) => option.value === selectedCategory) || null;

  const handleCategoryChange = (selectedOption) => {
    const newCategory = selectedOption ? selectedOption.value : null;
    setSelectedCategory(newCategory);
    if (onFilterChange) {
      onFilterChange({
        searchQuery,
        selectedCategory: newCategory,
      });
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onFilterChange) {
      onFilterChange({
        searchQuery: query,
        selectedCategory,
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onFilterChange) {
      onFilterChange({ searchQuery: '', selectedCategory });
    }
  };

  // Debounce the search query to avoid excessive filtering
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onFilterChange) {
        onFilterChange({
          searchQuery,
          selectedCategory,
        });
      }
    }, 300); // 300ms debounce
    return () => clearTimeout(handler);
  }, [searchQuery, selectedCategory, onFilterChange]);

  return (
    <nav className="pos-navbar">
      <div className="pos-nav-container">
        <div className="pos-logo">BPOS - Point of Sale</div>

        {!isSmallScreen && (
          <div className="pos-nav-controls">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search items..."
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={isSaving}
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={clearSearch}
                  disabled={isSaving}
                >
                  X
                </button>
              )}
            </div>
            <div className="category-select">
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
                  control: (provided) => ({
                    ...provided,
                    backgroundColor: '#333',
                    borderColor: '#555',
                    minHeight: '38px',
                    '&:hover': {
                      borderColor: '#666',
                    },
                  }),
                  menu: (provided) => ({
                    ...provided,
                    backgroundColor: '#333',
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? '#555' : '#333',
                    color: '#fff',
                  }),
                }}
              />
            </div>
          </div>
        )}

        {isSmallScreen && (
          <IconButton
            className="pos-menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Open POS Menu"
            disabled={isSaving}
          >
            <MenuIcon style={{ color: 'white' }} />
          </IconButton>
        )}

        <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
          <div className="pos-drawer-content">
            <div className="pos-drawer-header">
              <Typography variant="h6" className="pos-drawer-header-text">
                POS System
              </Typography>
              <IconButton className="pos-drawer-close" onClick={() => setMenuOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            <List>
              {[
                { text: 'POS Terminal', path: '/pos' },
                { text: 'Products', path: '/products' },
                { text: 'Sales History', path: '/sales' },
                { text: 'Stock Check', path: '/stocks' },
                { text: 'Dashboard', path: '/' },
              ].map((item, index) => (
                <ListItem
                  key={index}
                  onClick={() => setMenuOpen(false)}
                  component="div"
                >
                  <Link
                    to={item.path}
                    className={`pos-drawer-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    <ListItemText primary={item.text} className="pos-drawer-link-text" />
                  </Link>
                </ListItem>
              ))}
            </List>
            
            {/* Mobile search and category controls */}
            <div className="mobile-controls">
              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  disabled={isSaving}
                />
                {searchQuery && (
                  <button
                    className="clear-search-btn"
                    onClick={clearSearch}
                    disabled={isSaving}
                  >
                    X
                  </button>
                )}
              </div>
              
              <div className="category-select">
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
                      color: '#333',
                    }),
                    singleValue: (provided) => ({
                      ...provided,
                      color: '#333',
                    }),
                  }}
                />
              </div>
            </div>
          </div>
        </Drawer>
      </div>
    </nav>
  );
};

export default PosNavbar;