import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FileUploader from '../components/FileUploader';
import { submitAnswers, getCurrentExam } from '../api/examApi';
import { examAPI } from '../services/api';

const SubmissionPage = () => {
  const [answerFiles, setAnswerFiles] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const loadExam = useCallback(async () => {
    try {
      const examId = searchParams.get('examId');
      
      if (examId) {
        // Load specific exam by ID
        const response = await examAPI.getExam(examId);
        if (response.data.success) {
          setExam({
            id: response.data.data.exam.id,
            title: response.data.data.exam.title,
            pdfUrl: response.data.data.exam.examPdfUrl,
            duration: response.data.data.exam.duration,
            createdBy: response.data.data.exam.createdBy,
            createdAt: response.data.data.exam.createdAt,
            isActive: true
          });
        }
      } else {
        // Fallback to current exam
        const result = await getCurrentExam();
        if (result.success && result.exam) {
          setExam(result.exam);
        }
      }
    } catch (error) {
      console.error('Error loading exam:', error);
    }
  }, [searchParams]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  const handleFileSelect = (files) => {
    setAnswerFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (answerFiles.length === 0) {
      setMessage('Please select at least one file to submit');
      return;
    }

    if (!exam) {
      setMessage('No exam found');
      return;
    }

    setLoading(true);
    try {
      // Submit only the first file (API expects single file)
      const result = await submitAnswers(answerFiles[0], exam.id);
      
      if (result.success) {
        setMessage('Answers submitted successfully!');
        setSubmitted(true);
        setAnswerFiles([]);
        
        // Redirect to student dashboard after 3 seconds
        setTimeout(() => {
          navigate('/student');
        }, 3000);
      } else {
        setMessage('Submission failed: ' + result.error);
      }
    } catch (error) {
      setMessage('Submission failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate('/student');
  };

  if (submitted) {
    return (
      <div className="card">
        <h2>Submission Successful!</h2>
        <div className="alert alert-success">
          Your answers have been submitted successfully. You will be redirected to the dashboard shortly.
        </div>
        <button onClick={goBack} className="btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1>Submit Your Answers</h1>
      
      {exam && (
        <div className="card">
          <h3>Exam: {exam.title}</h3>
          <p>Please upload your answer files below.</p>
        </div>
      )}

      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <h2>Upload Answer Files</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Answer Files (PDF or Images)</label>
            <FileUploader
              onFilesSelected={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple={true}
              label="Choose Answer Files"
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              type="submit"
              className="btn"
              disabled={loading || answerFiles.length === 0}
              style={{ marginRight: '10px' }}
            >
              {loading ? 'Submitting...' : 'Submit Answers'}
            </button>
            <button
              type="button"
              onClick={goBack}
              className="btn btn-secondary"
            >
              Back to Exam
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Submission Guidelines</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li>You can upload multiple files (PDF or images)</li>
          <li>Accepted formats: PDF, JPG, JPEG, PNG</li>
          <li>Make sure your answers are clearly visible in the uploaded files</li>
          <li>You can only submit once, so double-check your files before submitting</li>
          <li>If you need to make changes, contact your teacher</li>
        </ul>
      </div>

      {answerFiles.length > 0 && (
        <div className="card">
          <h3>Files Ready for Submission</h3>
          <p>You have selected {answerFiles.length} file(s) ready to submit.</p>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <strong>Files:</strong>
            <ul style={{ marginTop: '5px' }}>
              {answerFiles.map((file, index) => (
                <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionPage;
