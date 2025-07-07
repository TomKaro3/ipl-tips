const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();
dotenv.config();

// When running behind a reverse proxy (e.g. Vercel), trust the first proxy
// so secure cookies are correctly recognized.
app.set('trust proxy', 1);

// Allow JSON parsing first
app.use(express.json());

// ✅ CORS must come after express.json, before session
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://ipl-tips.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed from this origin"));
    }
  },
  credentials: true
}));

// ✅ Sessions (after CORS)
app.use(session({
  name: "ipl.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

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
