import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from '../components/Timer';
import { examAPI, examAttemptAPI, submissionAPI } from '../services/api';

const StudentDashboard = () => {
  const [exam, setExam] = useState(null);
  const [allExams, setAllExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [examsLoading, setExamsLoading] = useState(true);
  const [error, setError] = useState('');
  const [examExpired, setExamExpired] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const navigate = useNavigate();

  // Helper function to get PDF URL from GridFS
  const getPdfUrl = (examFileId) => {
    const baseUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://exam-tester-backend.onrender.com';
    return `${baseUrl}/api/exams/file/${examFileId}`;
  };

  useEffect(() => {
    loadAllExams();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Load user's submissions to check which exams they've attempted
      const submissionsResponse = await submissionAPI.getAllSubmissions();
      if (submissionsResponse.data.success) {
        setSubmissions(submissionsResponse.data.data.submissions || []);
      }
    } catch (error) {
      console.error('Error loading user submissions:', error);
    }
  };

  const loadAllExams = async () => {
    try {
      setExamsLoading(true);
      const response = await examAPI.getExams();
      if (response.data.success) {
        setAllExams(response.data.data.exams || []);
      } else {
        console.error('Failed to load exams:', response.data.message);
        setAllExams([]);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      setAllExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  const attemptExam = async (examId, examTitle) => {
    try {
      setLoading(true);
      setError('');

      // Check if student has already submitted for this exam
      const hasSubmitted = submissions.some(sub => sub.exam.id === examId);
      if (hasSubmitted) {
        setError('You have already attempted this exam. You cannot attempt it twice.');
        setLoading(false);
        return;
      }

      // Start the exam attempt
      const response = await examAttemptAPI.startAttempt(examId);
      if (response.data.success) {
        const attempt = response.data.data.attempt;
        setCurrentAttempt(attempt);

        // Load exam details
        const examResponse = await examAPI.getExam(examId);
        if (examResponse.data.success) {
          setExam({
            id: examResponse.data.data.exam.id,
            title: examResponse.data.data.exam.title,
            examFileId: examResponse.data.data.exam.examFileId,
            duration: examResponse.data.data.exam.duration,
            createdBy: examResponse.data.data.exam.createdBy,
            createdAt: examResponse.data.data.exam.createdAt,
            isActive: true
          });
          setSelectedExamId(examId);
          setShowPdf(true);
          setTimerStarted(true);
        }
      } else {
        setError(response.data.message || 'Failed to start exam attempt');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError('This exam has been cancelled by the teacher and is no longer available.');
        // Refresh the exam list to remove the cancelled exam
        loadAllExams();
      } else {
        setError('Failed to start exam: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    setExamExpired(true);
    // Redirect to submission page after a short delay
    setTimeout(() => {
      navigate('/submission');
    }, 2000);
  };

  const goToSubmission = () => {
    // Pass the selected exam ID to the submission page
    if (selectedExamId) {
      navigate(`/submission?examId=${selectedExamId}`);
    } else {
      navigate('/submission');
    }
  };

  const exitExam = () => {
    const confirmExit = window.confirm('Are you sure you want to exit the exam? Your progress will be saved.');
    if (confirmExit) {
      goToSubmission();
    }
  };

  return (
    <div>
      <h1>Student Dashboard</h1>
      
      {/* Active Exams List Section - Always Show */}
      <div className="card">
        <h2>📚 Available Active Exams</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Choose an exam below to start taking the test. You can only attempt each exam once.
        </p>
        {examsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading available exams...</p>
          </div>
        ) : allExams && allExams.length > 0 ? (
          <div>
            <p style={{ marginBottom: '15px' }}>
              <strong>Active Exams Available ({allExams.length})</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {allExams.map((examItem) => {
                const hasSubmitted = submissions.some(sub => sub.exam.id === examItem.id);
                const isEligible = !hasSubmitted;
                
                return (
                <div key={examItem.id} style={{ 
                  border: `1px solid ${hasSubmitted ? '#dc3545' : '#ddd'}`, 
                  borderRadius: '8px', 
                  padding: '15px', 
                  backgroundColor: hasSubmitted ? '#fff5f5' : '#f8f9fa',
                  transition: 'all 0.3s ease',
                  opacity: isEligible ? 1 : 0.7
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0', color: '#333', fontSize: '16px' }}>
                        {examItem.title}
                      </h4>
                      {hasSubmitted && (
                        <span style={{ 
                          background: '#dc3545', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '12px' 
                        }}>
                          Already Attempted
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                      Exam ID: {examItem.id}
                    </p>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                      <strong>Duration:</strong> {examItem.duration} minutes
                    </p>
                    <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                      <strong>Created:</strong> {new Date(examItem.createdAt).toLocaleDateString()}
                    </p>
        </div>

                  <div style={{ textAlign: 'center' }}>
                    {hasSubmitted ? (
                      <div>
                        <p style={{ 
                          margin: '0 0 10px 0', 
                          fontSize: '14px', 
                          color: '#dc3545',
                          fontWeight: 'bold'
                        }}>
                          ❌ You have attempted this exam before
                        </p>
          <button
                          disabled
            className="btn"
                          style={{ 
                            width: '100%', 
                            fontSize: '14px',
                            backgroundColor: '#6c757d',
                            cursor: 'not-allowed'
                          }}
                        >
                          Already Attempted This Exam
          </button>
                      </div>
                    ) : (
          <button
                        onClick={() => attemptExam(examItem.id, examItem.title)}
                        className="btn"
                        style={{ width: '100%', fontSize: '14px' }}
                        disabled={loading}
                      >
                        {loading ? 'Starting...' : '🎯 Attempt This Exam'}
          </button>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No exams are currently available. Please check back later.</p>
        </div>
        )}
      </div>

      {/* Current Exam Section - Only show when exam is active */}
      {exam && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Current Exam: {exam.title}</h2>
            <button
              onClick={() => {
                setExam(null);
                setSelectedExamId('');
                setShowPdf(false);
                setTimerStarted(false);
                setError('');
                setExamExpired(false);
                setCurrentAttempt(null);
              }}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '4px 8px' }}
            >
              Back to Exam List
            </button>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '20px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}

          {examExpired ? (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '20px', 
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #f5c6cb'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>⏰ Exam Time Expired</h3>
              <p style={{ margin: '0 0 15px 0' }}>
                The exam time has expired. You will be redirected to the submission page.
              </p>
              <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                Redirecting in a few seconds...
              </p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                  <strong>Duration:</strong> {exam.duration} minutes
                </p>
                <p style={{ margin: '0 0 15px 0', color: '#666' }}>
                  <strong>Created by:</strong> {exam.createdBy.name} ({exam.createdBy.email})
                </p>
              </div>

              {showPdf && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4>📄 Exam Paper</h4>
                    <button
                      onClick={() => setShowPdf(false)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      Hide PDF
                    </button>
                  </div>
                  
                  {/* Debug Info */}
                  <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '4px', 
                    marginBottom: '15px',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    <strong>File ID:</strong> {exam.examFileId}<br/>
                    <strong>PDF URL:</strong> {getPdfUrl(exam.examFileId)}
                  </div>
                  
                  {/* PDF Action Buttons */}
                  <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        // Open PDF directly in new tab
                        const newWindow = window.open('', '_blank');
                        newWindow.document.write(`
                          <html>
                            <head>
                              <title>${exam.title} - Exam Paper</title>
                              <style>
                                body { margin: 0; padding: 0; background: #f5f5f5; }
                                iframe { width: 100vw; height: 100vh; border: none; }
                                .error { padding: 20px; text-align: center; background: white; margin: 20px; border-radius: 8px; }
                                .download-btn { 
                                  display: inline-block; 
                                  padding: 10px 20px; 
                                  background: #007bff; 
                                  color: white; 
                                  text-decoration: none; 
                                  border-radius: 4px; 
                                  margin: 10px;
                                }
                              </style>
                            </head>
                            <body>
                              <iframe src="${getPdfUrl(exam.examFileId)}" title="Exam PDF"></iframe>
                              <div class="error" style="display: none;" id="errorDiv">
                                <h3>PDF could not be loaded</h3>
                                <p>Please try refreshing the page or contact your teacher.</p>
                              </div>
                              <script>
                                setTimeout(() => {
                                  const iframe = document.querySelector('iframe');
                                  if (!iframe.contentDocument || iframe.contentDocument.body.innerHTML.includes('error')) {
                                    document.getElementById('errorDiv').style.display = 'block';
                                    iframe.style.display = 'none';
                                  }
                                }, 3000);
                              </script>
                            </body>
                          </html>
                        `);
                        newWindow.document.close();
                      }}
                      className="btn btn-primary"
                      style={{ fontSize: '14px' }}
                    >
                      📖 Open in New Tab
                    </button>
                  </div>

                  {/* PDF Viewer Container */}
                  <div style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    height: '600px',
                    backgroundColor: '#f8f9fa',
                    position: 'relative'
                  }}>
                    {/* Direct PDF viewer */}
                    <iframe
                      src={getPdfUrl(exam.examFileId)}
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                      title="Exam PDF Viewer"
                      onLoad={(e) => {
                        console.log('Direct PDF viewer loaded successfully');
                      }}
                      onError={(e) => {
                        console.log('Direct PDF viewer failed');
                        // Try Google Docs viewer as fallback
                        e.target.src = `https://docs.google.com/viewer?url=${encodeURIComponent(getPdfUrl(exam.examFileId))}&embedded=true`;
                      }}
                    />
                    
                  </div>
                </div>
              )}

              {timerStarted && (
                <Timer
                  duration={exam.duration}
                  onTimeUp={handleTimeUp}
                  examId={exam.id}
                  attemptId={currentAttempt?.id}
                  initialTime={currentAttempt?.timeRemaining}
                />
              )}

              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowPdf(!showPdf)}
                  className="btn"
                  style={{ fontSize: '14px' }}
                >
                  {showPdf ? 'Hide' : 'Show'} Exam Paper
                </button>
                <button
                  onClick={exitExam}
                  className="btn btn-danger"
                  style={{ fontSize: '14px' }}
                >
                  Exit Exam
                </button>
                <button
                  onClick={goToSubmission}
                  className="btn btn-success"
                  style={{ fontSize: '14px' }}
                >
                  Submit Answers
                </button>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => {
            loadAllExams();
            setError('');
          }}
          className="btn btn-secondary"
          disabled={examsLoading}
        >
          {examsLoading ? 'Loading...' : '🔄 Refresh Exam List'}
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;