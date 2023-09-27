import { useState } from 'react';
import classes from './ProfileNavbar.module.css';

const Navbar = ({getNavItem}) => {
  const navItems = [
    { id: 'info', label: 'Info' },
    { id: 'response', label: 'Feedback' },
    { id: 'report', label: 'Report' },
  ];

  const [navItem, setNavItem] = useState('info');

  const handleNavItemClick = (itemId) => {
    setNavItem(itemId);
    getNavItem(itemId)
  };

  return (
    <nav className={classes.Navbar}>
      {navItems.map((item) => (
        <li
          key={item.id}
          onClick={() => handleNavItemClick(item.id)}
          className={navItem === item.id ? classes.Active : ''}
        >
          {item.label}
        </li>
      ))}
    </nav>
  );
};

export default Navbar;
