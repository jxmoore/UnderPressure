import React, { useState, useRef, useEffect } from 'react';
import { Home, LogOut, Moon, Sun, PlusCircle, Menu, X, Share2 } from 'lucide-react';
import type { Theme } from '../types';

interface SidebarProps {
  theme: Theme;
  userName: string;
  toggleTheme: () => void;
  onLogout: () => void;
  onAddEntry: () => void;
  onNavigateHome: () => void;
  onShare: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  theme,
  userName,
  toggleTheme,
  onLogout,
  onAddEntry,
  onNavigateHome,
  onShare,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNavAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <nav className="topnav" ref={menuRef}>
      <div className="topnav-bar">
        <div className="topnav-left">
          <h2 className="brand">Under<span>Pressure</span></h2>
          <p className="user-welcome">Welcome, {userName}</p>
        </div>
        <button
          className="hamburger-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="topnav-dropdown">
          <button className="nav-item" onClick={() => handleNavAction(onNavigateHome)}>
            <Home size={20} />
            <span>Dashboard</span>
          </button>
          <button className="nav-item accent-cyan" onClick={() => handleNavAction(onAddEntry)}>
            <PlusCircle size={20} />
            <span>Add Entry</span>
          </button>
          <button className="nav-item" onClick={() => handleNavAction(onShare)}>
            <Share2 size={20} />
            <span>Share My Data</span>
          </button>
          <button className="nav-item theme-toggle" onClick={() => handleNavAction(toggleTheme)}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button className="nav-item logout-btn" onClick={() => handleNavAction(onLogout)}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      )}

      <style>{`
        .topnav {
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: var(--sidebar-bg);
          border-bottom: 1px solid var(--border-color);
          transition: background-color var(--transition-speed), border-color var(--transition-speed);
        }

        .topnav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
        }

        .topnav-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .brand {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .brand span {
          color: var(--accent-cyan);
        }

        .user-welcome {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 0.75rem;
          color: var(--text-primary);
          background: transparent;
          border: 1px solid var(--border-color);
          cursor: pointer;
          transition: all 0.2s;
        }

        .hamburger-btn:hover {
          box-shadow: var(--card-glow);
          border-color: transparent;
        }

        .topnav-dropdown {
          position: absolute;
          left: 0;
          right: 0;
          z-index: 99;
          background-color: rgba(18, 18, 26, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.5rem 2rem 1.25rem;
          animation: slideDown 0.2s ease-out;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        }


        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-weight: 500;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.9375rem;
        }

        .nav-item:hover {
          box-shadow: var(--card-glow);
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .topnav-bar {
            padding: 0.75rem 1rem;
          }

          .topnav-left {
            gap: 0.75rem;
          }

          .brand {
            font-size: 1.25rem;
          }

          .user-welcome {
            display: none;
          }

          .topnav-dropdown {
            padding: 0.5rem 1rem 1rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Sidebar;
