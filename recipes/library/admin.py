from django.contrib import admin

from recipes.library.models import (
    Ingredient,
    IngredientNutrient,
    Recipe,
    RecipeIngredient,
    RecipeList,
    RecipeStep,
)


class IngredientNutrientInline(admin.TabularInline):
    model = IngredientNutrient
    extra = 1


class IngredientAdmin(admin.ModelAdmin):
    list_display = ["name", "plural_name", "fdc_food_item"]
    search_fields = ["name", "description"]
    inlines = [IngredientNutrientInline]


class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1
    autocomplete_fields = ["ingredient"]


class RecipeStepInline(admin.TabularInline):
    model = RecipeStep
    extra = 1


class RecipeAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "difficulty",
        "prep_time_minutes",
        "cook_time_minutes",
        "servings",
        "created_at",
    ]
    list_filter = ["difficulty", "created_at"]
    search_fields = ["name", "description", "tags"]
    inlines = [RecipeIngredientInline, RecipeStepInline]


class RecipeListAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name", "description"]
    filter_horizontal = ["recipes"]


admin.site.register(Ingredient, IngredientAdmin)
admin.site.register(Recipe, RecipeAdmin)
admin.site.register(RecipeList, RecipeListAdmin)
