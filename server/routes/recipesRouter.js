import express from "express"

import {
  getAllRecipes,
  getRecipe,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  getStats,
} from "../controllers/recipesController.js"
import { validateRecipeMiddleware } from "../middleware/validateRecipeMiddleware.js"

const router = express.Router()

router.get("/", getAllRecipes)
router.get("/stats", getStats)
router.get("/:id", getRecipe)
router.post("/", validateRecipeMiddleware, addRecipe)
router.put("/:id", validateRecipeMiddleware, updateRecipe)
router.delete("/:id", deleteRecipe)

export default router
