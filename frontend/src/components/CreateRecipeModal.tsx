import { useEffect, useState } from 'react';
import { IconAlertCircle, IconPlus, IconTrash, IconUpload } from '@tabler/icons-react';
import {
  ActionIcon,
  Alert,
  Button,
  Divider,
  FileButton,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { Api } from '../api/Api';
import type { DifficultyLevel, Ingredient, RecipeUnit } from '../api/types';

interface CreateRecipeModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface RecipeIngredientForm {
  ingredient: number | string;
  quantity: number;
  unit: RecipeUnit;
  preparation_note: string;
}

interface RecipeStepForm {
  step_number: number;
  instruction: string;
  time_minutes: number | string;
}

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const UNIT_OPTIONS: { value: RecipeUnit; label: string }[] = [
  { value: 'g', label: 'grams (g)' },
  { value: 'kg', label: 'kilograms (kg)' },
  { value: 'ml', label: 'milliliters (ml)' },
  { value: 'l', label: 'liters (l)' },
  { value: 'tsp', label: 'teaspoon' },
  { value: 'tbsp', label: 'tablespoon' },
  { value: 'cup', label: 'cup' },
  { value: 'oz', label: 'ounce' },
  { value: 'lb', label: 'pound' },
  { value: 'piece', label: 'piece' },
  { value: 'pinch', label: 'pinch' },
  { value: 'to_taste', label: 'to taste' },
];

export function CreateRecipeModal({ opened, onClose, onSuccess }: CreateRecipeModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('easy');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number | string>('');
  const [cookTimeMinutes, setCookTimeMinutes] = useState<number | string>('');
  const [servings, setServings] = useState<number | string>(4);
  const [image, setImage] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState('');
  const [tags, setTags] = useState('');
  const [ingredients, setIngredients] = useState<RecipeIngredientForm[]>([]);
  const [steps, setSteps] = useState<RecipeStepForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);

  // Fetch ingredients when modal opens
  useEffect(() => {
    if (opened) {
      const fetchIngredients = async () => {
        setIngredientsLoading(true);
        try {
          const response = await Api.getIngredients({ limit: 1000 });
          setAvailableIngredients(response.results);
        } catch (err) {
          console.error('Failed to fetch ingredients:', err);
        } finally {
          setIngredientsLoading(false);
        }
      };
      fetchIngredients();
    }
  }, [opened]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDifficulty('easy');
    setPrepTimeMinutes('');
    setCookTimeMinutes('');
    setServings(4);
    setImage(null);
    setSourceUrl('');
    setTags('');
    setIngredients([]);
    setSteps([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { ingredient: '', quantity: 1, unit: 'piece', preparation_note: '' },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredientForm, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, { step_number: steps.length + 1, instruction: '', time_minutes: '' }]);
  };

  const removeStep = (index: number) => {
    const updated = steps.filter((_, i) => i !== index);
    // Renumber steps
    updated.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setSteps(updated);
  };

  const updateStep = (index: number, field: keyof RecipeStepForm, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Recipe name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('difficulty', difficulty);
      formData.append('servings', servings.toString());

      if (prepTimeMinutes) {
        formData.append('prep_time_minutes', prepTimeMinutes.toString());
      }
      if (cookTimeMinutes) {
        formData.append('cook_time_minutes', cookTimeMinutes.toString());
      }
      if (image) {
        formData.append('image', image);
      }
      if (sourceUrl) {
        formData.append('source_url', sourceUrl);
      }
      if (tags) {
        formData.append('tags', tags);
      }

      // Add ingredients
      if (ingredients.length > 0) {
        const ingredientsData = ingredients.map((ing) => ({
          ingredient: Number(ing.ingredient),
          quantity: Number(ing.quantity),
          unit: ing.unit,
          preparation_note: ing.preparation_note,
        }));
        formData.append('ingredients', JSON.stringify(ingredientsData));
      }

      // Add steps
      if (steps.length > 0) {
        const stepsData = steps.map((step) => ({
          step_number: step.step_number,
          instruction: step.instruction,
          time_minutes: step.time_minutes ? Number(step.time_minutes) : null,
        }));
        formData.append('steps', JSON.stringify(stepsData));
      }

      await Api.createRecipe(formData);
      handleClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Create Recipe"
      size="xl"
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' },
      }}
    >
      <Stack gap="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <TextInput
          label="Recipe Name"
          placeholder="Enter recipe name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          required
          withAsterisk
        />

        <Textarea
          label="Description"
          placeholder="Describe your recipe"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          minRows={3}
        />

        <Group grow>
          <Select
            label="Difficulty"
            data={DIFFICULTY_OPTIONS}
            value={difficulty}
            onChange={(value) => setDifficulty(value as DifficultyLevel)}
          />
          <NumberInput
            label="Servings"
            placeholder="4"
            value={servings}
            onChange={setServings}
            min={1}
          />
        </Group>

        <Group grow>
          <NumberInput
            label="Prep Time (minutes)"
            placeholder="e.g., 15"
            value={prepTimeMinutes}
            onChange={setPrepTimeMinutes}
            min={0}
          />
          <NumberInput
            label="Cook Time (minutes)"
            placeholder="e.g., 30"
            value={cookTimeMinutes}
            onChange={setCookTimeMinutes}
            min={0}
          />
        </Group>

        <div>
          <Text size="sm" fw={500} mb={5}>
            Recipe Image
          </Text>
          <FileButton onChange={setImage} accept="image/*">
            {(props) => (
              <Button {...props} leftSection={<IconUpload size={16} />} variant="light" fullWidth>
                {image ? image.name : 'Upload Image'}
              </Button>
            )}
          </FileButton>
          {image && (
            <Text size="xs" c="dimmed" mt={5}>
              Selected: {image.name}
            </Text>
          )}
        </div>

        <TextInput
          label="Source URL"
          placeholder="https://example.com/recipe"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.currentTarget.value)}
        />

        <TextInput
          label="Tags"
          placeholder="e.g., vegetarian, quick, italian"
          description="Comma-separated tags"
          value={tags}
          onChange={(e) => setTags(e.currentTarget.value)}
        />

        <Divider label="Ingredients" labelPosition="center" />

        {ingredients.map((ingredient, index) => (
          <Group key={index} align="flex-end" wrap="nowrap">
            <Select
              placeholder="Select ingredient"
              data={availableIngredients.map((ing) => ({
                value: ing.id!.toString(),
                label: ing.name,
              }))}
              value={ingredient.ingredient.toString()}
              onChange={(value) => updateIngredient(index, 'ingredient', value || '')}
              style={{ flex: 2 }}
              searchable
              disabled={ingredientsLoading}
            />
            <NumberInput
              placeholder="Qty"
              value={ingredient.quantity}
              onChange={(value) => updateIngredient(index, 'quantity', value)}
              min={0}
              step={0.25}
              style={{ width: 80 }}
            />
            <Select
              placeholder="Unit"
              data={UNIT_OPTIONS}
              value={ingredient.unit}
              onChange={(value) => updateIngredient(index, 'unit', value)}
              style={{ width: 150 }}
              searchable
            />
            <TextInput
              placeholder="Prep note"
              value={ingredient.preparation_note}
              onChange={(e) => updateIngredient(index, 'preparation_note', e.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <ActionIcon color="red" onClick={() => removeIngredient(index)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}

        <Button
          leftSection={<IconPlus size={16} />}
          variant="light"
          onClick={addIngredient}
          fullWidth
        >
          Add Ingredient
        </Button>

        <Divider label="Steps" labelPosition="center" />

        {steps.map((step, index) => (
          <Group key={index} align="flex-start" wrap="nowrap">
            <Text fw={500} mt={8}>
              {step.step_number}.
            </Text>
            <Textarea
              placeholder="Instruction"
              value={step.instruction}
              onChange={(e) => updateStep(index, 'instruction', e.currentTarget.value)}
              minRows={2}
              style={{ flex: 1 }}
            />
            <NumberInput
              placeholder="Time (min)"
              value={step.time_minutes}
              onChange={(value) => updateStep(index, 'time_minutes', value)}
              min={0}
              style={{ width: 100 }}
            />
            <ActionIcon color="red" onClick={() => removeStep(index)} mt={8}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        ))}

        <Button leftSection={<IconPlus size={16} />} variant="light" onClick={addStep} fullWidth>
          Add Step
        </Button>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Recipe
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
