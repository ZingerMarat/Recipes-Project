import express from "express"
import { verifyToken } from "../middleware/auth.js"
import { getRecipeSuggestions, getIngredientSubstitutions } from "../controllers/aiController.js"

const router = express.Router()

router.post("/recipe-suggections", verifyToken, getRecipeSuggestions)
router.post("/ingredient-substitutions", verifyToken, getIngredientSubstitutions)

export default router
