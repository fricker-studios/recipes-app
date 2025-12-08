from rest_framework import serializers

from recipes.library.models import (
    Ingredient,
    IngredientNutrient,
    Recipe,
    RecipeIngredient,
    RecipeList,
    RecipeStep,
)


class IngredientNutrientSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngredientNutrient
        fields = ["id", "nutrient_name", "amount", "grams"]
        read_only_fields = ["id"]


class IngredientSerializer(serializers.ModelSerializer):
    nutrients = IngredientNutrientSerializer(many=True, required=False)

    class Meta:
        model = Ingredient
        fields = [
            "id",
            "name",
            "plural_name",
            "description",
            "fdc_food_item",
            "grams_per_cup",
            "nutrients",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        nutrients_data = validated_data.pop("nutrients", [])
        ingredient = Ingredient.objects.create(**validated_data)

        for nutrient_data in nutrients_data:
            IngredientNutrient.objects.create(ingredient=ingredient, **nutrient_data)

        return ingredient

    def update(self, instance, validated_data):
        nutrients_data = validated_data.pop("nutrients", None)

        # Update ingredient fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update nutrients if provided
        if nutrients_data is not None:
            # Delete existing nutrients and create new ones
            instance.nutrients.all().delete()
            for nutrient_data in nutrients_data:
                IngredientNutrient.objects.create(ingredient=instance, **nutrient_data)

        return instance


class RecipeStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeStep
        fields = ["id", "step_number", "instruction", "time_minutes"]
        read_only_fields = ["id"]


class RecipeIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source="ingredient.name", read_only=True)
    ingredient_plural_name = serializers.CharField(
        source="ingredient.plural_name", read_only=True
    )

    class Meta:
        model = RecipeIngredient
        fields = [
            "id",
            "ingredient",
            "ingredient_name",
            "ingredient_plural_name",
            "quantity",
            "unit",
            "preparation_note",
            "order",
        ]
        read_only_fields = ["id", "ingredient_name", "ingredient_plural_name"]


class RecipeListSerializer(serializers.ModelSerializer):
    """List view serializer with minimal recipe data"""

    total_time_minutes = serializers.IntegerField(read_only=True)
    ingredient_count = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = [
            "id",
            "name",
            "description",
            "difficulty",
            "prep_time_minutes",
            "cook_time_minutes",
            "total_time_minutes",
            "servings",
            "image_url",
            "tags",
            "ingredient_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_ingredient_count(self, obj):
        return obj.ingredients.count()


class RecipeDetailSerializer(serializers.ModelSerializer):
    """Detail view serializer with full nested data"""

    ingredients = RecipeIngredientSerializer(many=True, required=False)
    steps = RecipeStepSerializer(many=True, required=False)
    total_time_minutes = serializers.IntegerField(read_only=True)

    class Meta:
        model = Recipe
        fields = [
            "id",
            "name",
            "description",
            "difficulty",
            "prep_time_minutes",
            "cook_time_minutes",
            "total_time_minutes",
            "servings",
            "image_url",
            "source_url",
            "tags",
            "ingredients",
            "steps",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        ingredients_data = validated_data.pop("ingredients", [])
        steps_data = validated_data.pop("steps", [])

        recipe = Recipe.objects.create(**validated_data)

        for ingredient_data in ingredients_data:
            RecipeIngredient.objects.create(recipe=recipe, **ingredient_data)

        for step_data in steps_data:
            RecipeStep.objects.create(recipe=recipe, **step_data)

        return recipe

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop("ingredients", None)
        steps_data = validated_data.pop("steps", None)

        # Update recipe fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update ingredients if provided
        if ingredients_data is not None:
            instance.ingredients.all().delete()
            for ingredient_data in ingredients_data:
                RecipeIngredient.objects.create(recipe=instance, **ingredient_data)

        # Update steps if provided
        if steps_data is not None:
            instance.steps.all().delete()
            for step_data in steps_data:
                RecipeStep.objects.create(recipe=instance, **step_data)

        return instance


class RecipeListCollectionSerializer(serializers.ModelSerializer):
    """Serializer for recipe collections/lists"""

    recipe_count = serializers.SerializerMethodField()
    recipes = RecipeListSerializer(many=True, read_only=True)

    class Meta:
        model = RecipeList
        fields = [
            "id",
            "name",
            "description",
            "recipe_count",
            "recipes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_recipe_count(self, obj):
        return obj.recipes.count()
