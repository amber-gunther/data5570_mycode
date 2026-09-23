from django.core.management.base import BaseCommand

from api.models import IngredientLifespan, Pantry, PackageState, Recipe, RecipeIngredient, StorageZone, User


class Command(BaseCommand):
    help = "Create the class demo users and one sample pantry item and recipe."

    def handle(self, *args, **options):
        admin, created = User.objects.get_or_create(
            username="amber-gunther",
            defaults={
                "email": "amber.gunther@usu.edu",
                "display_name": "Amber Gunther",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin.is_staff = True
        admin.is_superuser = True
        admin.set_password("RenderRocks!")
        admin.save()
        self.stdout.write("Admin user amber-gunther is ready.")

        test_user, _ = User.objects.get_or_create(
            username="test_user",
            defaults={"email": "test_user@example.com", "display_name": "Test User"},
        )
        test_user.set_password("RenderRocks!")
        test_user.save()
        self.stdout.write("Test user test_user is ready.")

        milk_life, _ = IngredientLifespan.objects.get_or_create(
            food_category="milk",
            storage_zone=StorageZone.FRIDGE,
            package_state=PackageState.UNOPENED,
            defaults={"typical_days": 7, "notes": "Typical refrigerated milk."},
        )

        Pantry.objects.get_or_create(
            user=test_user,
            name="Milk",
            defaults={
                "quantity": "1.00",
                "unit": "gallon",
                "storage_zone": StorageZone.FRIDGE,
                "package_state": PackageState.UNOPENED,
                "food_category": "milk",
                "lifespan": milk_life,
            },
        )
        self.stdout.write("Sample pantry item Milk is ready.")

        recipe, _ = Recipe.objects.get_or_create(
            user=test_user,
            title="Scrambled eggs",
            defaults={"notes": "Weeknight breakfast.", "servings": 2},
        )
        RecipeIngredient.objects.get_or_create(
            recipe=recipe,
            name="eggs",
            defaults={"quantity": "4.00", "unit": "count"},
        )
        RecipeIngredient.objects.get_or_create(
            recipe=recipe,
            name="milk",
            defaults={"quantity": "0.25", "unit": "cup"},
        )
        self.stdout.write("Sample recipe Scrambled eggs is ready.")
