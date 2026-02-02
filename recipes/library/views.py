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
from recipes.logging import getLogger

logger = getLogger(__name__)


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
        logger.info("Creating new recipe")
        # Parse JSON strings from FormData
        data = request.data.copy()

        if "ingredients" in data and isinstance(data["ingredients"], str):
            logger.debug("Parsing ingredients from JSON string")
            try:
                data["ingredients"] = json.loads(data["ingredients"])
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON format for ingredients: {e}")
                return Response(
                    {"ingredients": f"Invalid JSON format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if "steps" in data and isinstance(data["steps"], str):
            logger.debug("Parsing steps from JSON string")
            try:
                data["steps"] = json.loads(data["steps"])
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON format for steps: {e}")
                return Response(
                    {"steps": f"Invalid JSON format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        logger.debug(f"Recipe data parsed - ingredients: {len(data.get('ingredients', []))}, steps: {len(data.get('steps', []))}")

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        logger.debug(f"Validated recipe data - ingredients: {len(serializer.validated_data.get('ingredients', []))}, steps: {len(serializer.validated_data.get('steps', []))}")

        self.perform_create(serializer)
        logger.info(f"Recipe created successfully: {serializer.data.get('name')}")
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def update(self, request, *args, **kwargs):
        logger.info(f"Updating recipe with ID: {kwargs.get('pk')}")
        # Parse JSON strings from FormData (same as create)
        data = request.data.copy()

        if "ingredients" in data and isinstance(data["ingredients"], str):
            logger.debug("Parsing ingredients from JSON string")
            try:
                data["ingredients"] = json.loads(data["ingredients"])
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON format for ingredients: {e}")
                return Response(
                    {"ingredients": f"Invalid JSON format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if "steps" in data and isinstance(data["steps"], str):
            logger.debug("Parsing steps from JSON string")
            try:
                data["steps"] = json.loads(data["steps"])
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON format for steps: {e}")
                return Response(
                    {"steps": f"Invalid JSON format: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        logger.debug(f"Updating recipe '{instance.name}' (partial={partial})")
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}

        logger.info(f"Recipe updated successfully: {serializer.data.get('name')}")
        return Response(serializer.data)

    def get_serializer_class(self):
        if self.action in ["list"]:
            logger.debug("Using RecipeListSerializer for list action")
            return RecipeListSerializer
        logger.debug(f"Using RecipeDetailSerializer for action: {self.action}")
        return RecipeDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        filters_applied = []

        # Filter by difficulty
        difficulty = self.request.query_params.get("difficulty", None)
        if difficulty:
            logger.debug(f"Filtering by difficulty: {difficulty}")
            queryset = queryset.filter(difficulty=difficulty)
            filters_applied.append(f"difficulty={difficulty}")

        # Filter by tags
        tags = self.request.query_params.get("tags", None)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
            logger.debug(f"Filtering by tags: {tag_list}")
            q_objects = Q()
            for tag in tag_list:
                q_objects |= Q(tags__icontains=tag)
            queryset = queryset.filter(q_objects)
            filters_applied.append(f"tags={','.join(tag_list)}")

        # Filter by max time
        max_time = self.request.query_params.get("max_time", None)
        if max_time:
            try:
                max_time_int = int(max_time)
                logger.debug(f"Filtering by max time: {max_time_int} minutes")
                queryset = queryset.filter(
                    prep_time_minutes__lte=max_time_int,
                    cook_time_minutes__lte=max_time_int,
                )
                filters_applied.append(f"max_time<={max_time_int}")
            except ValueError:
                logger.warning(f"Invalid max_time value provided: {max_time}")

        if filters_applied:
            logger.info(f"Recipe query filters applied: {', '.join(filters_applied)}")
        else:
            logger.debug("No filters applied to recipe query")

        return queryset


class RecipeListViewSet(viewsets.ModelViewSet):
    queryset = RecipeList.objects.prefetch_related("recipes").all().order_by("name")
    serializer_class = RecipeListCollectionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]
