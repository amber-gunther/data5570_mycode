from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"users", views.UserViewSet)
router.register(r"lifespans", views.IngredientLifespanViewSet)
router.register(r"pantry", views.PantryViewSet)
router.register(r"recipes", views.RecipeViewSet)

urlpatterns = [
    path("health/", views.health, name="health"),
    path("", include(router.urls)),
]
