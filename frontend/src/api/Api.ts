import type {
  CreateIngredientRequest,
  CreateRecipeCollectionRequest,
  CreateRecipeRequest,
  FdcFoodItem,
  FdcFoodItemDetail,
  FdcFoodItemsParams,
  FdcSettings,
  Ingredient,
  PaginatedResponse,
  RecipeCollection,
  RecipeDetail,
  RecipeListItem,
  RecipesParams,
} from './types';

export class Api {
  static baseUrl = '/api';
  static endpoints = {
    fdcFoodItems: '/fdc/food-items/',
    fdcFoodItem: (id: number) => `/fdc/food-items/${id}/`,
    fdcSettings: '/fdc/settings/',
    fdcTasks: '/fdc/tasks/',
    ingredients: '/library/ingredients/',
    ingredient: (id: number) => `/library/ingredients/${id}/`,
    recipes: '/library/recipes/',
    recipe: (id: number) => `/library/recipes/${id}/`,
    recipeLists: '/library/recipe-lists/',
    recipeList: (id: number) => `/library/recipe-lists/${id}/`,
  };

  static buildUrl(endpoint: string): string {
    return `${Api.baseUrl}${endpoint}`;
  }

  static async getToken(): Promise<string> {
    const name = 'csrftoken';
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith(`${name}=`)) {
        return trimmedCookie.substring(name.length + 1);
      }
    }

    return '';
  }

  static async getProtectedHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-CSRFToken': await this.getToken(),
    };
  }

  static async getFdcFoodItems(
    options?: FdcFoodItemsParams
  ): Promise<PaginatedResponse<FdcFoodItem>> {
    const url = new URL(Api.buildUrl(Api.endpoints.fdcFoodItems), window.location.origin);

    if (options?.dataType) {
      url.searchParams.append('data_type', options.dataType);
    }

    if (options?.hasIngredient !== undefined) {
      url.searchParams.append('ingredient', options.hasIngredient.toString());
    }

    if (options?.search) {
      url.searchParams.append('search', options.search);
    }

    if (options?.limit !== undefined) {
      url.searchParams.append('limit', options.limit.toString());
    }

    if (options?.offset !== undefined) {
      url.searchParams.append('offset', options.offset.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  static async getFdcFoodItem(id: number): Promise<FdcFoodItemDetail> {
    const response = await fetch(Api.buildUrl(Api.endpoints.fdcFoodItem(id)), {
      method: 'GET',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  static async getFdcSettings(): Promise<FdcSettings> {
    const response = await fetch(Api.buildUrl(Api.endpoints.fdcSettings), {
      method: 'GET',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  static async updateFdcSettings(
    enabledDataTypes?: string[],
    apiKey?: string
  ): Promise<FdcSettings> {
    const body: any = {};
    if (enabledDataTypes !== undefined) {
      body.enabled_data_types = enabledDataTypes;
    }
    if (apiKey !== undefined) {
      body.api_key = apiKey;
    }

    const response = await fetch(Api.buildUrl(Api.endpoints.fdcSettings), {
      method: 'POST',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update settings');
    }

    return response.json();
  }

  static async triggerFdcTask(taskName: string): Promise<{ message: string; task_id: string }> {
    const response = await fetch(Api.buildUrl(Api.endpoints.fdcTasks), {
      method: 'POST',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
      body: JSON.stringify({ task_name: taskName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to trigger task');
    }

    return response.json();
  }

  static async createIngredient(data: CreateIngredientRequest): Promise<Ingredient> {
    const response = await fetch(Api.buildUrl(Api.endpoints.ingredients), {
      method: 'POST',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create ingredient');
    }

    return response.json();
  }

  static async getIngredient(id: number): Promise<Ingredient> {
    const response = await fetch(Api.buildUrl(Api.endpoints.ingredient(id)), {
      method: 'GET',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  static async updateIngredient(id: number, data: Partial<Ingredient>): Promise<Ingredient> {
    const response = await fetch(Api.buildUrl(Api.endpoints.ingredient(id)), {
      method: 'PATCH',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update ingredient');
    }

    return response.json();
  }

  static async deleteIngredient(id: number): Promise<void> {
    const response = await fetch(Api.buildUrl(Api.endpoints.ingredient(id)), {
      method: 'DELETE',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete ingredient');
    }
  }

  static async getIngredients(options?: {
    search?: string;
    ordering?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Ingredient>> {
    const url = new URL(Api.buildUrl(Api.endpoints.ingredients), window.location.origin);

    if (options?.search) {
      url.searchParams.append('search', options.search);
    }

    if (options?.ordering) {
      url.searchParams.append('ordering', options.ordering);
    }

    if (options?.limit !== undefined) {
      url.searchParams.append('limit', options.limit.toString());
    }

    if (options?.offset !== undefined) {
      url.searchParams.append('offset', options.offset.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  // Recipe methods
  static async getRecipes(options?: RecipesParams): Promise<PaginatedResponse<RecipeListItem>> {
    const url = new URL(Api.buildUrl(Api.endpoints.recipes), window.location.origin);

    if (options?.search) {
      url.searchParams.append('search', options.search);
    }

    if (options?.difficulty) {
      url.searchParams.append('difficulty', options.difficulty);
    }

    if (options?.tags) {
      url.searchParams.append('tags', options.tags);
    }

    if (options?.max_time !== undefined) {
      url.searchParams.append('max_time', options.max_time.toString());
    }

    if (options?.ordering) {
      url.searchParams.append('ordering', options.ordering);
    }

    if (options?.limit !== undefined) {
      url.searchParams.append('limit', options.limit.toString());
    }

    if (options?.offset !== undefined) {
      url.searchParams.append('offset', options.offset.toString());
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  static async getRecipe(id: number): Promise<RecipeDetail> {
    const response = await fetch(Api.buildUrl(Api.endpoints.recipe(id)), {
      method: 'GET',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  static async createRecipe(data: CreateRecipeRequest | FormData): Promise<RecipeDetail> {
    const isFormData = data instanceof FormData;
    const headers = isFormData
      ? { 'X-CSRFToken': await this.getToken() }
      : await Api.getProtectedHeaders();

    const response = await fetch(Api.buildUrl(Api.endpoints.recipes), {
      method: 'POST',
      headers,
      credentials: 'include',
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create recipe');
    }

    return response.json();
  }

  static async updateRecipe(id: number, data: CreateRecipeRequest): Promise<RecipeDetail> {
    const response = await fetch(Api.buildUrl(Api.endpoints.recipe(id)), {
      method: 'PUT',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update recipe');
    }

    return response.json();
  }

  static async deleteRecipe(id: number): Promise<void> {
    const response = await fetch(Api.buildUrl(Api.endpoints.recipe(id)), {
      method: 'DELETE',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete recipe');
    }
  }

  // Recipe List methods
  static async getRecipeLists(): Promise<PaginatedResponse<RecipeCollection>> {
    const response = await fetch(Api.buildUrl(Api.endpoints.recipeLists), {
      method: 'GET',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  static async getRecipeList(id: number): Promise<RecipeCollection> {
    const response = await fetch(Api.buildUrl(Api.endpoints.recipeList(id)), {
      method: 'GET',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });
    return response.json();
  }

  static async createRecipeList(data: CreateRecipeCollectionRequest): Promise<RecipeCollection> {
    const response = await fetch(Api.buildUrl(Api.endpoints.recipeLists), {
      method: 'POST',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create recipe list');
    }

    return response.json();
  }

  static async addRecipeToList(listId: number, recipeId: number): Promise<RecipeCollection> {
    const list = await Api.getRecipeList(listId);
    const recipeIds = list.recipes.map((r) => r.id);
    if (!recipeIds.includes(recipeId)) {
      recipeIds.push(recipeId);
    }

    const response = await fetch(Api.buildUrl(Api.endpoints.recipeList(listId)), {
      method: 'PATCH',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
      body: JSON.stringify({ recipes: recipeIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to add recipe to list');
    }

    return response.json();
  }

  static async removeRecipeFromList(listId: number, recipeId: number): Promise<RecipeCollection> {
    const list = await Api.getRecipeList(listId);
    const recipeIds = list.recipes.map((r) => r.id).filter((id) => id !== recipeId);

    const response = await fetch(Api.buildUrl(Api.endpoints.recipeList(listId)), {
      method: 'PATCH',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
      body: JSON.stringify({ recipes: recipeIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove recipe from list');
    }

    return response.json();
  }

  static async updateRecipeList(
    id: number,
    data: CreateRecipeCollectionRequest
  ): Promise<RecipeCollection> {
    const response = await fetch(Api.buildUrl(Api.endpoints.recipeList(id)), {
      method: 'PATCH',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update recipe list');
    }

    return response.json();
  }

  static async deleteRecipeList(id: number): Promise<void> {
    const response = await fetch(Api.buildUrl(Api.endpoints.recipeList(id)), {
      method: 'DELETE',
      headers: await Api.getProtectedHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete recipe list');
    }
  }
}
