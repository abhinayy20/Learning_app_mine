import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_USER_API || 'http://localhost:3002';

export default function Login() {
    const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const { login } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function sendLoginOTP() {
        if (!phone) {
            return setError('Please enter your phone number');
        }

        let formattedPhone = phone;
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone;
        }

        setOtpLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: formattedPhone })
            });

            const data = await response.json();

            if (data.success) {
                setOtpSent(true);
                alert('OTP sent to your phone!');
            } else {
                setError(data.message || 'Failed to send OTP');
            }
        } catch (err) {
            setError('Failed to send OTP. Please try again.');
        }

        setOtpLoading(false);
    }

    async function handlePhoneLogin(e) {
        e.preventDefault();

        if (!otp) {
            return setError('Please enter the OTP code');
        }

        let formattedPhone = phone;
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone;
        }

        setLoading(true);
        setError('');

        try {
            // First verify OTP
            const verifyResponse = await fetch(`${API_BASE}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone: formattedPhone, code: otp })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success && verifyData.valid) {
                // OTP verified - now login using phone
                // For now, we'll find user by phone and log them in
                // In production, you'd have a dedicated phone login endpoint
                alert('OTP verified! Logging you in...');
                // TODO: Implement actual phone-based login
                setError('Phone login coming soon! Please use email/password for now.');
            } else {
                setError(verifyData.message || 'Invalid OTP code');
            }
        } catch (err) {
            setError('Failed to login. Please try again.');
        }

        setLoading(false);
    }

    async function handleEmailLogin(e) {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Failed to log in: ' + err.message);
        }

        setLoading(false);
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Log In</h2>

                {/* Login Method Toggle */}
                <div className="login-method-toggle">
                    <button
                        type="button"
                        className={loginMethod === 'email' ? 'active' : ''}
                        onClick={() => { setLoginMethod('email'); setError(''); }}
                    >
                        Email/Password
                    </button>
                    <button
                        type="button"
                        className={loginMethod === 'phone' ? 'active' : ''}
                        onClick={() => { setLoginMethod('phone'); setError(''); }}
                    >
                        Phone OTP
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {/* Email/Password Login */}
                {loginMethod === 'email' && (
                    <form onSubmit={handleEmailLogin}>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button disabled={loading} className="btn-primary" type="submit">
                            {loading ? 'Logging In...' : 'Log In'}
                        </button>
                    </form>
                )}

                {/* Phone OTP Login */}
                {loginMethod === 'phone' && (
                    <form onSubmit={handlePhoneLogin}>
                        <div className="form-group">
                            <label>Phone Number (with country code)</label>
                            <div className="phone-input-group">
                                <input
                                    type="tel"
                                    placeholder="917985815601"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    disabled={otpSent}
                                />
                                {!otpSent && (
                                    <button
                                        type="button"
                                        className="btn-send-otp"
                                        onClick={sendLoginOTP}
                                        disabled={otpLoading || !phone}
                                    >
                                        Send OTP
                                    </button>
                                )}
                            </div>
                        </div>

                        {otpSent && (
                            <div className="otp-verification-box">
                                <div className="form-group">
                                    <label>Enter 6-Digit OTP</label>
                                    <input
                                        type="text"
                                        placeholder="Enter OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength="6"
                                        required
                                    />
                                </div>
                                <button
                                    disabled={loading || !otp}
                                    className="btn-primary"
                                    type="submit"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Login'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-resend"
                                    onClick={() => { setOtpSent(false); setOtp(''); }}
                                >
                                    Change Number
                                </button>
                            </div>
                        )}
                    </form>
                )}

                <div className="auth-footer">
                    Need an account? <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}
