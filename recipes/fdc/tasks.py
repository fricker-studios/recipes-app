from celery import shared_task
from constance import config
from django.db.models import F
from django.utils import timezone

from recipes.fdc import get_api
from recipes.fdc.api import FoodDataTypes
from recipes.fdc.models import FoodItem
from recipes.logging import getLogger

logger = getLogger(__name__)


@shared_task
def fetch_food_items():
    api = get_api()
    for data_type_str in config.FDC_ENABLED_DATA_TYPES:
        logger.info(f"Fetching food items for data type: {data_type_str}")
        data_type = FoodDataTypes(data_type_str)
        for instance in api.get_food_list(data_type):
            logger.info(f"Processing food item with FDC ID: {instance.fdcId}")
            FoodItem.objects.update_or_create(
                fdc_id=instance.fdcId,
                defaults=dict(
                    data_type=instance.dataType,
                    description=instance.description,
                    brand_name=instance.brandOwner,
                ),
            )


@shared_task
def fetch_food_detail(fdc_id: int):
    api = get_api()
    logger.info(f"Fetching food detail for FDC ID: {fdc_id}")
    try:
        food_detail = api.get_food_by_fdc_id(fdc_id)
        FoodItem.objects.update_or_create(
            fdc_id=fdc_id,
            defaults=dict(
                detail_fetch_date=timezone.now(),
                detail=food_detail.model_dump(),
            ),
        )
    except Exception as e:
        logger.error(f"Error fetching food detail for FDC ID {fdc_id}: {e}")
        FoodItem.objects.filter(fdc_id=fdc_id).update(error_count=F('error_count') + 1)


@shared_task
def fetch_missing_food_details():
    missing_items = FoodItem.objects.filter(detail__isnull=True, error_count__lte=5)[:1000]
    for item in missing_items:
        logger.info(f"Fetching missing food detail for FDC ID: {item.fdc_id}")
        fetch_food_detail.delay(item.fdc_id)


@shared_task
def fetch_outdated_food_details():
    outdated_items = FoodItem.objects.filter(
        detail_fetch_date__lt=timezone.now()
        - timezone.timedelta(days=config.FDC_DETAIL_EXPIRY_DAYS)
    )[:1000]
    for item in outdated_items:
        logger.info(f"Fetching outdated food detail for FDC ID: {item.fdc_id}")
        fetch_food_detail.delay(item.fdc_id)
