export const recipeSchema = {
  type: "object",
  properties: {
    title: { type: "string", minLength: 3, maxLength: 100 },
    description: { type: "string", minLength: 10, maxLength: 500 },
    ingredients: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
    instructions: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
    cookingTime: { type: "integer", minimum: 1 },
    servings: { type: "integer", minimum: 1 },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
    rating: { type: "number", minimum: 0, maximum: 5 },
  },
  required: [
    "title",
    "description",
    "ingredients",
    "instructions",
    "cookingTime",
    "servings",
    "difficulty",
  ],
  additionalProperties: false,
}
