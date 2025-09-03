"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      {
        id: "11111111-1111-1111-1111-111111111111",
        username: "marat",
        email: "marat@example.com",
        password: "hashed_password_1",
        firstName: "Marat",
        lastName: "Zinger",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        username: "anastasia",
        email: "anastasia@example.com",
        password: "hashed_password_2",
        firstName: "Anastasia",
        lastName: "Ivanova",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    await queryInterface.bulkInsert("recipes", [
      {
        id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        title: "Borscht",
        description: "Classic beet soup with sour cream",
        ingredients: JSON.stringify(["beetroot", "potatoes", "cabbage", "sour cream"]),
        instructions: JSON.stringify(["Boil vegetables", "Add beets", "Serve with sour cream"]),
        cookingTime: 60,
        servings: 4,
        difficulty: "medium",
        imageUrl: "/images/borscht.jpg",
        isPublic: true,
        userId: "11111111-1111-1111-1111-111111111111",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "bbbbbbb2-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        title: "Olivier Salad",
        description: "Traditional Russian salad with peas and potatoes",
        ingredients: JSON.stringify(["potatoes", "carrots", "peas", "mayonnaise"]),
        instructions: JSON.stringify(["Boil vegetables", "Chop finely", "Mix with mayo"]),
        cookingTime: 30,
        servings: 6,
        difficulty: "easy",
        imageUrl: "/images/olivier.jpg",
        isPublic: true,
        userId: "11111111-1111-1111-1111-111111111111",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    await queryInterface.bulkInsert("user_favorites", [
      {
        id: 1,
        userId: "22222222-2222-2222-2222-222222222222",
        recipeId: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        createdAt: new Date(),
      },
    ])
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("user_favorites", null, {})
    await queryInterface.bulkDelete("recipes", null, {})
    await queryInterface.bulkDelete("users", null, {})
  },
}
