// import express from "express";
// import { auth } from "../middlewares/auth.js";
// import { getUserCreations, getPublishedCreations, toggleLikeCreation } from "../controllers/userController.js";

// const userRouter = express.Router();

// userRouter.get('/get-user-creations', auth, getUserCreations);
// userRouter.get('/get-published-creations', auth, getPublishedCreations);
// userRouter.post('/toggle-like-creations', auth, toggleLikeCreation);//creationId from the body that's why we added post

// export default userRouter

import express from "express";
import { requireAuth } from "@clerk/express";
import {
  getUserCreations,
  getPublishedCreations,
  toggleLikeCreation
} from "../controllers/userController.js";

const userRouter = express.Router();

// Logged-in user only
userRouter.get("/get-user-creations", requireAuth(), getUserCreations);

// Public (no auth needed)
userRouter.get("/get-published-creations", getPublishedCreations);

// Like / Unlike (logged-in user)
userRouter.post("/toggle-like-creations", requireAuth(), toggleLikeCreation);

export default userRouter;
