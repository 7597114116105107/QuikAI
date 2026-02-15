// import express from "express";
// import cors from "cors";
// import "dotenv/config";
// import { clerkMiddleware } from "@clerk/express";
// import aiRouter from "./routes/aiRoutes.js";
// import userRouter from "./routes/userRoutes.js";
// import connectCloudinary from "./configs/cloudinary.js";

// const app = express();

// // Connect Cloudinary
// //await connectCloudinary();
// connectCloudinary().catch(err => {
//   console.error("Cloudinary error:", err);
// });


// // CORS (IMPORTANT for Clerk cookies)
// app.use(
//   cors({
//     origin: "http://localhost:5173", // frontend URL
//     credentials: true
//   })
// );

// // Body parser
// app.use(express.json());

// // Clerk middleware (MUST be before routes)
// app.use(clerkMiddleware());

// // Test route
// app.get("/", (req, res) => {
//   res.send("Server is Live!!");
// });

// // Routes
// app.use("/api/ai", aiRouter);
// app.use("/api/user", userRouter);


// export default app;




import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import aiRouter from "./routes/aiRoutes.js";
import userRouter from "./routes/userRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";

const app = express();

/**
 * ❗ DO NOT connect services at import time on Vercel
 * Connect lazily when first request hits a route that needs Cloudinary
 */
let cloudinaryConnected = false;
async function ensureCloudinary() {
  if (cloudinaryConnected) return;
  await connectCloudinary();
  cloudinaryConnected = true;
}
// Only run Cloudinary init on API routes that need it (so GET / works without it)
app.use("/api/ai", async (req, res, next) => {
  try {
    await ensureCloudinary();
  } catch (err) {
    console.error("Cloudinary connection failed:", err);
    return res.status(500).json({ error: "Cloudinary init failed" });
  }
  next();
});

// ✅ CORS (supports local + production)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://quikai-server.vercel.app"
    ],
    credentials: true
  })
);

app.use(express.json());

// Clerk middleware
app.use(clerkMiddleware());

// Test route
app.get("/", (req, res) => {
  res.status(200).send("Server is Live!!");
});

// Routes
app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);

// Catch-all error handler so Vercel returns 500 with body instead of FUNCTION_INVOCATION_FAILED
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ❗ NO app.listen() on Vercel
export default app;
