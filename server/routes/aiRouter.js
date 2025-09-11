import express from "express"
import { verifyToken } from "../middleware/auth.js"
import { getRecipeSuggestions } from "../controllers/aiController.js"

const router = express.Router()

router.post("/recipe-suggections", verifyToken, getRecipeSuggestions)

export default router
