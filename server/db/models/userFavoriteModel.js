import { DataTypes } from "sequelize"

export default (sequelize) => {
  const UserFavorite = sequelize.define(
    "UserFavorite",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      recipeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "recipes",
          key: "id",
        },
        onDelete: "CASCADE",
      },
    },
    {
      tableName: "user_favorites",
      timestamps: true,
      updatedAt: false,
      underscored: false,
    }
  )

  return UserFavorite
}
