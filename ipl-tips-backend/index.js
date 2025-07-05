const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const app = express();

dotenv.config();
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:3001",               // local dev
    "https://ipl-tips.vercel.app"          // your Vercel frontend
  ],
  credentials: true, // ⬅️ allow  cookies/session
}));
app.use(express.json());

// Routes
const matchRoutes = require('./routes/matches');
const userRoutes = require('./routes/users');
const tipsRouter = require('./routes/tips');
app.use('/api/matches', matchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tips', tipsRouter);

// Start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log(err));

