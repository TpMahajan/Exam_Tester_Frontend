import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmissions } from '../api/examApi';

const ViewSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getSubmissions();
      
      if (result.success) {
        setSubmissions(result.submissions || []);
      } else {
        setError('Failed to load submissions: ' + result.error);
        setSubmissions([]);
      }
    } catch (error) {
      setError('Failed to load submissions: ' + error.message);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const downloadFile = (answerUrl, studentName) => {
    // Open the answer file in a new tab
    if (answerUrl) {
      window.open(answerUrl, '_blank');
    } else {
      alert('No answer file available');
    }
  };

  const goBack = () => {
    navigate('/teacher');
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Student Submissions</h1>
        <div>
          <button 
            onClick={loadSubmissions} 
            className="btn btn-secondary" 
            style={{ marginRight: '10px' }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button onClick={goBack} className="btn">
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {submissions && submissions.length === 0 ? (
        <div className="card">
          <h2>No Submissions Yet</h2>
          <p>No students have submitted their answers yet.</p>
        </div>
      ) : submissions && submissions.length > 0 ? (
        <div className="card">
          <h2>All Submissions ({submissions.length})</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <p>Total submissions received: <strong>{submissions.length}</strong></p>
          </div>

          <ul className="submission-list">
            {submissions.map((submission) => (
              <li key={submission.id} className="submission-item">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                        {submission.studentName || 'Unknown Student'}
                      </h4>
                      <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                        {submission.studentEmail || 'Unknown Email'}
                      </p>
                      <p style={{ margin: '0', color: '#888', fontSize: '12px' }}>
                        Submitted: {submission.submittedAt ? formatDate(submission.submittedAt) : 'Unknown Date'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ 
                        background: '#e9ecef', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        color: '#495057'
                      }}>
                        Answer submitted
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <strong>Submitted Answer:</strong>
                    <div style={{ marginTop: '5px' }}>
                      {submission.answerUrl ? (
                        <button
                          onClick={() => downloadFile(submission.answerUrl, submission.studentName)}
                          style={{
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          📄 View Answer
                        </button>
                      ) : (
                        <span style={{ color: '#666', fontSize: '14px' }}>
                          No answer file available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="card">
          <h2>Loading Submissions...</h2>
          <p>Please wait while we fetch the submissions.</p>
        </div>
      )}

      <div className="card">
        <h3>Submission Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{submissions ? submissions.length : 0}</h4>
            <p style={{ margin: '0', color: '#666' }}>Total Submissions</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#28a745' }}>
              {submissions && submissions.length > 0 ? Math.round((submissions.length / (submissions.length + 5)) * 100) : 0}%
            </h4>
            <p style={{ margin: '0', color: '#666' }}>Completion Rate</p>
          </div>
          <div style={{ textAlign: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#ffc107' }}>
              {submissions ? submissions.length : 0}
            </h4>
            <p style={{ margin: '0', color: '#666' }}>Total Answers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubmissions;
