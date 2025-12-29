import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader, Lock, CheckCircle } from 'lucide-react';
import './VerifyEmailPage.css'; // Reusing shared styles

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { resetPassword } = useAuth();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        const result = await resetPassword(token, password);
        setLoading(false);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } else {
            setError(result.error);
        }
    };

    if (!token) {
        return (
            <div className="auth-page-container">
                <div className="auth-card center-content">
                    <div className="text-error">Invalid or missing reset token.</div>
                    <Link to="/forgot-password" className="btn btn-primary">Request New Link</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="center-content">
                    {!success ? (
                        <>
                            <h2>Set New Password</h2>
                            <p>Please enter your new password below.</p>

                            <form className="auth-form" onSubmit={handleSubmit}>
                                {error && <div className="error-message text-error">{error}</div>}

                                <div className="input-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div className="input-group">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? <Loader className="animate-spin" size={20} /> : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="text-success" size={64} />
                            <h2>Password Reset!</h2>
                            <p>Your password has been successfully updated. Redirecting to login...</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
