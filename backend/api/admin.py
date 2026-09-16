from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import IngredientLifespan, Pantry, Recipe, RecipeIngredient, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Profile", {"fields": ("display_name",)}),
    )


@admin.register(IngredientLifespan)
class IngredientLifespanAdmin(admin.ModelAdmin):
    list_display = ("food_category", "storage_zone", "package_state", "typical_days")
    list_filter = ("storage_zone", "package_state")
    search_fields = ("food_category",)


@admin.register(Pantry)
class PantryAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "quantity", "unit", "storage_zone", "expiry_date", "status")
    list_filter = ("storage_zone", "status", "package_state")
    search_fields = ("name", "brand", "barcode")


class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "servings")
    search_fields = ("title",)
    inlines = [RecipeIngredientInline]
