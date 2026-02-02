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
from recipes.logging import getLogger

logger = getLogger(__name__)


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
            logger.debug(f"Using detail serializer for action: {self.action}")
            return FoodItemDetailSerializer(*args, **kwargs)
        logger.debug(f"Using list serializer for action: {self.action}")
        return super().get_serializer(*args, **kwargs)


class FdcSettingsView(APIView):
    """API view for managing FDC settings."""

    def get(self, request):
        """Get current FDC settings."""
        logger.info("Fetching FDC settings")
        return Response(
            {
                "enabled_data_types": config.FDC_ENABLED_DATA_TYPES,
                "available_data_types": [dt.value for dt in FoodDataTypes],
                "api_key": config.FDC_API_KEY,
            }
        )

    def post(self, request):
        """Update FDC settings."""
        logger.info("Updating FDC settings")
        enabled_data_types = request.data.get("enabled_data_types")
        api_key = request.data.get("api_key")

        # Validate and update enabled data types if provided
        if enabled_data_types is not None:
            logger.debug(f"Validating enabled data types: {enabled_data_types}")
            # Validate that all provided data types are valid
            valid_data_types = [dt.value for dt in FoodDataTypes]
            for data_type in enabled_data_types:
                if data_type not in valid_data_types:
                    logger.warning(f"Invalid data type provided: {data_type}")
                    return Response(
                        {"error": f"Invalid data type: {data_type}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Update the config
            config.FDC_ENABLED_DATA_TYPES = enabled_data_types
            logger.info(f"Updated enabled data types to: {enabled_data_types}")

        # Update API key if provided
        if api_key is not None:
            logger.info("Updating FDC API key")
            config.FDC_API_KEY = api_key

        logger.info("FDC settings updated successfully")
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
        logger.info(f"Task trigger request received for: {task_name}")

        if task_name == "fetch_food_items":
            logger.info("Queueing fetch_food_items task")
            task = fetch_food_items.delay()
            logger.info(f"Task queued successfully with ID: {task.id}")
            return Response(
                {
                    "message": "Task 'fetch_food_items' has been queued",
                    "task_id": task.id,
                }
            )
        elif task_name == "fetch_missing_food_details":
            logger.info("Queueing fetch_missing_food_details task")
            task = fetch_missing_food_details.delay()
            logger.info(f"Task queued successfully with ID: {task.id}")
            return Response(
                {
                    "message": "Task 'fetch_missing_food_details' has been queued",
                    "task_id": task.id,
                }
            )
        elif task_name == "fetch_outdated_food_details":
            logger.info("Queueing fetch_outdated_food_details task")
            task = fetch_outdated_food_details.delay()
            logger.info(f"Task queued successfully with ID: {task.id}")
            return Response(
                {
                    "message": "Task 'fetch_outdated_food_details' has been queued",
                    "task_id": task.id,
                }
            )
        else:
            logger.warning(f"Unknown task requested: {task_name}")
            return Response(
                {"error": f"Unknown task: {task_name}"},
                status=status.HTTP_400_BAD_REQUEST,
            )
