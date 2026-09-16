from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class StorageZone(models.TextChoices):
    FRIDGE = "fridge", "Fridge"
    FREEZER = "freezer", "Freezer"
    PANTRY = "pantry", "Pantry"
    COUNTER = "counter", "Counter"


class PackageState(models.TextChoices):
    UNOPENED = "unopened", "Unopened"
    OPENED = "opened", "Opened"
    THAWED = "thawed", "Thawed"


class PantryStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    FROZEN = "frozen", "Frozen"
    USED_UP = "used_up", "Used up"
    THROWN_OUT = "thrown_out", "Thrown out"


class User(AbstractUser):
    """Account that owns pantry items and saved recipes."""

    display_name = models.CharField(max_length=120, blank=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.display_name or self.username


class IngredientLifespan(models.Model):
    """Typical shelf life for a food category in a storage zone and package state."""

    food_category = models.CharField(max_length=120)
    storage_zone = models.CharField(max_length=20, choices=StorageZone.choices)
    package_state = models.CharField(
        max_length=20,
        choices=PackageState.choices,
        default=PackageState.UNOPENED,
    )
    typical_days = models.PositiveIntegerField()
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table = "ingredient_lifespans"
        constraints = [
            models.UniqueConstraint(
                fields=["food_category", "storage_zone", "package_state"],
                name="unique_lifespan_lookup",
            ),
        ]
        ordering = ["food_category", "storage_zone", "package_state"]

    def __str__(self):
        return (
            f"{self.food_category} / {self.get_storage_zone_display()} / "
            f"{self.get_package_state_display()} ({self.typical_days} days)"
        )


class Pantry(models.Model):
    """One ingredient currently (or recently) in the kitchen."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pantry_items",
    )
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=120, blank=True)
    barcode = models.CharField(max_length=64, blank=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=40)
    storage_zone = models.CharField(
        max_length=20,
        choices=StorageZone.choices,
        default=StorageZone.PANTRY,
    )
    package_state = models.CharField(
        max_length=20,
        choices=PackageState.choices,
        default=PackageState.UNOPENED,
    )
    expiry_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=PantryStatus.choices,
        default=PantryStatus.ACTIVE,
    )
    is_staple = models.BooleanField(default=False)
    food_category = models.CharField(max_length=120, blank=True)
    lifespan = models.ForeignKey(
        IngredientLifespan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pantry_items",
    )
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pantry"
        verbose_name_plural = "pantry items"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"


class Recipe(models.Model):
    """A saved household recipe."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recipes",
    )
    title = models.CharField(max_length=200)
    notes = models.TextField(blank=True)
    servings = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "recipes"
        ordering = ["title"]

    def __str__(self):
        return self.title


class RecipeIngredient(models.Model):
    """One ingredient line on a recipe (quantity needed to cook it)."""

    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name="ingredients",
    )
    name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=40)

    class Meta:
        db_table = "recipe_ingredients"
        ordering = ["id"]

    def __str__(self):
        return f"{self.quantity} {self.unit} {self.name}"
