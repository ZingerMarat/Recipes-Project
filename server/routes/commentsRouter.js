import express from "express"

import { verifyToken } from "../middleware/auth.js"
import { editComment } from "../controllers/commentsController.js"

const router = express.Router()

router.put("/:commentId", verifyToken, editComment)

export default router
