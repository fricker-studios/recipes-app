export type FdcDataType = 'Branded' | 'Foundation' | 'Survey (FNDDS)' | 'SR Legacy';

export interface FdcSettings {
  enabled_data_types: string[];
  available_data_types: string[];
  api_key: string;
}

export interface FdcFoodItem {
  id: number;
  fdc_id: number;
  description: string;
  brand_name: string;
  data_type: FdcDataType;
  detail_fetch_date: string | null;
  ingredient: number | null;
}

export interface FdcFoodItemDetail extends FdcFoodItem {
  detail: any | null;
}
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface FdcFoodItemsParams {
  dataType?: FdcDataType;
  hasIngredient?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface IngredientNutrient {
  id?: number;
  nutrient_name: string;
  amount: number;
  grams: number;
}

export interface Ingredient {
  id?: number;
  name: string;
  plural_name?: string;
  description?: string;
  fdc_food_item?: number | null;
  grams_per_cup?: number | null;
  nutrients?: IngredientNutrient[];
}

export interface CreateIngredientRequest {
  name: string;
  plural_name?: string;
  description?: string;
  fdc_food_item?: number;
  grams_per_cup?: number | null;
  nutrients: {
    nutrient_name: string;
    amount: number;
    grams: number;
  }[];
}

// Recipe types
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type RecipeUnit =
  | 'g'
  | 'kg'
  | 'ml'
  | 'l'
  | 'tsp'
  | 'tbsp'
  | 'cup'
  | 'oz'
  | 'lb'
  | 'piece'
  | 'pinch'
  | 'to_taste';

export interface RecipeStep {
  id?: number;
  step_number: number;
  instruction: string;
  time_minutes?: number | null;
}

export interface RecipeIngredient {
  id?: number;
  ingredient: number;
  ingredient_name?: string;
  ingredient_plural_name?: string;
  quantity: number;
  unit: RecipeUnit;
  preparation_note?: string;
  order?: number;
}

export interface RecipeListItem {
  id: number;
  name: string;
  description?: string;
  difficulty: DifficultyLevel;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  total_time_minutes: number;
  servings: number;
  image?: string | null;
  tags?: string;
  ingredient_count: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeDetail extends RecipeListItem {
  source_url?: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface CreateRecipeRequest {
  name: string;
  description?: string;
  difficulty?: DifficultyLevel;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number;
  image?: File | string | null;
  source_url?: string;
  tags?: string;
  ingredients?: Omit<RecipeIngredient, 'id' | 'ingredient_name' | 'ingredient_plural_name'>[];
  steps?: Omit<RecipeStep, 'id'>[];
}

export interface RecipeCollection {
  id: number;
  name: string;
  description?: string;
  recipe_count: number;
  recipes: RecipeListItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateRecipeCollectionRequest {
  name: string;
  description?: string;
}

export interface RecipesParams {
  search?: string;
  difficulty?: DifficultyLevel;
  tags?: string;
  max_time?: number;
  ordering?: string;
  limit?: number;
  offset?: number;
}
