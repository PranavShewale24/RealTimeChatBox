import express from "express";
const router=express.Router();
import { protectRoute } from "../middleware/auth.middleware.js";
import {getUsersForSidebar,getMessages,SendMessage} from "../controllers/message.controller.js";

router.get("/users",protectRoute,getUsersForSidebar);
router.get("/:id",protectRoute,getMessages);
router.post("/send/:id",protectRoute,SendMessage);
export default router;