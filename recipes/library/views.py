from rest_framework import filters, viewsets
from django.db.models import Q

from recipes.library.models import Ingredient, Recipe, RecipeList
from recipes.library.serializers import (
    IngredientSerializer,
    RecipeDetailSerializer,
    RecipeListCollectionSerializer,
    RecipeListSerializer,
)


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.prefetch_related("ingredients", "steps").all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "tags"]
    ordering_fields = ["name", "created_at", "prep_time_minutes", "cook_time_minutes"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action in ["list"]:
            return RecipeListSerializer
        return RecipeDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by difficulty
        difficulty = self.request.query_params.get("difficulty", None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        # Filter by tags
        tags = self.request.query_params.get("tags", None)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
            q_objects = Q()
            for tag in tag_list:
                q_objects |= Q(tags__icontains=tag)
            queryset = queryset.filter(q_objects)

        # Filter by max time
        max_time = self.request.query_params.get("max_time", None)
        if max_time:
            try:
                max_time_int = int(max_time)
                queryset = queryset.filter(
                    prep_time_minutes__lte=max_time_int,
                    cook_time_minutes__lte=max_time_int,
                )
            except ValueError:
                pass

        return queryset


class RecipeListViewSet(viewsets.ModelViewSet):
    queryset = RecipeList.objects.prefetch_related("recipes").all()
    serializer_class = RecipeListCollectionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
