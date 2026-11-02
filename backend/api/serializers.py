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
        extra_kwargs = {
            "user": {"required": False},
        }

    def create(self, validated_data):
        if "user" not in validated_data:
            owner = User.objects.order_by("id").first()
            if owner is None:
                raise serializers.ValidationError({"user": "No user exists to own pantry items."})
            validated_data["user"] = owner
        return super().create(validated_data)


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
