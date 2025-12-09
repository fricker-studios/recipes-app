from constance import config
from django_filters import rest_framework as filters
from rest_framework import status
from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from recipes.fdc.api import FoodDataTypes
from recipes.fdc.models import FoodItem
from recipes.fdc.serializers import FoodItemDetailSerializer, FoodItemListSerializer
from recipes.fdc.tasks import (
    fetch_food_items,
    fetch_missing_food_details,
    fetch_outdated_food_details,
)


class FoodItemFilter(filters.FilterSet):
    ingredient = filters.BooleanFilter(
        field_name="ingredient", lookup_expr="isnull", exclude=True
    )

    class Meta:
        model = FoodItem
        fields = ["data_type", "ingredient"]


class FoodItemViewSet(viewsets.ModelViewSet):
    queryset = FoodItem.objects.all().order_by("description")
    serializer_class = FoodItemListSerializer
    filterset_class = FoodItemFilter
    filter_backends = [filters.DjangoFilterBackend, SearchFilter]
    search_fields = ["description"]

    def get_serializer(self, *args, **kwargs):
        if self.action == "retrieve":
            return FoodItemDetailSerializer(*args, **kwargs)
        return super().get_serializer(*args, **kwargs)


class FdcSettingsView(APIView):
    """API view for managing FDC settings."""

    def get(self, request):
        """Get current FDC settings."""
        return Response(
            {
                "enabled_data_types": config.FDC_ENABLED_DATA_TYPES,
                "available_data_types": [dt.value for dt in FoodDataTypes],
                "api_key": config.FDC_API_KEY,
            }
        )

    def post(self, request):
        """Update FDC settings."""
        enabled_data_types = request.data.get("enabled_data_types")
        api_key = request.data.get("api_key")

        # Validate and update enabled data types if provided
        if enabled_data_types is not None:
            # Validate that all provided data types are valid
            valid_data_types = [dt.value for dt in FoodDataTypes]
            for data_type in enabled_data_types:
                if data_type not in valid_data_types:
                    return Response(
                        {"error": f"Invalid data type: {data_type}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Update the config
            config.FDC_ENABLED_DATA_TYPES = enabled_data_types

        # Update API key if provided
        if api_key is not None:
            config.FDC_API_KEY = api_key

        return Response(
            {
                "enabled_data_types": config.FDC_ENABLED_DATA_TYPES,
                "api_key": config.FDC_API_KEY,
                "message": "Settings updated successfully",
            }
        )


class FdcTasksView(APIView):
    """API view for triggering FDC background tasks."""

    def post(self, request):
        """Trigger an FDC task."""
        task_name = request.data.get("task_name")

        if task_name == "fetch_food_items":
            task = fetch_food_items.delay()
            return Response(
                {
                    "message": "Task 'fetch_food_items' has been queued",
                    "task_id": task.id,
                }
            )
        elif task_name == "fetch_missing_food_details":
            task = fetch_missing_food_details.delay()
            return Response(
                {
                    "message": "Task 'fetch_missing_food_details' has been queued",
                    "task_id": task.id,
                }
            )
        elif task_name == "fetch_outdated_food_details":
            task = fetch_outdated_food_details.delay()
            return Response(
                {
                    "message": "Task 'fetch_outdated_food_details' has been queued",
                    "task_id": task.id,
                }
            )
        else:
            return Response(
                {"error": f"Unknown task: {task_name}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
