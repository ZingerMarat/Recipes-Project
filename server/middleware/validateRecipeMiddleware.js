import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"
import db from "../db/models/index.js"
const { Recipe } = db

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function validateRecipeMiddleware(req, res, next) {
  try {
    const {
      title,
      description,
      ingredients,
      instructions,
      preparationTime,
      cookingTime,
      servings,
    } = req.body
    req.body.ingredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients
    req.body.instructions =
      typeof instructions === "string" ? JSON.parse(instructions) : instructions

    const recipeData = {
      userId: req.userID,
      title,
      description,
      ingredients,
      instructions,
      preparationTime: preparationTime ? parseInt(preparationTime, 10) : null,
      cookingTime: cookingTime ? parseInt(cookingTime, 10) : null,
      servings: servings ? parseInt(servings, 10) : null,
      image: req.file ? `/uploads/recipes/${req.file.filename}` : null,
    }

    const recipe = Recipe.build(recipeData)

    await recipe.validate()

    next()
  } catch (err) {
    if (req.file) {
      const filePath = path.join(__dirname, "../public/uploads/recipes", req.file.filename)
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err)
        }
      })
    }

    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        errors: err.errors.map((e) => ({
          field: e.path,
          message: e.message,
        })),
      })
    }
    next(err)
  }
}
