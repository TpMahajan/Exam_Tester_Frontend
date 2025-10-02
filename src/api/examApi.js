import { examAPI, submissionAPI } from '../services/api';

// Upload exam PDF
export const uploadExam = async (file, title, duration) => {
  try {
    const response = await examAPI.createExam({
      title,
      duration,
      examPdf: file
    });

    if (response.data.success) {
      return {
        success: true,
        examId: response.data.data.exam.id,
        message: 'Exam uploaded successfully'
      };
    } else {
      return { success: false, error: response.data.message || 'Upload failed' };
    }
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error.response?.data?.message || 'Upload failed';
    return { success: false, error: errorMessage };
  }
};

// Get current exam
export const getCurrentExam = async () => {
  try {
    const response = await examAPI.getExams();
    
    if (response.data.success && response.data.data.exams.length > 0) {
      // Get the most recent exam
      const latestExam = response.data.data.exams[0];
      return {
        success: true,
        exam: {
          id: latestExam.id,
          title: latestExam.title,
          pdfUrl: latestExam.examPdfUrl,
          duration: latestExam.duration,
          createdBy: latestExam.createdBy,
          createdAt: latestExam.createdAt,
          isActive: true
        }
      };
    } else {
      return { success: false, error: 'No active exam found' };
    }
  } catch (error) {
    console.error('Get exam error:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch exam';
    return { success: false, error: errorMessage };
  }
};

// Submit student answers
export const submitAnswers = async (file, examId) => {
  try {
    const response = await submissionAPI.submitAnswer({
      examId,
      answerFile: file
    });

    if (response.data.success) {
      return {
        success: true,
        submissionId: response.data.data.submission.id,
        message: 'Answers submitted successfully'
      };
    } else {
      return { success: false, error: response.data.message || 'Submission failed' };
    }
  } catch (error) {
    console.error('Submit error:', error);
    const errorMessage = error.response?.data?.message || 'Submission failed';
    return { success: false, error: errorMessage };
  }
};

// Get all submissions (for teachers)
export const getSubmissions = async (examId = null) => {
  try {
    let response;
    if (examId) {
      response = await submissionAPI.getSubmissions(examId);
    } else {
      response = await submissionAPI.getAllSubmissions();
    }
    
    if (response.data.success) {
      const submissions = examId ? response.data.data.submissions : response.data.data.submissions;
      
      return {
        success: true,
        submissions: (submissions || []).map(submission => ({
          id: submission.id,
          studentName: submission.student?.name || 'Unknown Student',
          studentEmail: submission.student?.email || 'Unknown Email',
          submittedAt: submission.submittedAt,
          answerUrl: submission.answerUrl,
          examId: submission.exam?.id || examId
        }))
      };
    } else {
      return { success: false, error: response.data.message || 'Failed to fetch submissions' };
    }
  } catch (error) {
    console.error('Get submissions error:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch submissions';
    return { success: false, error: errorMessage, submissions: [] };
  }
};

// Check if exam is still active
export const checkExamStatus = async (examId) => {
  try {
    const response = await examAPI.getExam(examId);
    
    if (response.data.success) {
      return {
        success: true,
        isActive: true,
        exam: response.data.data.exam
      };
    } else {
      return { success: false, error: response.data.message || 'Failed to check exam status' };
    }
  } catch (error) {
    console.error('Check exam status error:', error);
    const errorMessage = error.response?.data?.message || 'Failed to check exam status';
    return { success: false, error: errorMessage };
  }
};
