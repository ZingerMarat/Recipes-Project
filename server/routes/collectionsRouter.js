import express from "express"
import { verifyToken } from "../middleware/auth.js"
import { addCollection } from "../controllers/collectionsController.js"

const router = express.Router()

//router.get("/")
router.post("/", verifyToken, addCollection)
//router.post("/:id/recipes")

export default router
