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
        extra_kwargs = {
            "id": {"read_only": True},
        }


class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(many=True, required=False)

    class Meta:
        model = Recipe
        fields = ["id", "user", "title", "notes", "servings", "created_at", "updated_at", "ingredients"]
        extra_kwargs = {
            "user": {"required": False},
        }

    def _owner(self):
        owner = User.objects.order_by("id").first()
        if owner is None:
            raise serializers.ValidationError({"user": "No user exists to own recipes."})
        return owner

    def create(self, validated_data):
        ingredient_data = validated_data.pop("ingredients", [])
        if "user" not in validated_data:
            validated_data["user"] = self._owner()
        recipe = Recipe.objects.create(**validated_data)
        for line in ingredient_data:
            RecipeIngredient.objects.create(recipe=recipe, **line)
        return recipe

    def update(self, instance, validated_data):
        ingredient_data = validated_data.pop("ingredients", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if ingredient_data is not None:
            instance.ingredients.all().delete()
            for line in ingredient_data:
                RecipeIngredient.objects.create(recipe=instance, **line)
        return instance
