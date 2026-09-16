from django.contrib import admin
from django.urls import include, path

from api import views as api_views

urlpatterns = [
    path("", api_views.home, name="home"),
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]
