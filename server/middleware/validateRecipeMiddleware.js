import Ajv from "ajv"
import { recipeSchema } from "../models/recipeSchema.js"

const ajv = new Ajv({ coerceTypes: true })

const validateRecipe = ajv.compile(recipeSchema)

export function validateRecipeMiddleware(req, res, next) {
  console.log("Validating recipe:", req.body)

  if (req.body.ingredients && typeof req.body.ingredients === "string") {
    try {
      req.body.ingredients = JSON.parse(req.body.ingredients)
    } catch {}
  }
  if (req.body.instructions && typeof req.body.instructions === "string") {
    try {
      req.body.instructions = JSON.parse(req.body.instructions)
    } catch {}
  }

  const valid = validateRecipe(req.body)
  if (!valid) {
    return res.status(400).json({
      success: false,
      errors: validateRecipe.errors,
    })
  }
  next()
}
