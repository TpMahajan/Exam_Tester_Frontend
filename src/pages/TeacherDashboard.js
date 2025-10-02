import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { uploadExam, getSubmissions } from '../api/examApi';
import { examAPI } from '../services/api';

const TeacherDashboard = () => {
  const [examFile, setExamFile] = useState(null);
  const [examTitle, setExamTitle] = useState('');
  const [duration, setDuration] = useState(50);
  const [submissions, setSubmissions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [submissionsCleared, setSubmissionsCleared] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadSubmissions();
    loadExams();
    checkSubmissionsClearedStatus();
  }, []);

  // Check if submissions should be cleared based on 24-hour rule
  const checkSubmissionsClearedStatus = () => {
    const lastCleared = localStorage.getItem('teacher_submissions_cleared');
    if (lastCleared) {
      const clearedTime = new Date(lastCleared);
      const now = new Date();
      const hoursPassed = (now - clearedTime) / (1000 * 60 * 60);
      
      if (hoursPassed >= 24) {
        setSubmissionsCleared(false);
        localStorage.removeItem('teacher_submissions_cleared');
      } else {
        setSubmissionsCleared(true);
      }
    }
  };

  const loadSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const result = await getSubmissions();
      if (result.success) {
        setSubmissions(result.submissions || []);
      } else {
        console.error('Failed to load submissions:', result.error);
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const loadExams = async () => {
    setExamsLoading(true);
    try {
      const response = await examAPI.getExams();
      if (response.data.success) {
        setExams(response.data.data.exams || []);
      } else {
        console.error('Failed to load exams:', response.data.message);
        setExams([]);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  const handleFileSelect = (files) => {
    setExamFile(files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!examFile) {
      setMessage('Please select an exam file');
      return;
    }

    if (!examTitle.trim()) {
      setMessage('Please enter an exam title');
      return;
    }

    setLoading(true);
    try {
      const result = await uploadExam(examFile, examTitle, duration);
      if (result.success) {
        setMessage('Exam uploaded successfully!');
        setExamFile(null);
        setExamTitle('');
        // Reset file input
        const fileInput = document.getElementById('exam-file-upload');
        if (fileInput) fileInput.value = '';
        // Refresh exams list
        loadExams();
      } else {
        setMessage('Upload failed: ' + result.error);
      }
    } catch (error) {
      setMessage('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewSubmissions = () => {
    navigate('/view-submissions');
  };

  const cancelExam = async (examId, examTitle) => {
    const confirmMessage = `Are you sure you want to cancel the exam "${examTitle}"?\n\nThis action will:\n- Hide the exam from students\n- Students won't be able to attempt it\n- Exam data will be preserved\n- You can reactivate it later if needed`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        const response = await examAPI.cancelExam(examId);
        
        if (response.data.success) {
          setMessage(`Exam "${examTitle}" has been cancelled successfully! It's now hidden from students.`);
          // Refresh exams list
          loadExams();
          // Refresh submissions list
          loadSubmissions();
        } else {
          setMessage('Failed to cancel exam: ' + response.data.message);
        }
      } catch (error) {
        setMessage('Failed to cancel exam: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const clearSubmissions = () => {
    const confirmMessage = `Are you sure you want to clear submissions from the dashboard?\n\nThis action will:\n- Hide all submissions from the dashboard view\n- Submissions will remain in the database\n- They will automatically reappear after 24 hours\n- This helps keep the dashboard clean and organized`;
    
    if (window.confirm(confirmMessage)) {
      setSubmissionsCleared(true);
      localStorage.setItem('teacher_submissions_cleared', new Date().toISOString());
      setMessage('Submissions cleared from dashboard! They will reappear after 24 hours.');
    }
  };

  const activateExam = async (examId, examTitle) => {
    const confirmMessage = `Are you sure you want to reactivate the exam "${examTitle}"?\n\nThis action will:\n- Make the exam visible to students again\n- Students will be able to attempt it\n- Previous submissions will remain`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);
        const response = await examAPI.activateExam(examId);
        
        if (response.data.success) {
          setMessage(`Exam "${examTitle}" has been reactivated successfully! Students can now see it again.`);
          // Refresh exams list
          loadExams();
          // Refresh submissions list
          loadSubmissions();
        } else {
          setMessage('Failed to activate exam: ' + response.data.message);
        }
      } catch (error) {
        setMessage('Failed to activate exam: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <h1>Teacher Dashboard</h1>
      
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {/* Dashboard Summary */}
      <div className="card">
        <h2>Dashboard Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>
              {exams ? exams.length : 0}
            </h3>
            <p style={{ margin: '0', color: '#666' }}>Active Exams</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', background: '#f3e5f5', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#7b1fa2' }}>
              {submissionsCleared ? 'Hidden' : (submissions ? submissions.length : 0)}
            </h3>
            <p style={{ margin: '0', color: '#666' }}>Total Submissions</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', background: '#e8f5e8', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 5px 0', color: '#388e3c' }}>
              {submissionsCleared ? 'Hidden' : (exams && exams.length > 0 ? Math.round((submissions ? submissions.length : 0) / exams.length * 100) : 0) + '%'}
            </h3>
            <p style={{ margin: '0', color: '#666' }}>Avg. Submissions/Exam</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Upload New Exam</h2>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label htmlFor="examTitle">Exam Title</label>
            <input
              type="text"
              id="examTitle"
              value={examTitle}
              onChange={(e) => setExamTitle(e.target.value)}
              placeholder="Enter exam title"
              required
            />
          </div>

          <div className="form-group">
            <label>Exam File (PDF or Image)</label>
            <FileUploader
              onFilesSelected={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple={false}
              label="Choose Exam File"
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration">Exam Duration (minutes)</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min="1"
              max="180"
              required
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={loading || !examFile}
          >
            {loading ? 'Uploading...' : 'Upload Exam'}
          </button>
        </form>
      </div>

        <div className="card">
          <h2>My Active Exams</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={loadExams}
            className="btn btn-secondary"
            disabled={examsLoading}
          >
            {examsLoading ? 'Loading...' : 'Refresh Exams'}
          </button>
        </div>

        {examsLoading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading exams...</p>
          </div>
        ) : exams && exams.length > 0 ? (
          <div>
            <p style={{ marginBottom: '15px' }}>
              <strong>My Active Exams ({exams.length})</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                {exams.map((exam) => (
                  <div key={exam.id} style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h4 style={{ margin: '0', color: '#333', fontSize: '16px' }}>
                        {exam.title}
                      </h4>
                      <span style={{
                        background: '#28a745',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        Active
                      </span>
                    </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                      <strong>Duration:</strong> {exam.duration} minutes
                    </p>
                    <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
                      <strong>Created:</strong> {new Date(exam.createdAt).toLocaleDateString()}
                    </p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#888' }}>
                        <strong>Exam ID:</strong> {exam.id}
                      </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => window.open(`/api/exams/file/${exam.examFileId}`, '_blank')}
                      className="btn"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      📄 View Exam
                    </button>
                    <button
                      onClick={() => {
                        // Filter submissions for this exam
                        const examSubmissions = submissions.filter(sub => sub.examId === exam.id);
                        if (examSubmissions.length > 0) {
                          const submissionList = examSubmissions.map(sub => 
                            `• ${sub.studentName} (${sub.studentEmail})`
                          ).join('\n');
                          alert(`Submissions for "${exam.title}":\n\n${submissionList}\n\nTotal: ${examSubmissions.length} submission(s)`);
                        } else {
                          alert(`No submissions yet for "${exam.title}"`);
                        }
                      }}
                      className="btn btn-success"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      📊 {submissions.filter(sub => sub.examId === exam.id).length} Submissions
                    </button>
                    <button
                      onClick={() => cancelExam(exam.id, exam.title)}
                      className="btn btn-danger"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                      disabled={loading}
                    >
                      🚫 Cancel Exam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>No exams found. Create your first exam using the upload form above.</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Exam Management</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={viewSubmissions}
            className="btn btn-success"
          >
            View All Submissions
          </button>
          <button
            onClick={loadSubmissions}
            className="btn btn-secondary"
            disabled={submissionsLoading}
          >
            {submissionsLoading ? 'Loading...' : 'Refresh Submissions'}
          </button>
        </div>

        {submissionsLoading ? (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>Loading submissions...</p>
          </div>
        ) : submissions && submissions.length > 0 && !submissionsCleared ? (
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>Recent Submissions ({submissions.length})</h3>
              <button
                onClick={clearSubmissions}
                className="btn btn-warning"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                🧹 Clear from Dashboard
              </button>
            </div>
            <ul className="submission-list">
              {submissions.slice(0, 5).map((submission) => (
                <li key={submission.id} className="submission-item">
                  <div>
                    <strong>{submission.studentName}</strong>
                    <br />
                    <small>{submission.studentEmail}</small>
                    <br />
                    <small>Submitted: {new Date(submission.submittedAt).toLocaleString()}</small>
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', color: '#666' }}>
                      Answer submitted
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {submissions.length > 5 && (
              <p style={{ textAlign: 'center', marginTop: '10px' }}>
                <button
                  onClick={viewSubmissions}
                  className="btn btn-secondary"
                >
                  View All {submissions.length} Submissions
                </button>
              </p>
            )}
          </div>
        ) : submissionsCleared ? (
          <div style={{ marginTop: '20px', textAlign: 'center', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h3>📋 Submissions Cleared</h3>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Submissions have been temporarily hidden from the dashboard.
              <br />
              They will automatically reappear after 24 hours.
            </p>
            <button
              onClick={() => {
                setSubmissionsCleared(false);
                localStorage.removeItem('teacher_submissions_cleared');
                setMessage('Submissions restored to dashboard!');
              }}
              className="btn btn-primary"
              style={{ fontSize: '14px' }}
            >
              🔄 Restore Submissions Now
            </button>
          </div>
        ) : (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>No submissions found. Students can submit their answers after completing the exam.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
