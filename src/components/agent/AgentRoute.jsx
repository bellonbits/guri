import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AgentRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#f7f7f7',
                color: '#333'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check if user has agent related roles
    const allowedRoles = ['agent', 'admin', 'super_admin'];

    if (!allowedRoles.includes(user?.role)) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: '#f7f7f7',
                color: '#333',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>403</h1>
                <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                    This area is restricted to Agents only.
                </p>
                <a href="/" style={{
                    padding: '0.75rem 1.5rem',
                    background: '#ff385c',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 600
                }}>
                    Go to Homepage
                </a>
            </div>
        );
    }

    return children;
}

export default AgentRoute;
