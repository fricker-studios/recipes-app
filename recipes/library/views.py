import json
from rest_framework import filters, viewsets, status
from rest_framework.response import Response
from django.db.models import Q

from recipes.library.models import Ingredient, Recipe, RecipeList
from recipes.library.serializers import (
    IngredientSerializer,
    RecipeDetailSerializer,
    RecipeListCollectionSerializer,
    RecipeListSerializer,
)


class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all().order_by("name")
    serializer_class = IngredientSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = (
        Recipe.objects.prefetch_related("ingredients", "steps").all().order_by("name")
    )
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "tags"]
    ordering_fields = ["name", "created_at", "prep_time_minutes", "cook_time_minutes"]
    ordering = ["-created_at"]

    def create(self, request, *args, **kwargs):
        # Parse JSON strings from FormData
        data = request.data.copy()

        if "ingredients" in data and isinstance(data["ingredients"], str):
            try:
                data["ingredients"] = json.loads(data["ingredients"])
            except json.JSONDecodeError as e:
                return Response(
                    {"ingredients": f"Invalid JSON format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if "steps" in data and isinstance(data["steps"], str):
            try:
                data["steps"] = json.loads(data["steps"])
            except json.JSONDecodeError as e:
                return Response(
                    {"steps": f"Invalid JSON format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Debug logging
        import logging

        logger = logging.getLogger(__name__)
        logger.info(
            f"Recipe create data: ingredients={data.get('ingredients')}, steps={data.get('steps')}"
        )

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        # Debug what validated data looks like
        logger.info(
            f"Validated data: ingredients={serializer.validated_data.get('ingredients')}, steps={serializer.validated_data.get('steps')}"
        )

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def update(self, request, *args, **kwargs):
        # Parse JSON strings from FormData (same as create)
        data = request.data.copy()

        if "ingredients" in data and isinstance(data["ingredients"], str):
            try:
                data["ingredients"] = json.loads(data["ingredients"])
            except json.JSONDecodeError as e:
                return Response(
                    {"ingredients": f"Invalid JSON format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if "steps" in data and isinstance(data["steps"], str):
            try:
                data["steps"] = json.loads(data["steps"])
            except json.JSONDecodeError as e:
                return Response(
                    {"steps": f"Invalid JSON format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

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
    queryset = RecipeList.objects.prefetch_related("recipes").all().order_by("name")
    serializer_class = RecipeListCollectionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
