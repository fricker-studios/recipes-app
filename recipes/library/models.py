from django.db import models


class Ingredient(models.Model):
    name = models.CharField(max_length=100, unique=True)
    plural_name = models.CharField(max_length=100, blank=True)
    description = models.CharField(max_length=255, blank=True)
    fdc_food_item = models.OneToOneField(
        "fdc.FoodItem",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="ingredient",
    )
    grams_per_cup = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name


class IngredientNutrient(models.Model):
    class NutrientNames(models.TextChoices):
        CALCIUM = "calcium", "Calcium"
        CARBOHYDRATES = "carbohydrates", "Carbohydrates"
        CHOLESTEROL = "cholesterol", "Cholesterol"
        ENERGY = "energy", "Energy"
        FIBER = "fiber", "Fiber, total dietary"
        FAT = "fat", "Total lipid (fat)"
        IRON = "iron", "Iron, Fe"
        MONOUNSATURATED_FAT = (
            "monounsaturated_fat",
            "Fatty acids, total monounsaturated",
        )
        POLYUNSATURATED_FAT = (
            "polyunsaturated_fat",
            "Fatty acids, total polyunsaturated",
        )
        PROTEIN = "protein", "Protein"
        SATURATED_FAT = "saturated_fat", "Fatty acids, total saturated"
        SODIUM = "sodium", "Sodium, Na"
        SUGARS = "sugars", "Sugars, Total"
        VITAMIN_C = "vitamin_c", "Vitamin C, total ascorbic acid"

    ingredient = models.ForeignKey(
        Ingredient, on_delete=models.CASCADE, related_name="nutrients"
    )
    nutrient_name = models.CharField(max_length=100, choices=NutrientNames.choices)
    amount = models.FloatField()
    grams = models.FloatField(default=100.0)

    def __str__(self):
        return f"{self.nutrient_name} in {self.ingredient.name}"


class Recipe(models.Model):
    class DifficultyLevel(models.TextChoices):
        EASY = "easy", "Easy"
        MEDIUM = "medium", "Medium"
        HARD = "hard", "Hard"

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    difficulty = models.CharField(
        max_length=20, choices=DifficultyLevel.choices, default=DifficultyLevel.EASY
    )
    prep_time_minutes = models.IntegerField(null=True, blank=True)
    cook_time_minutes = models.IntegerField(null=True, blank=True)
    servings = models.IntegerField(default=4)
    image_url = models.URLField(max_length=500, blank=True)
    source_url = models.URLField(max_length=500, blank=True)
    tags = models.CharField(
        max_length=500, blank=True, help_text="Comma-separated tags"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def total_time_minutes(self):
        prep = self.prep_time_minutes or 0
        cook = self.cook_time_minutes or 0
        return prep + cook


class RecipeIngredient(models.Model):
    class Unit(models.TextChoices):
        GRAM = "g", "grams"
        KILOGRAM = "kg", "kilograms"
        MILLILITER = "ml", "milliliters"
        LITER = "l", "liters"
        TEASPOON = "tsp", "teaspoon"
        TABLESPOON = "tbsp", "tablespoon"
        CUP = "cup", "cup"
        OUNCE = "oz", "ounce"
        POUND = "lb", "pound"
        PIECE = "piece", "piece"
        PINCH = "pinch", "pinch"
        TO_TASTE = "to_taste", "to taste"

    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name="ingredients"
    )
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.FloatField()
    unit = models.CharField(max_length=20, choices=Unit.choices)
    preparation_note = models.CharField(
        max_length=200, blank=True, help_text="e.g., 'chopped', 'diced', 'cooked'"
    )
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.quantity} {self.unit} {self.ingredient.name}"


class RecipeStep(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name="steps")
    step_number = models.IntegerField()
    instruction = models.TextField()
    time_minutes = models.IntegerField(null=True, blank=True)

    class Meta:
        ordering = ["step_number"]
        unique_together = ["recipe", "step_number"]

    def __str__(self):
        return f"Step {self.step_number} of {self.recipe.name}"


class RecipeList(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    recipes = models.ManyToManyField(Recipe, related_name="recipe_lists", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
