# Exam Tester

A simple exam portal web application built with React where teachers can upload exam PDFs and students can take timed exams with answer submissions.

## Features

### For Teachers
- **Login/Signup** with teacher role
- **Upload Exam PDF** with configurable duration (50-60 minutes default)
- **View Student Submissions** with file downloads
- **Dashboard** to manage exams and track submissions

### For Students
- **Login/Signup** with student role
- **View Active Exam** with countdown timer
- **Timed Exam Session** (auto-redirects when time expires)
- **Submit Answers** by uploading PDF or image files
- **Multiple File Upload** support

## Technical Stack

- **Frontend:** React 18 with functional components and hooks
- **Routing:** React Router v6
- **State Management:** React Context API
- **Styling:** Custom CSS with responsive design
- **File Handling:** Native HTML5 file upload with drag & drop

## Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Navigation component
│   ├── Timer.js           # Countdown timer component
│   └── FileUploader.js    # File upload component with drag & drop
├── contexts/
│   └── AuthContext.js     # Authentication context
├── pages/
│   ├── Login.js           # Login/Signup page
│   ├── TeacherDashboard.js # Teacher dashboard
│   ├── StudentDashboard.js # Student dashboard
│   ├── SubmissionPage.js  # Student answer submission
│   └── ViewSubmissions.js # Teacher submission viewer
├── api/
│   └── examApi.js         # Dummy API functions
├── App.js                 # Main app component with routing
├── App.css               # Global styles
└── index.js              # App entry point
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Usage

### Teacher Workflow
1. **Sign up/Login** as a teacher
2. **Upload Exam PDF** and set duration
3. **View Submissions** from students
4. **Download** student answer files

### Student Workflow
1. **Sign up/Login** as a student
2. **View Active Exam** with timer
3. **Take Exam** within time limit
4. **Submit Answers** by uploading files
5. **Auto-redirect** when time expires

## API Integration

The application uses placeholder API functions in `src/api/examApi.js`. To connect to a real backend:

1. **Replace dummy functions** with actual API calls
2. **Update endpoints** to match your backend
3. **Add authentication headers** as needed
4. **Handle real file uploads** and storage

### API Endpoints (Placeholder)
- `POST /api/login` - User authentication
- `POST /api/signup` - User registration
- `POST /api/upload-exam` - Upload exam PDF
- `GET /api/get-exam` - Get current exam
- `POST /api/submit-answer` - Submit student answers
- `GET /api/get-submissions` - Get all submissions

## Key Features

### Timer Component
- **Real-time countdown** with visual warnings
- **Auto-redirect** when time expires
- **Visual indicators** for time remaining

### File Upload
- **Drag & drop** support
- **Multiple file** selection
- **File validation** (PDF, JPG, PNG)
- **File size** display

### Responsive Design
- **Mobile-friendly** interface
- **Clean, minimal** UI
- **Accessible** form controls

## Customization

### Exam Duration
Default duration is 50-60 minutes. To change:
1. Update `duration` state in `TeacherDashboard.js`
2. Modify timer logic in `Timer.js`

### File Types
Supported file types can be modified in:
- `FileUploader.js` (accept prop)
- `SubmissionPage.js` (file validation)

### Styling
All styles are in `src/App.css` with CSS variables for easy theming.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Real database integration
- PDF viewer component
- Real-time notifications
- Exam scheduling
- Grade management
- Student progress tracking

## License

This project is open source and available under the MIT License.
