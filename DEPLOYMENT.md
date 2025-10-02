# Exam Tester Frontend Deployment

## Vercel Deployment Instructions

### 1. Environment Variables
Set the following environment variable in your Vercel dashboard:

```
REACT_APP_API_URL=https://exam-tester-backend.onrender.com/api
```

### 2. Build Configuration
The project is already configured with:
- `vercel.json` for proper routing
- Production build settings
- Static file caching

### 3. Deployment Steps

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `client` folder as the root directory

2. **Set Environment Variables**:
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://exam-tester-backend.onrender.com/api`

3. **Deploy**:
   - Vercel will automatically build and deploy
   - The build command is: `npm run build`
   - Output directory: `build`

### 4. API Endpoints
The frontend is configured to use these Render backend endpoints:

- **Authentication**: `https://exam-tester-backend.onrender.com/api/auth/*`
- **Exams**: `https://exam-tester-backend.onrender.com/api/exams/*`
- **Submissions**: `https://exam-tester-backend.onrender.com/api/submissions/*`
- **Exam Attempts**: `https://exam-tester-backend.onrender.com/api/exam-attempts/*`
- **PDF Files**: `https://exam-tester-backend.onrender.com/api/exams/file/*`

### 5. Verification
After deployment, test these features:
- [ ] User login/signup
- [ ] Teacher exam upload
- [ ] Student exam viewing
- [ ] PDF file loading
- [ ] Answer submission

### 6. Troubleshooting
- If PDFs don't load: Check if Render backend is awake
- If API calls fail: Verify environment variables are set
- If routing fails: Check vercel.json configuration
