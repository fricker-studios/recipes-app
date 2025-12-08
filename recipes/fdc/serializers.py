from rest_framework import serializers

from recipes.fdc.models import FoodItem


class FoodItemListSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = [
            "id",
            "fdc_id",
            "description",
            "brand_name",
            "data_type",
            "detail_fetch_date",
            "ingredient",
        ]


class FoodItemDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = [
            "id",
            "fdc_id",
            "description",
            "brand_name",
            "data_type",
            "detail_fetch_date",
            "detail",
            "ingredient",
        ]
