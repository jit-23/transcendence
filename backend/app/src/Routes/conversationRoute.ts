import { Router } from "express";
import {
    createGroupConversation,
    getMyConversations,
    getConversationMessages,
} from "../controllers/conversationController";

const router = Router();

router.post("/group", createGroupConversation);
router.get("/my", getMyConversations);
router.get("/:id/messages", getConversationMessages);

export default router;
