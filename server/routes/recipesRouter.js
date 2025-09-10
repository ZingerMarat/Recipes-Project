import express from "express"

import {
  getAllRecipes,
  getRecipe,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  getUsersRecipes,
  addComment,
  getCommentsById,
} from "../controllers/recipesController.js"
import { validateRecipeMiddleware } from "../middleware/validateRecipeMiddleware.js"
import { upload } from "../middleware/upload.js"
import { verifyToken } from "../middleware/auth.js"
import { checkRecipeOwnership } from "../middleware/checkRecipeOwnership.js"

const router = express.Router()

router.get("/", getAllRecipes)
router.get("/my-recipes", verifyToken, getUsersRecipes)
router.get("/:id/comments", getCommentsById)
router.get("/:id", getRecipe)

router.post("/", verifyToken, upload.single("image"), validateRecipeMiddleware, addRecipe)
router.post("/:id/comments", verifyToken, addComment)

router.put(
  "/:id",
  verifyToken,
  upload.single("image"),
  checkRecipeOwnership,
  validateRecipeMiddleware,
  updateRecipe
)

//router.get("/stats", getStats)
//router.put("/:id/rating/:rating", updateRating)

router.delete("/:id", verifyToken, checkRecipeOwnership, deleteRecipe)

export default router
