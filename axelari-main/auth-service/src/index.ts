import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Auth service running on port ${port}`);
});
