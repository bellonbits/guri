import { Outlet, Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart3,
    Building2,
    Users,
    Activity,
    Settings,
    Menu,
    X,
    LogOut,
    User,
    Home
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/', label: 'Home Page', icon: <Home size={20} /> },
        { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
        { path: '/admin/properties', label: 'Properties', icon: <Building2 size={20} /> },
        { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
        { path: '/admin/monitoring', label: 'Monitoring', icon: <Activity size={20} /> },
        { path: '/admin/settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        {sidebarOpen && <span>Guri24 Admin</span>}
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="admin-user">
                        <div className="user-avatar">
                            <User size={20} />
                        </div>
                        {sidebarOpen && (
                            <div className="user-info">
                                <span className="user-name">{user?.name || 'Admin'}</span>
                                <span className="user-role">Administrator</span>
                            </div>
                        )}
                    </div>
                    <button className="logout-btn" onClick={logout} title="Logout">
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Header */}
                <header className="admin-header">
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu size={24} />
                    </button>

                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    <div className="header-actions">
                        <div className="admin-user-menu">
                            <div className="user-avatar">
                                <User size={20} />
                            </div>
                            <span>{user?.name || 'Admin'}</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}

export default AdminLayout;
