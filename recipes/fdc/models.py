from django.db import models


class FoodItem(models.Model):
    class DataType(models.TextChoices):
        FOUNDATION = "Foundation", "Foundation"
        SR_LEGACY = "SR Legacy", "SR Legacy"
        SURVEY_FNDDS = "Survey (FNDDS)", "Survey (FNDDS)"
        BRANDED = "Branded", "Branded"

    fdc_id = models.IntegerField(unique=True, db_index=True)
    data_type = models.CharField(max_length=20, choices=DataType.choices)
    description = models.CharField(max_length=2000)
    brand_name = models.CharField(max_length=1000, blank=True, null=True)
    detail_fetch_date = models.DateTimeField(blank=True, null=True)
    detail = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.description
