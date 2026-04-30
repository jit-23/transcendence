import { Router } from "express";
import {
    createOrGetDirectConversation,
    createGroupConversation,
    addMembersToGroupConversation,
    deleteGroupConversation,
    getMyConversations,
    getConversationMessages,
    getConversationMembers,
} from "../controllers/conversationController";

const router = Router();

router.post("/group", createGroupConversation);
router.post("/direct", createOrGetDirectConversation);
router.get("/my", getMyConversations);
router.post("/:id/members", addMembersToGroupConversation);
router.get("/:id/members", getConversationMembers);
router.get("/:id/messages", getConversationMessages);
router.delete("/:id", deleteGroupConversation);

export default router;
