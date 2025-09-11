import express from "express"
import { verifyToken } from "../middleware/auth.js"
import {
  addCollection,
  addToCollection,
  getCollections,
} from "../controllers/collectionsController.js"

const router = express.Router()

router.get("/", verifyToken, getCollections)
router.post("/", verifyToken, addCollection)
router.post("/:id/recipes", verifyToken, addToCollection)

export default router
