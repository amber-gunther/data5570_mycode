from django.http import HttpResponse, JsonResponse
from rest_framework import viewsets

from .models import IngredientLifespan, Pantry, Recipe, User
from .serializers import (
    IngredientLifespanSerializer,
    PantrySerializer,
    RecipeSerializer,
    UserSerializer,
)


def home(_request):
    return HttpResponse(
        """
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>FreshTrack backend</title>
            <style>
              body { font-family: system-ui, sans-serif; margin: 2rem; color: #111; background: #fff; }
              a { color: #0b57d0; }
            </style>
          </head>
          <body>
            <h1>FreshTrack backend is running</h1>
            <p>This is the Django server. Useful URLs:</p>
            <ul>
              <li><a href="/api/health/">/api/health/</a> — JSON health check</li>
              <li><a href="/api/pantry/">/api/pantry/</a> — pantry API</li>
              <li><a href="/api/recipes/">/api/recipes/</a> — recipes API</li>
              <li><a href="/admin/">/admin/</a> — Django admin</li>
            </ul>
          </body>
        </html>
        """,
        content_type="text/html",
    )


def health(_request):
    return JsonResponse({"status": "ok", "service": "freshtrack-backend"})


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer


class IngredientLifespanViewSet(viewsets.ModelViewSet):
    queryset = IngredientLifespan.objects.all()
    serializer_class = IngredientLifespanSerializer


class PantryViewSet(viewsets.ModelViewSet):
    queryset = Pantry.objects.all()
    serializer_class = PantrySerializer


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all().prefetch_related("ingredients")
    serializer_class = RecipeSerializer
