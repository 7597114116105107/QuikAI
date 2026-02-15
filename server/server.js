// import express from 'express';
// import cors from 'cors';
// import 'dotenv/config';
// import { clerkMiddleware, requireAuth } from '@clerk/express'
// import aiRouter from './routes/aiRoutes.js';
// import connectCloudinary from './configs/cloudinary.js';
// import userRouter from './routes/userRoutes.js'; 



// const app = express()

// await connectCloudinary()

// app.use(cors())
// app.use(express.json())
// app.use(clerkMiddleware())


// app.get('/', (req, res) => {
//     res.send('Server is Live!!')
// })

// //app.use(requireAuth()) //only loged in user can access this route


// app.use('/api/ai', aiRouter)
// app.use('/api/user', userRouter)

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`)
// })


import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import userRouter from "./routes/userRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";

const app = express();

// Connect Cloudinary
//await connectCloudinary();
connectCloudinary().catch(err => {
  console.error("Cloudinary error:", err);
});


// CORS (IMPORTANT for Clerk cookies)
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true
  })
);

// Body parser
app.use(express.json());

// Clerk middleware (MUST be before routes)
app.use(clerkMiddleware());

// Test route
app.get("/", (req, res) => {
  res.send("Server is Live!!");
});

// Routes
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);


export default app;