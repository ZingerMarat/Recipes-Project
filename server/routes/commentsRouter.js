import express from "express"

import { verifyToken } from "../middleware/auth.js"
import { editComment, toggleLike } from "../controllers/commentsController.js"

const router = express.Router()

router.post("/:commentId/like", verifyToken, toggleLike)

router.put("/:commentId", verifyToken, editComment)

export default router
