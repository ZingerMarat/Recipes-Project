import { GoogleGenAI, Type } from "@google/genai"
import db from "../db/models/index.js"
const { Recipe } = db

import dotenv from "dotenv"
dotenv.config()

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
})

const recipeConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      suggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.NUMBER },
          },
          propertyOrdering: ["title", "ingredients", "instructions", "confidence"],
        },
      },
    },
  },
}

const ingredientConfig = {
  responseMimeType: "application/json",
  responseSchema: {
    type: Type.OBJECT,
    properties: {
      substitutions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            substitute: { type: Type.STRING },
            ratio: { type: Type.STRING },
            notes: { type: Type.STRING },
          },
          propertyOrdering: ["substitute", "ratio", "notes"],
        },
      },
    },
  },
}

const model = "gemini-2.0-flash"

export const getRecipeSuggestions = async (req, res, next) => {
  try {
    const { ingredients, dietary_restrictions, cuisine_preference, cooking_time } = req.body
    const prompt = `
                    Generate **3** recipe suggestions based on the following data:

                    - Use only these ingredients: ${ingredients}
                    - Dietary restrictions: ${dietary_restrictions}
                    - Cuisine preference: ${cuisine_preference}
                    - Maximum cooking time: ${cooking_time} minutes
                    `

    const response = await ai.models.generateContent({
      model,
      config: recipeConfig,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    })

    const answer = JSON.parse(response?.text)

    res.status(200).send(answer)
  } catch (err) {
    next(err)
  }
}

export const getIngredientSubstitutions = async (req, res, next) => {
  try {
    const { recipe_id, substitute_ingredient, dietary_need } = req.body

    const recipe = await Recipe.findByPk(recipe_id)

    if (!recipe) {
      return res.status(404).json({ message: "No recipe found with the same id" })
    }

    const ingredients = recipe.ingredients
    const instructions = recipe.instructions

    const prompt = `
                    You are given a recipe (ingredients + instructions).

                    Suggest **3** possible substitutions for only this ingredient**: ${substitute_ingredient}

                    Conditions:
                    - Consider how the substitution affects the rest of the recipe.
                    - All other ingredients must stay unchanged.
                    - Adapt notes and ratio if needed.
                    - Explore these ingredients: ${ingredients}
                    - Explore instructions: ${instructions}
                    - Important information about diet: ${dietary_need}
                    `

    const response = await ai.models.generateContent({
      model,
      config: ingredientConfig,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    })

    const answer = JSON.parse(response?.text)

    res.status(200).send(answer)
  } catch (err) {
    next(err)
  }
}
