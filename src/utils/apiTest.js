// API Configuration Test Utility
export const testAPIConfiguration = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'https://exam-tester-backend.onrender.com/api';
  const baseUrl = apiUrl.replace('/api', '');
  
  console.log('🔧 API Configuration:');
  console.log('  Base URL:', baseUrl);
  console.log('  API URL:', apiUrl);
  console.log('  Environment:', process.env.NODE_ENV);
  
  // Test if we're using the correct production URLs
  if (apiUrl.includes('exam-tester-backend.onrender.com')) {
    console.log('✅ Using production Render backend');
  } else if (apiUrl.includes('localhost')) {
    console.log('⚠️  Using localhost - not suitable for production');
  } else {
    console.log('❓ Using unknown API URL:', apiUrl);
  }
  
  return {
    apiUrl,
    baseUrl,
    isProduction: apiUrl.includes('exam-tester-backend.onrender.com')
  };
};

// Call this function in development to verify configuration
if (process.env.NODE_ENV === 'development') {
  testAPIConfiguration();
}
