import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubmissions } from '../api/examApi';

const AdminDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getSubmissions();
      
      if (result.success) {
        setSubmissions(result.submissions);
      } else {
        setError('Failed to load data: ' + result.error);
      }
    } catch (error) {
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/login');
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Dashboard</h1>
        <div>
          <button onClick={loadData} className="btn btn-secondary" style={{ marginRight: '10px' }}>
            Refresh
          </button>
          <button onClick={goBack} className="btn">
            Back to Login
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      <div className="card">
        <h2>System Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{submissions.length}</h3>
            <p style={{ margin: '0', color: '#666' }}>Total Submissions</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>
              {submissions.length > 0 ? Math.round((submissions.length / (submissions.length + 10)) * 100) : 0}%
            </h3>
            <p style={{ margin: '0', color: '#666' }}>System Activity</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>
              {new Set(submissions.map(s => s.studentEmail)).size}
            </h3>
            <p style={{ margin: '0', color: '#666' }}>Active Students</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>All Submissions</h2>
        
        {submissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
            <p>No submissions found yet.</p>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <p>Total submissions: <strong>{submissions.length}</strong></p>
            </div>

            <ul className="submission-list">
              {submissions.map((submission) => (
                <li key={submission.id} className="submission-item">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                          {submission.studentName}
                        </h4>
                        <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                          {submission.studentEmail}
                        </p>
                        <p style={{ margin: '0', color: '#888', fontSize: '12px' }}>
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
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
                          Exam ID: {submission.examId}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        onClick={() => downloadFile(submission.answerUrl, `answer_${submission.studentName}_${submission.examId}`)}
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
                        📄 Download Answer
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Admin Functions</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={loadData}
            className="btn btn-secondary"
          >
            Refresh Data
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-success"
          >
            Print Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
