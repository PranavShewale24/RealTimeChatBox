import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  getFriendRequests,
  getFriends,
  getSuggestedUsers,
  rejectFriendRequest,
  sendFriendRequest,
} from "../controllers/friend.controller.js";

const router = express.Router();

router.get("/", protectRoute, getFriends);
router.get("/requests", protectRoute, getFriendRequests);
router.get("/suggestions", protectRoute, getSuggestedUsers);
router.post("/request/:userId", protectRoute, sendFriendRequest);
router.post("/accept/:userId", protectRoute, acceptFriendRequest);
router.post("/reject/:userId", protectRoute, rejectFriendRequest);

export default router;
