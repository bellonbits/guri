import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, XCircle, Loader, ArrowRight, Mail } from 'lucide-react';
import './VerifyEmailPage.css';

function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get('token'); // Keep support for fallback if needed, though mostly unused now
    const { verifyEmail, resendVerification } = useAuth();
    const navigate = useNavigate();

    const [code, setCode] = useState(tokenFromUrl || '');
    const [status, setStatus] = useState('input'); // input, verifying, success, error
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState(''); // Would ideally be passed from state, but for now we focus on code

    // Handle manual verification
    const handleVerify = async (e) => {
        if (e) e.preventDefault();

        if (!code || code.length < 6) {
            setStatus('error');
            setMessage('Please enter a valid 6-digit code.');
            return;
        }

        setStatus('verifying');
        const result = await verifyEmail(code);

        if (result.success) {
            setStatus('success');
            setMessage('Email verified successfully!');
        } else {
            setStatus('error');
            setMessage(result.error);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-card center-content">

                {status === 'input' || status === 'error' ? (
                    <>
                        <Mail className="text-primary" size={64} />
                        <h2>Verify Your Email</h2>
                        <p>Please enter the 6-digit code sent to your email address.</p>

                        <form onSubmit={handleVerify} className="auth-form" style={{ marginTop: '1rem' }}>
                            <div className="input-group">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                    placeholder="e.g. 123456"
                                    style={{
                                        textAlign: 'center',
                                        letterSpacing: '4px',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold'
                                    }}
                                    required
                                />
                            </div>

                            {status === 'error' && (
                                <div className="text-error" style={{ fontSize: '0.9rem' }}>
                                    {message}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary btn-full">
                                Verify Account
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline btn-full"
                                style={{ marginTop: '0.5rem', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.7)' }}
                            >
                                Resend Code
                            </button>
                        </form>
                    </>
                ) : null}

                {status === 'verifying' && (
                    <>
                        <Loader className="animate-spin text-primary" size={48} />
                        <h2>Verifying...</h2>
                        <p>Checking your code...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="text-success" size={64} />
                        <h2>Success!</h2>
                        <p>Your email has been verified. You can now log in.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary btn-full"
                        >
                            Continue to Login <ArrowRight size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerifyEmailPage;
