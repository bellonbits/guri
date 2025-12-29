import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, Loader } from 'lucide-react';
import './VerifyEmailPage.css'; // Reusing shared styles

function ForgotPasswordPage() {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await forgotPassword(email);
        setLoading(false);

        if (result.success) {
            setSubmitted(true);
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card">
                <div className="center-content">
                    <h2>Reset Password</h2>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>

                    {!submitted ? (
                        <form className="auth-form" onSubmit={handleSubmit}>
                            {error && <div className="error-message text-error">{error}</div>}

                            <div className="input-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? <Loader className="animate-spin" size={20} /> : 'Send Reset Link'}
                            </button>

                            <Link to="/login" className="link-text center-text">
                                <ArrowLeft size={16} style={{ display: 'inline', marginRight: '4px' }} />
                                Back to Login
                            </Link>
                        </form>
                    ) : (
                        <div className="success-state center-content">
                            <Mail className="text-primary" size={64} />
                            <h3>Check your inbox</h3>
                            <p>We've sent a password reset link to <strong>{email}</strong>.</p>
                            <button
                                className="btn btn-outline btn-full"
                                onClick={() => setSubmitted(false)}
                            >
                                Resend Link
                            </button>
                            <Link to="/login" className="link-text">Back to Login</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
