import express from "express"

import {
  getAllRecipes,
  getRecipe,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  getUsersRecipes,
} from "../controllers/recipesController.js"
import { validateRecipeMiddleware } from "../middleware/validateRecipeMiddleware.js"
import { upload } from "../middleware/upload.js"
import { verifyToken } from "../middleware/auth.js"

const router = express.Router()

router.get("/", getAllRecipes)
//router.get("/stats", getStats)
router.get("/my-recipes", verifyToken, getUsersRecipes)
router.get("/:id", getRecipe)

router.post("/", upload.single("image"), verifyToken, validateRecipeMiddleware, addRecipe)

router.put("/:id", upload.single("image"), verifyToken, validateRecipeMiddleware, updateRecipe)
//router.put("/:id/rating/:rating", updateRating)

router.delete("/:id", verifyToken, deleteRecipe)

export default router
