import { Router } from "express";
import {
    createOrGetDirectConversation,
    createGroupConversation,
    addMembersToGroupConversation,
    deleteGroupConversation,
    getMyConversations,
    getConversationMessages,
} from "../controllers/conversationController";

const router = Router();

router.post("/group", createGroupConversation);
router.post("/direct", createOrGetDirectConversation);
router.post("/:id/members", addMembersToGroupConversation);
router.get("/my", getMyConversations);
router.get("/:id/messages", getConversationMessages);
router.delete("/:id", deleteGroupConversation);

export default router;
