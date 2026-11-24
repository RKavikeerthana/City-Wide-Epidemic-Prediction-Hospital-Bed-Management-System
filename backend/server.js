import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import doctorRouter from './routes/doctorRoute.js';
import adminRouter from './routes/adminRoute.js';
import mlRoutes from './routes/lstmRoutes.js'; // Import the LSTM routes
import patientRouter from './routes/patientRoute.js';
import alertRouter from './routes/alertRoute.js';
import admissionRouter from './routes/admissionRoute.js';

// Initialize app
const app = express();
const port = process.env.PORT || 4000; // Default backend port (5174 is the admin panel)

// Middleware for JSON parsing
app.use(express.json({ limit: '10mb' })); // Adjust JSON size limit if needed

// Middleware for URL-encoded data parsing
app.use(express.urlencoded({ extended: true }));

// CORS Middleware
// Allow localhost and 127.0.0.1
// 5173 = patient site, 5174 = admin panel
const allowedOrigins = [
  'http://localhost:5173', 'http://127.0.0.1:5173',
  'http://localhost:5174', 'http://127.0.0.1:5174',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the origin
    } else {
      callback(new Error('Not allowed by CORS')); // Reject other origins
    }
  },
  credentials: true // Allow cookies and authorization headers
}));


// Initialize database and Cloudinary
(async () => {
  try {
    await connectDB();
    console.log('Database connected successfully!');
    connectCloudinary();
    console.log('Cloudinary configured successfully!');
  } catch (error) {
    console.error('Error initializing services:', error.message);
    process.exit(1); // Exit the process if services fail
  }
})();

// API endpoints
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/ml', mlRoutes); // Include LSTM routes
app.use('/api/lstm', mlRoutes); // Same routes; the admin ML page calls /api/lstm/*
app.use('/api/alerts', alertRouter);
app.use('/api/admissions', admissionRouter);
app.use('/api/patients', patientRouter);

// Fallback route for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started and listening on PORT: ${port}`);
});
