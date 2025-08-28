import Ajv from "ajv"
import { recipeSchema } from "../models/recipeSchema.js"

const ajv = new Ajv()

const validateRecipe = ajv.compile(recipeSchema)

export function validateRecipeMiddleware(req, res, next) {
  const valid = validateRecipe(req.body)
  if (!valid) {
    return res.status(400).json({
      success: false,
      errors: validateRecipe.errors,
    })
  }
  next()
}
