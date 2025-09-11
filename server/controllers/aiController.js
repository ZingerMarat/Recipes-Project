import { GoogleGenAI, Type } from "@google/genai"

import dotenv from "dotenv"
dotenv.config()

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
})

const config = {
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
      config,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    })

    const answer = JSON.parse(response?.text)

    res.status(200).send(answer)
  } catch (err) {
    next(err)
  }
}
