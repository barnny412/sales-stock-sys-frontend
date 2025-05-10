import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, IconButton, useMediaQuery, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import '../assets/styles/Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">BPOS</div>
        {!isSmallScreen && (
          <ul className="nav-links">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/sales">Sales</Link></li>
            <li><Link to="/purchases">Purchases</Link></li>
            <li><Link to="/stocks">Stocks</Link></li>
            <li><Link to="/expenses">Expenses</Link></li>
            <li><Link to="/damages">Damages</Link></li>
            <li><Link to="/cashflow">Cashflow</Link></li>
            <li><Link to="/settings">Settings</Link></li>
            <li><Link to="/pos">POS</Link></li> {/* Added POS link */}
          </ul>
        )}
        {isSmallScreen && (
          <IconButton
            className="menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Open Menu"
          >
            <MenuIcon style={{ color: 'white' }} />
          </IconButton>
        )}
        <Drawer anchor="left" open={menuOpen} onClose={() => setMenuOpen(false)}>
          <div className="drawer-content">
            <div className="drawer-header">
              <Typography variant="h6" className="drawer-header-text">
                FrontMark Trading LTD
              </Typography>
              <IconButton className="drawer-close" onClick={() => setMenuOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
            <List>
              {[
                { text: 'Dashboard', path: '/' },
                { text: 'Products', path: '/products' },
                { text: 'Sales', path: '/sales' },
                { text: 'Purchases', path: '/purchases' },
                { text: 'Stocks', path: '/stocks' },
                { text: 'Expenses', path: '/expenses' },
                { text: 'Damages', path: '/damages' },
                { text: 'Cashflow', path: '/cashflow' },
                { text: 'Settings', path: '/settings' },
                { text: 'POS', path: '/pos' }, // Added POS to the drawer menu
              ].map((item, index) => (
                <ListItem
                  key={index}
                  onClick={() => setMenuOpen(false)}
                  component="div"
                >
                  <Link to={item.path} className="drawer-link">
                    <ListItemText primary={item.text} className="drawer-link-text" />
                  </Link>
                </ListItem>
              ))}
            </List>
          </div>
        </Drawer>
      </div>
    </nav>
  );
};

export default Navbar;