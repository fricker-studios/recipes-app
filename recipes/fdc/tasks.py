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
    logger.info("Starting fetch_food_items task")
    api = get_api()
    total_processed = 0
    for data_type_str in config.FDC_ENABLED_DATA_TYPES:
        logger.info(f"Fetching food items for data type: {data_type_str}")
        data_type = FoodDataTypes(data_type_str)
        data_type_count = 0
        try:
            for instance in api.get_food_list(data_type):
                logger.debug(f"Processing food item with FDC ID: {instance.fdcId}")
                FoodItem.objects.update_or_create(
                    fdc_id=instance.fdcId,
                    defaults=dict(
                        data_type=instance.dataType,
                        description=instance.description,
                        brand_name=instance.brandOwner,
                    ),
                )
                data_type_count += 1
                total_processed += 1
                if data_type_count % 100 == 0:
                    logger.info(f"Processed {data_type_count} items for {data_type_str}")
            logger.info(f"Completed {data_type_str}: {data_type_count} items processed")
        except Exception as e:
            logger.error(f"Error fetching food items for {data_type_str}: {e}", exc_info=True)
    logger.info(f"fetch_food_items task completed. Total items processed: {total_processed}")


@shared_task
def fetch_food_detail(fdc_id: int):
    api = get_api()
    logger.info(f"Starting fetch_food_detail for FDC ID: {fdc_id}")
    try:
        food_detail = api.get_food_by_fdc_id(fdc_id)
        logger.debug(f"Successfully fetched detail for FDC ID {fdc_id}")
        FoodItem.objects.update_or_create(
            fdc_id=fdc_id,
            defaults=dict(
                detail_fetch_date=timezone.now(),
                detail=food_detail.model_dump(),
            ),
        )
        logger.info(f"Successfully saved detail for FDC ID {fdc_id}")
    except Exception as e:
        logger.error(f"Error fetching food detail for FDC ID {fdc_id}: {e}", exc_info=True)
        updated = FoodItem.objects.filter(fdc_id=fdc_id).update(error_count=F("error_count") + 1)
        if updated:
            logger.warning(f"Incremented error count for FDC ID {fdc_id}")
        else:
            logger.error(f"Failed to update error count for FDC ID {fdc_id} - item may not exist")


@shared_task
def fetch_missing_food_details():
    logger.info("Starting fetch_missing_food_details task")
    missing_items = FoodItem.objects.filter(detail__isnull=True, error_count__lte=5)[
        :1000
    ]
    item_count = len(missing_items)
    logger.info(f"Found {item_count} items with missing details to process")
    for idx, item in enumerate(missing_items, 1):
        logger.debug(f"Queueing fetch for FDC ID: {item.fdc_id} ({idx}/{item_count})")
        fetch_food_detail.delay(item.fdc_id)
    logger.info(f"fetch_missing_food_details completed. Queued {item_count} tasks")


@shared_task
def fetch_outdated_food_details():
    logger.info("Starting fetch_outdated_food_details task")
    expiry_days = config.FDC_DETAIL_EXPIRY_DAYS
    logger.info(f"Using expiry threshold of {expiry_days} days")
    outdated_items = FoodItem.objects.filter(
        detail_fetch_date__lt=timezone.now()
        - timezone.timedelta(days=expiry_days)
    )[:1000]
    item_count = len(outdated_items)
    logger.info(f"Found {item_count} outdated items to refresh")
    for idx, item in enumerate(outdated_items, 1):
        logger.debug(f"Queueing refresh for FDC ID: {item.fdc_id} ({idx}/{item_count})")
        fetch_food_detail.delay(item.fdc_id)
    logger.info(f"fetch_outdated_food_details completed. Queued {item_count} tasks")
