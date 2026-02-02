from enum import Enum
from typing import Generator, Optional

import requests

from recipes.fdc.response_models import (
    AbridgedFoodItem,
    BrandedFoodItem,
    FoundationFoodItem,
    SRLegacyFoodItem,
    SurveyFoodItem,
)
from recipes.logging import getLogger

logger = getLogger(__name__)


class FoodDataTypes(Enum):
    FOUNDATION = "Foundation"
    SR_LEGACY = "SR Legacy"
    SURVEY = "Survey (FNDDS)"
    BRANDED = "Branded"


class FdcApi:
    def __init__(self, api_key: str) -> None:
        self._api_key = api_key
        self.base_url = "https://api.nal.usda.gov/fdc/"

    def get_headers(self) -> dict:
        return {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def get(self, endpoint: str, params: dict) -> dict | list[dict]:
        params["api_key"] = self._api_key
        logger.debug(f"Making API request to {endpoint} with params: {params}")
        try:
            response = requests.get(
                f"{self.base_url}{endpoint}", headers=self.get_headers(), params=params
            )
            response.raise_for_status()
            logger.debug(f"API request successful for {endpoint}")
            return response.json()
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error for {endpoint}: {e}")
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"Request exception for {endpoint}: {e}")
            raise

    def _get_food_list(
        self,
        data_type: Optional[FoodDataTypes] = None,
        page_size: int = 200,
        page_number: int = 1,
    ) -> list[dict]:
        params = {
            "dataType": data_type.value if data_type else None,
            "pageSize": page_size,
            "pageNumber": page_number,
        }
        logger.info(f"Fetching food list page {page_number} for data type: {data_type}")
        result = self.get("v1/foods/list", params)
        if not isinstance(result, list):
            if not result:
                logger.debug(f"No food items found for page {page_number}")
                return []
            logger.error(f"Expected list from API, got {type(result)}")
            raise TypeError(f"Expected list, got {type(result)}")
        logger.info(f"Retrieved {len(result)} food items from page {page_number}")
        return result

    def get_food_list(
        self, data_type: Optional[FoodDataTypes] = None
    ) -> Generator[AbridgedFoodItem, None, None]:
        page_number = 1
        while True:
            food_list = self._get_food_list(
                data_type=data_type, page_number=page_number
            )
            page_number += 1

            if not food_list:
                break
            for food in food_list:
                yield AbridgedFoodItem.create_from_dict(food)

    def get_food_by_fdc_id(self, fdc_id: int):
        logger.info(f"Fetching food details for FDC ID: {fdc_id}")
        food_dict = self.get(f"v1/food/{fdc_id}", {})
        if not isinstance(food_dict, dict):
            logger.error(f"Expected dict from API for FDC ID {fdc_id}, got {type(food_dict)}")
            raise TypeError(f"Expected dict, got {type(food_dict)}")

        data_type = food_dict.get("dataType")
        logger.debug(f"Processing food item with data type: {data_type}")
        if data_type == FoodDataTypes.BRANDED.value:
            return BrandedFoodItem.model_validate(food_dict)
        elif data_type == FoodDataTypes.FOUNDATION.value:
            return FoundationFoodItem.model_validate(food_dict)
        elif data_type == FoodDataTypes.SR_LEGACY.value:
            return SRLegacyFoodItem.model_validate(food_dict)
        elif data_type == FoodDataTypes.SURVEY.value:
            return SurveyFoodItem.model_validate(food_dict)
        else:
            logger.error(f"Unknown data type encountered: {data_type}")
            raise ValueError(f"Unknown data type: {data_type}")
