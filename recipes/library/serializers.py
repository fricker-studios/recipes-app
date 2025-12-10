from rest_framework import serializers

from recipes.library.models import (
    Ingredient,
    IngredientNutrient,
    Recipe,
    RecipeIngredient,
    RecipeList,
    RecipeStep,
)
from recipes.logging import getLogger

logger = getLogger(__name__)

class ProxiedFileField(serializers.FileField):
    """FileField that properly handles X-Forwarded-Host header for proxied requests"""
    
    def to_representation(self, value):
        if not value:
            return None
        
        request = self.context.get('request')
        if request is not None:
            # Get the forwarded host, falling back to the request host
            logger.info("Handling proxied file URL with X-Forwarded-Host")
            logger.info(f"Request META: {request.META}")
            forwarded_host = request.META.get('HTTP_X_FORWARDED_HOST')
            
            if forwarded_host:
                # Manually construct the URL with the forwarded host
                # Always use https since we're behind an SSL-terminating proxy
                return f"https://{forwarded_host}{value.url}"
            else:
                # Fall back to default behavior
                return request.build_absolute_uri(value.url)
        return value.url


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
    image = ProxiedFileField(read_only=True)

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
            "image",
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

    ingredients = RecipeIngredientSerializer(many=True, required=False, read_only=True)
    steps = RecipeStepSerializer(many=True, required=False, read_only=True)
    total_time_minutes = serializers.IntegerField(read_only=True)
    image = ProxiedFileField(read_only=True)

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
            "image",
            "source_url",
            "tags",
            "ingredients",
            "steps",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate(self, data):
        """Preserve ingredients and steps data from initial_data for create/update"""
        # Store the nested data from initial_data since they're marked read_only
        # This allows us to receive them in the API but not validate them as nested serializers
        initial_data = getattr(self, "initial_data", {})
        if "ingredients" in initial_data:
            data["ingredients"] = initial_data["ingredients"]
        if "steps" in initial_data:
            data["steps"] = initial_data["steps"]
        return data

    def create(self, validated_data):
        ingredients_data = validated_data.pop("ingredients", [])
        steps_data = validated_data.pop("steps", [])

        recipe = Recipe.objects.create(**validated_data)

        for ingredient_data in ingredients_data:
            # Handle ingredient - get the Ingredient instance
            ingredient_value = ingredient_data.pop("ingredient")
            if isinstance(ingredient_value, str):
                # Get or create ingredient by name
                ingredient, _ = Ingredient.objects.get_or_create(
                    name=ingredient_value.strip()
                )
            elif isinstance(ingredient_value, int):
                # It's an ID, fetch the instance
                ingredient = Ingredient.objects.get(id=ingredient_value)
            else:
                # It's already an Ingredient instance
                ingredient = ingredient_value

            ingredient_data["ingredient"] = ingredient
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
                # Handle ingredient - get the Ingredient instance (same as create)
                ingredient_value = ingredient_data.pop("ingredient")
                if isinstance(ingredient_value, str):
                    # Get or create ingredient by name
                    ingredient, _ = Ingredient.objects.get_or_create(
                        name=ingredient_value.strip()
                    )
                elif isinstance(ingredient_value, int):
                    # It's an ID, fetch the instance
                    ingredient = Ingredient.objects.get(id=ingredient_value)
                else:
                    # It's already an Ingredient instance
                    ingredient = ingredient_value

                ingredient_data["ingredient"] = ingredient
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

    def update(self, instance, validated_data):
        # Get the recipes data from initial_data if provided
        initial_data = getattr(self, "initial_data", {})
        recipes_data = initial_data.get("recipes", None)

        # Update basic fields
        instance.name = validated_data.get("name", instance.name)
        instance.description = validated_data.get("description", instance.description)
        instance.save()

        # Update recipes if provided
        if recipes_data is not None:
            instance.recipes.set(recipes_data)

        return instance
