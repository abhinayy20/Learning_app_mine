import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_USER_API || 'http://localhost:3002';

const ACADEMIC_COURSES = [
    'Computer Science',
    'Information Technology',
    'Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration',
    'Commerce',
    'Arts',
    'Science',
    'Other'
];

export default function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        passwordConfirm: '',
        fullName: '',
        gender: '',
        dateOfBirth: '',
        phone: '',
        collegeName: '',
        enrolledCourse: '',
        address: '',
        city: '',
        state: '',
        country: ''
    });

    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    const { signup } = useAuth();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function sendOTP() {
        if (!formData.phone) {
            return setError('Please enter your phone number');
        }

        // Ensure phone has country code
        let phone = formData.phone;
        if (!phone.startsWith('+')) {
            phone = '+91' + phone; // Default to India, adjust as needed
        }

        setOtpLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone })
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

    async function verifyOTP() {
        if (!otp) {
            return setError('Please enter the OTP code');
        }

        let phone = formData.phone;
        if (!phone.startsWith('+')) {
            phone = '+91' + phone;
        }

        setOtpLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone, code: otp })
            });

            const data = await response.json();

            if (data.success && data.valid) {
                setPhoneVerified(true);
                alert('Phone number verified successfully!');
                setCurrentStep(2); // Move to next step
            } else {
                setError(data.message || 'Invalid OTP code');
            }
        } catch (err) {
            setError('Failed to verify OTP. Please try again.');
        }

        setOtpLoading(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!phoneVerified) {
            return setError('Please verify your phone number first');
        }

        if (formData.password !== formData.passwordConfirm) {
            return setError('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        try {
            setError('');
            setLoading(true);

            await signup(formData.email, formData.password, {
                username: formData.username,
                full_name: formData.fullName,
                gender: formData.gender,
                date_of_birth: formData.dateOfBirth,
                phone: formData.phone.startsWith('+') ? formData.phone : '+91' + formData.phone,
                college_name: formData.collegeName,
                enrolled_course: formData.enrolledCourse,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                country: formData.country
            });

            navigate('/');
        } catch (err) {
            setError('Failed to create an account: ' + err.message);
        }

        setLoading(false);
    }

    function nextStep() {
        setError('');
        if (currentStep === 1) {
            if (!formData.email || !formData.username || !formData.password || !formData.passwordConfirm || !formData.phone) {
                return setError('Please fill all required fields');
            }
            if (formData.password !== formData.passwordConfirm) {
                return setError('Passwords do not match');
            }
            if (!phoneVerified) {
                return setError('Please verify your phone number');
            }
        }
        setCurrentStep(prev => Math.min(prev + 1, 3));
    }

    function prevStep() {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Create Account</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Account + Phone Verification */}
                    {currentStep === 1 && (
                        <div className="form-step">
                            <h3>Account Information</h3>

                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Choose a username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    name="passwordConfirm"
                                    placeholder="Confirm your password"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number (with country code)</label>
                                <div className="phone-input-group">
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="917985815601"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        disabled={phoneVerified}
                                    />
                                    {!phoneVerified && (
                                        <button
                                            type="button"
                                            className="btn-send-otp"
                                            onClick={sendOTP}
                                            disabled={otpLoading || !formData.phone}
                                        >
                                            {otpSent ? 'Resend OTP' : 'Send OTP'}
                                        </button>
                                    )}
                                    {phoneVerified && (
                                        <span className="verified-badge">✓ Verified</span>
                                    )}
                                </div>
                            </div>

                            {otpSent && !phoneVerified && (
                                <div className="otp-verification-box">
                                    <div className="form-group">
                                        <label>Enter 6-Digit OTP</label>
                                        <input
                                            type="text"
                                            placeholder="Enter OTP"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength="6"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-verify-otp"
                                        onClick={verifyOTP}
                                        disabled={otpLoading || !otp}
                                    >
                                        {otpLoading ? 'Verifying...' : 'Verify OTP'}
                                    </button>
                                </div>
                            )}

                            <button type="button" onClick={nextStep} className="btn-next" disabled={!phoneVerified}>
                                Next
                            </button>
                        </div>
                    )}

                    {/* Step 2: Personal Information */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h3>Personal Information</h3>
                            {/* ... existing step2 fields ... */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} required>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={prevStep} className="btn-prev">Previous</button>
                                <button type="button" onClick={nextStep} className="btn-next">Next</button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Education & Address */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h3>Education & Address</h3>
                            {/* ... existing step3 fields ... */}
                            <div className="form-group">
                                <label>College/University</label>
                                <input type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Academic Course</label>
                                <select name="enrolledCourse" value={formData.enrolledCourse} onChange={handleChange}>
                                    <option value="">Select Course</option>
                                    {ACADEMIC_COURSES.map(course => (
                                        <option key={course} value={course}>{course}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" name="city" value={formData.city} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label>State</label>
                                    <input type="text" name="state" value={formData.state} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Country</label>
                                <input type="text" name="country" value={formData.country} onChange={handleChange} />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={prevStep} className="btn-prev">Previous</button>
                                <button disabled={loading} type="submit" className="btn-submit">
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}
