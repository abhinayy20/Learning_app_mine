import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../CourseLearning.css';

const API_BASE = process.env.REACT_APP_COURSE_API || 'http://localhost:3001';

export default function CourseLearning() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { currentUser, getUserData } = useAuth();
    const userData = getUserData();

    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [clickCount, setClickCount] = useState(0); // Track clicks instead of time
    const REQUIRED_CLICKS = 60; // Need 60 clicks to complete
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCourseAndEnrollment();
    }, [courseId]);

    useEffect(() => {
        if (clickCount >= REQUIRED_CLICKS && !isCompleted) {
            completeCourse();
        }
    }, [clickCount, isCompleted]);

    const fetchCourseAndEnrollment = async () => {
        try {
            const userId = userData?.id || currentUser?.uid;

            // Fetch course details
            const courseResponse = await fetch(`${API_BASE}/api/courses/${courseId}`);
            const courseData = await courseResponse.json();

            if (courseData.success) {
                setCourse(courseData.data);
            }

            // Fetch enrollment
            const enrollmentResponse = await fetch(`${API_BASE}/api/enrollments/me`, {
                headers: {
                    'x-user-id': userId,
                }
            });

            const enrollmentData = await enrollmentResponse.json();

            if (enrollmentData.success) {
                const currentEnrollment = enrollmentData.data.enrollments.find(
                    e => e.courseId._id === courseId
                );

                if (currentEnrollment) {
                    setEnrollment(currentEnrollment);
                    if (currentEnrollment.isCompleted) {
                        setIsCompleted(true);
                    }
                } else {
                    setError('You are not enrolled in this course');
                }
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching course:', err);
            setError('Failed to load course');
            setLoading(false);
        }
    };

    const completeCourse = async () => {
        try {
            const userId = userData?.id || currentUser.uid;

            const response = await fetch(`${API_BASE}/api/enrollments/${enrollment._id}/progress`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId,
                },
                body: JSON.stringify({
                    completedLessons: enrollment.totalLessons
                })
            });

            const data = await response.json();

            if (data.success) {
                setIsCompleted(true);
                setEnrollment(data.data);
            }
        } catch (err) {
            console.error('Error completing course:', err);
        }
    };

    const downloadCertificate = () => {
        // Create certificate HTML
        const certificateHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        margin: 0;
                        padding: 40px;
                        font-family: 'Georgia', serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .certificate {
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 60px;
                        background: white;
                        border: 20px solid #f0f0f0;
                        box-shadow: 0 0 50px rgba(0,0,0,0.3);
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #667eea;
                        padding-bottom: 20px;
                        margin-bottom: 40px;
                    }
                    .title {
                        font-size: 48px;
                        color: #667eea;
                        margin: 0;
                        font-weight: bold;
                    }
                    .subtitle {
                        font-size: 20px;
                        color: #666;
                        margin: 10px 0;
                    }
                    .content {
                        text-align: center;
                        margin: 40px 0;
                    }
                    .awarded-to {
                        font-size: 18px;
                        color: #666;
                        margin-bottom: 10px;
                    }
                    .recipient {
                        font-size: 42px;
                        color: #333;
                        font-weight: bold;
                        margin: 20px 0;
                        text-decoration: underline;
                    }
                    .course-name {
                        font-size: 28px;
                        color: #667eea;
                        margin: 30px 0;
                        font-style: italic;
                    }
                    .completion-text {
                        font-size: 16px;
                        color: #666;
                        line-height: 1.8;
                    }
                    .footer {
                        margin-top: 60px;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                    }
                    .signature {
                        text-align: center;
                    }
                    .signature-line {
                        width: 250px;
                        border-top: 2px solid #333;
                        margin: 10px auto;
                    }
                    .date {
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="header">
                        <h1 class="title">Certificate of Completion</h1>
                        <p class="subtitle">Learning Platform</p>
                    </div>
                    <div class="content">
                        <p class="awarded-to">This certificate is proudly presented to</p>
                        <h2 class="recipient">${userData?.full_name || userData?.username || currentUser.email}</h2>
                        <p class="awarded-to">for successfully completing</p>
                        <h3 class="course-name">"${course?.title}"</h3>
                        <p class="completion-text">
                            This achievement demonstrates dedication to continuous learning<br/>
                            and professional development in the field of study.
                        </p>
                    </div>
                    <div class="footer">
                        <div class="signature">
                            <div class="signature-line"></div>
                            <p>Instructor Signature</p>
                        </div>
                        <div class="date">
                            <p>Date: ${new Date().toLocaleDateString()}</p>
                            <p>Certificate ID: ${enrollment?._id?.slice(-8)?.toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Create blob and download
        const blob = new Blob([certificateHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate-${course?.title?.replace(/\s+/g, '-')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        alert('Certificate downloaded! Open the HTML file in your browser to view and print.');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="loading">Loading course...</div>;
    if (error) return (
        <div className="error-page">
            <h2>{error}</h2>
            <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
    );
    if (!course) return null;

    return (
        <div className="course-learning">
            <div className="learning-header">
                <Link to="/dashboard" className="back-button">← Back to Dashboard</Link>
                <h1>{course.title}</h1>
            </div>

            <div className="learning-container">
                {!isCompleted ? (
                    <div className="timer-section">
                        <h2>Complete the Course</h2>
                        <p className="instruction-text">
                            Click the button below <strong>{REQUIRED_CLICKS} times</strong> to complete this course!
                        </p>
                        <div className="timer-display">
                            <div className="timer-circle">
                                <svg width="200" height="200">
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="90"
                                        fill="none"
                                        stroke="#e0e0e0"
                                        strokeWidth="10"
                                    />
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="90"
                                        fill="none"
                                        stroke="#667eea"
                                        strokeWidth="10"
                                        strokeDasharray={`${(clickCount / REQUIRED_CLICKS) * 565} 565`}
                                        strokeDashoffset="0"
                                        transform="rotate(-90 100 100)"
                                        style={{ transition: 'stroke-dasharray 0.3s ease' }}
                                    />
                                </svg>
                                <div className="timer-text">
                                    <div className="click-count">{clickCount}</div>
                                    <div className="click-label">/ {REQUIRED_CLICKS} clicks</div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="learn-button"
                            onClick={() => setClickCount(prev => prev + 1)}
                            disabled={clickCount >= REQUIRED_CLICKS}
                        >
                            {clickCount >= REQUIRED_CLICKS ? '✓ Completed!' : '🎯 Click to Learn!'}
                        </button>

                        <div className="progress-info">
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${(clickCount / REQUIRED_CLICKS) * 100}%` }}
                                ></div>
                            </div>
                            <p className="progress-text">
                                {REQUIRED_CLICKS - clickCount} clicks remaining
                            </p>
                        </div>

                        <div className="course-info">
                            <p><strong>📚 Course:</strong> {course.title}</p>
                            <p><strong>👤 Instructor:</strong> {course.instructor}</p>
                            <p><strong>⏱️ Duration:</strong> {course.duration} hours</p>
                            <p><strong>📊 Level:</strong> {course.level}</p>
                        </div>
                    </div>
                ) : (
                    <div className="completion-section">
                        <div className="success-animation">🎉</div>
                        <h2>Congratulations!</h2>
                        <p className="completion-message">
                            You have successfully completed <strong>{course.title}</strong>
                        </p>
                        <div className="certificate-preview">
                            <h3>Certificate of Completion</h3>
                            <p>Awarded to: <strong>{userData?.full_name || userData?.username || currentUser.email}</strong></p>
                            <p>Course: <strong>{course.title}</strong></p>
                            <p>Date: <strong>{new Date().toLocaleDateString()}</strong></p>
                        </div>
                        <div className="completion-actions">
                            <button onClick={downloadCertificate} className="btn-download">
                                📥 Download Certificate
                            </button>
                            <Link to="/dashboard" className="btn-secondary">
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
