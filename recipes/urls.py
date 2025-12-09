from django.conf import settings
from django.contrib import admin
from django.urls import include
from django.urls import path
from rest_framework import routers

from recipes.fdc.views import FoodItemViewSet, FdcSettingsView, FdcTasksView
from recipes.library.views import IngredientViewSet, RecipeListViewSet, RecipeViewSet

router = routers.DefaultRouter()
router.register(r"fdc/food-items", FoodItemViewSet)
router.register(r"library/ingredients", IngredientViewSet)
router.register(r"library/recipes", RecipeViewSet)
router.register(r"library/recipe-lists", RecipeListViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/fdc/settings/", FdcSettingsView.as_view(), name="fdc-settings"),
    path("api/fdc/tasks/", FdcTasksView.as_view(), name="fdc-tasks"),
]

if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
