import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#0f172a',
                color: 'white'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has admin role
    if (user?.role !== 'admin' && user?.role !== 'super_admin') {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#0f172a',
                color: 'white',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>403</h1>
                <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
                <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
                    You don't have permission to access the admin panel.
                </p>
                <a href="/" style={{
                    padding: '0.75rem 1.5rem',
                    background: '#6366f1',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px'
                }}>
                    Go to Homepage
                </a>
            </div>
        );
    }

    return children;
}

export default AdminRoute;
