from rest_framework import serializers

from .models import IngredientLifespan, Pantry, Recipe, RecipeIngredient, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "display_name", "email"]


class IngredientLifespanSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngredientLifespan
        fields = "__all__"


class PantrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Pantry
        fields = "__all__"


class RecipeIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeIngredient
        fields = ["id", "name", "quantity", "unit"]


class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(many=True, required=False)

    class Meta:
        model = Recipe
        fields = ["id", "user", "title", "notes", "servings", "created_at", "updated_at", "ingredients"]

    def create(self, validated_data):
        ingredient_data = validated_data.pop("ingredients", [])
        recipe = Recipe.objects.create(**validated_data)
        for line in ingredient_data:
            RecipeIngredient.objects.create(recipe=recipe, **line)
        return recipe
