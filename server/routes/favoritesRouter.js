import express from "express"
import { verifyToken } from "../middleware/auth.js"
import {
  addToFavorites,
  deleteFromFavorites,
  getFavorites,
} from "../controllers/favoritesController.js"

const router = express.Router()

router.post("/:recipeId", verifyToken, addToFavorites)
router.delete("/:recipeId", verifyToken, deleteFromFavorites)
router.get("/", verifyToken, getFavorites)

export default router
