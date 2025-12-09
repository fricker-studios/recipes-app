import { useEffect, useState } from 'react';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconChefHat,
  IconClock,
  IconDeviceFloppy,
  IconDots,
  IconEdit,
  IconExternalLink,
  IconPlus,
  IconTrash,
  IconUpload,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Divider,
  FileButton,
  Grid,
  Group,
  Image,
  List,
  Loader,
  Menu,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { Api } from '../api/Api';
import type { DifficultyLevel, Ingredient, RecipeUnit } from '../api/types';
import { useRecipe } from '../hooks/useRecipe';

interface RecipeIngredientForm {
  id?: number;
  ingredient: number | string;
  quantity: number;
  unit: RecipeUnit;
  preparation_note: string;
  order: number;
}

interface RecipeStepForm {
  id?: number;
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

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'green',
  medium: 'yellow',
  hard: 'red',
};

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useRecipe(id ? parseInt(id, 10) : null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<DifficultyLevel>('easy');
  const [editPrepTimeMinutes, setEditPrepTimeMinutes] = useState<number | string>('');
  const [editCookTimeMinutes, setEditCookTimeMinutes] = useState<number | string>('');
  const [editServings, setEditServings] = useState<number | string>(4);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editSourceUrl, setEditSourceUrl] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editIngredients, setEditIngredients] = useState<RecipeIngredientForm[]>([]);
  const [editSteps, setEditSteps] = useState<RecipeStepForm[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load form data when entering edit mode or when data changes
  useEffect(() => {
    if (data) {
      setEditName(data.name);
      setEditDescription(data.description || '');
      setEditDifficulty(data.difficulty);
      setEditPrepTimeMinutes(data.prep_time_minutes || '');
      setEditCookTimeMinutes(data.cook_time_minutes || '');
      setEditServings(data.servings);
      setEditSourceUrl(data.source_url || '');
      setEditTags(data.tags || '');
      setEditIngredients(
        data.ingredients.map((ing) => ({
          id: ing.id,
          ingredient: ing.ingredient,
          quantity: ing.quantity,
          unit: ing.unit,
          preparation_note: ing.preparation_note || '',
          order: ing.order || 0,
        }))
      );
      setEditSteps(
        data.steps.map((step) => ({
          id: step.id,
          step_number: step.step_number,
          instruction: step.instruction,
          time_minutes: step.time_minutes || '',
        }))
      );
    }
  }, [data]);

  // Fetch ingredients when entering edit mode
  useEffect(() => {
    if (isEditing) {
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
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
    setEditImage(null);
    setImagePreview(null);
    if (data) {
      // Reset all form values
      setEditName(data.name);
      setEditDescription(data.description || '');
      setEditDifficulty(data.difficulty);
      setEditPrepTimeMinutes(data.prep_time_minutes || '');
      setEditCookTimeMinutes(data.cook_time_minutes || '');
      setEditServings(data.servings);
      setEditImage(null);
      setEditSourceUrl(data.source_url || '');
      setEditTags(data.tags || '');
      setEditIngredients(
        data.ingredients.map((ing) => ({
          id: ing.id,
          ingredient: ing.ingredient,
          quantity: ing.quantity,
          unit: ing.unit,
          preparation_note: ing.preparation_note || '',
          order: ing.order || 0,
        }))
      );
      setEditSteps(
        data.steps.map((step) => ({
          id: step.id,
          step_number: step.step_number,
          instruction: step.instruction,
          time_minutes: step.time_minutes || '',
        }))
      );
    }
  };

  const handleSave = async () => {
    if (!id) return;

    if (!editName.trim()) {
      setSaveError('Recipe name is required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('description', editDescription);
      formData.append('difficulty', editDifficulty);
      formData.append('servings', editServings.toString());

      if (editPrepTimeMinutes) {
        formData.append('prep_time_minutes', editPrepTimeMinutes.toString());
      }
      if (editCookTimeMinutes) {
        formData.append('cook_time_minutes', editCookTimeMinutes.toString());
      }
      if (editImage) {
        formData.append('image', editImage);
      }
      if (editSourceUrl) {
        formData.append('source_url', editSourceUrl);
      }
      if (editTags) {
        formData.append('tags', editTags);
      }

      // Add ingredients
      if (editIngredients.length > 0) {
        const ingredientsData = editIngredients.map((ing) => ({
          ingredient: Number(ing.ingredient),
          quantity: Number(ing.quantity),
          unit: ing.unit,
          preparation_note: ing.preparation_note,
          order: ing.order,
        }));
        formData.append('ingredients', JSON.stringify(ingredientsData));
      }

      // Add steps
      if (editSteps.length > 0) {
        const stepsData = editSteps.map((step) => ({
          step_number: step.step_number,
          instruction: step.instruction,
          time_minutes: step.time_minutes ? Number(step.time_minutes) : null,
        }));
        formData.append('steps', JSON.stringify(stepsData));
      }

      await Api.updateRecipe(parseInt(id, 10), formData);
      setIsEditing(false);
      window.location.reload(); // Reload to fetch updated data
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const addIngredient = () => {
    setEditIngredients([
      ...editIngredients,
      {
        ingredient: '',
        quantity: 1,
        unit: 'piece',
        preparation_note: '',
        order: editIngredients.length,
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    setEditIngredients(editIngredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredientForm, value: any) => {
    const updated = [...editIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setEditIngredients(updated);
  };

  const addStep = () => {
    setEditSteps([
      ...editSteps,
      { step_number: editSteps.length + 1, instruction: '', time_minutes: '' },
    ]);
  };

  const removeStep = (index: number) => {
    const updated = editSteps.filter((_, i) => i !== index);
    // Renumber steps
    updated.forEach((step, i) => {
      step.step_number = i + 1;
    });
    setEditSteps(updated);
  };

  const updateStep = (index: number, field: keyof RecipeStepForm, value: any) => {
    const updated = [...editSteps];
    updated[index] = { ...updated[index], [field]: value };
    setEditSteps(updated);
  };

  const handleImageChange = (file: File | null) => {
    setEditImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  if (loading) {
    return (
      <Center py="xl" style={{ minHeight: 400 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !data) {
    return (
      <Box p="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error?.message || 'Recipe not found'}
        </Alert>
      </Box>
    );
  }

  const formatTime = (minutes: number | null | undefined) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);

    try {
      await Api.deleteRecipe(parseInt(id, 10));
      navigate('/recipes');
    } catch (err) {
      console.error('Failed to delete recipe:', err);
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box p="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Button
            leftSection={<IconArrowLeft size={18} />}
            variant="subtle"
            onClick={() => navigate('/recipes')}
          >
            Back to Recipes
          </Button>

          {!isEditing ? (
            <Menu position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="default" size="lg">
                  <IconDots size={18} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconEdit size={14} />} onClick={handleEdit}>
                  Edit Recipe
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete Recipe
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group>
              <Button
                variant="default"
                leftSection={<IconX size={18} />}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                leftSection={<IconDeviceFloppy size={18} />}
                onClick={handleSave}
                loading={isSaving}
              >
                Save
              </Button>
            </Group>
          )}
        </Group>

        {saveError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Save Error">
            {saveError}
          </Alert>
        )}

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            {!isEditing ? (
              <>
                {data.image ? (
                  <Image src={data.image} alt={data.name} radius="md" fit="cover" h={300} />
                ) : (
                  <Center
                    h={300}
                    style={{
                      backgroundColor: 'var(--mantine-color-gray-1)',
                      borderRadius: 'var(--mantine-radius-md)',
                    }}
                  >
                    <IconChefHat size={80} stroke={1.5} opacity={0.3} />
                  </Center>
                )}
              </>
            ) : (
              <div>
                {(imagePreview || data.image) && (
                  <Image
                    src={imagePreview || data.image!}
                    alt={data.name}
                    radius="md"
                    fit="cover"
                    h={300}
                    mb="md"
                  />
                )}
                {!imagePreview && !data.image && (
                  <Center
                    h={300}
                    mb="md"
                    style={{
                      backgroundColor: 'var(--mantine-color-gray-1)',
                      borderRadius: 'var(--mantine-radius-md)',
                    }}
                  >
                    <IconChefHat size={80} stroke={1.5} opacity={0.3} />
                  </Center>
                )}
                <Text size="sm" fw={500} mb={5}>
                  Recipe Image
                </Text>
                <FileButton onChange={handleImageChange} accept="image/*">
                  {(props) => (
                    <Button
                      {...props}
                      leftSection={<IconUpload size={16} />}
                      variant="light"
                      fullWidth
                    >
                      {editImage ? editImage.name : data.image ? 'Change Image' : 'Upload Image'}
                    </Button>
                  )}
                </FileButton>
                {editImage && (
                  <Text size="xs" c="dimmed" mt={5}>
                    New: {editImage.name}
                  </Text>
                )}
              </div>
            )}

            <Card withBorder mt="md">
              <Stack gap="md">
                {!isEditing ? (
                  <>
                    <Group>
                      <IconClock size={20} />
                      <div>
                        <Text size="xs" c="dimmed">
                          Prep Time
                        </Text>
                        <Text fw={500}>{formatTime(data.prep_time_minutes)}</Text>
                      </div>
                    </Group>

                    <Group>
                      <IconClock size={20} />
                      <div>
                        <Text size="xs" c="dimmed">
                          Cook Time
                        </Text>
                        <Text fw={500}>{formatTime(data.cook_time_minutes)}</Text>
                      </div>
                    </Group>

                    <Group>
                      <IconClock size={20} />
                      <div>
                        <Text size="xs" c="dimmed">
                          Total Time
                        </Text>
                        <Text fw={500}>{formatTime(data.total_time_minutes)}</Text>
                      </div>
                    </Group>

                    <Group>
                      <IconUsers size={20} />
                      <div>
                        <Text size="xs" c="dimmed">
                          Servings
                        </Text>
                        <Text fw={500}>{data.servings}</Text>
                      </div>
                    </Group>

                    <Group>
                      <Badge color={DIFFICULTY_COLORS[data.difficulty]}>{data.difficulty}</Badge>
                    </Group>

                    {data.source_url && (
                      <Button
                        component="a"
                        href={data.source_url}
                        target="_blank"
                        variant="light"
                        leftSection={<IconExternalLink size={16} />}
                        fullWidth
                      >
                        View Source
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <NumberInput
                      label="Prep Time (minutes)"
                      value={editPrepTimeMinutes}
                      onChange={setEditPrepTimeMinutes}
                      min={0}
                    />

                    <NumberInput
                      label="Cook Time (minutes)"
                      value={editCookTimeMinutes}
                      onChange={setEditCookTimeMinutes}
                      min={0}
                    />

                    <NumberInput
                      label="Servings"
                      value={editServings}
                      onChange={setEditServings}
                      min={1}
                    />

                    <Select
                      label="Difficulty"
                      data={DIFFICULTY_OPTIONS}
                      value={editDifficulty}
                      onChange={(value) => setEditDifficulty(value as DifficultyLevel)}
                    />

                    <TextInput
                      label="Source URL"
                      value={editSourceUrl}
                      onChange={(e) => setEditSourceUrl(e.currentTarget.value)}
                    />
                  </>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              <div>
                {!isEditing ? (
                  <>
                    <Title order={1}>{data.name}</Title>
                    {data.description && (
                      <Text mt="sm" size="lg" c="dimmed">
                        {data.description}
                      </Text>
                    )}
                    {data.tags && (
                      <Group gap="xs" mt="md">
                        {data.tags.split(',').map((tag) => (
                          <Badge key={tag.trim()} variant="light">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </Group>
                    )}
                  </>
                ) : (
                  <>
                    <TextInput
                      label="Recipe Name"
                      value={editName}
                      onChange={(e) => setEditName(e.currentTarget.value)}
                      required
                    />

                    <Textarea
                      label="Description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.currentTarget.value)}
                      minRows={3}
                    />

                    <TextInput
                      label="Tags"
                      placeholder="e.g., vegetarian, quick, italian"
                      description="Comma-separated tags"
                      value={editTags}
                      onChange={(e) => setEditTags(e.currentTarget.value)}
                    />
                  </>
                )}
              </div>

              <Divider />

              <div>
                <Group justify="space-between" mb="md">
                  <Title order={2}>Ingredients</Title>
                  {isEditing && (
                    <Button
                      leftSection={<IconPlus size={16} />}
                      variant="light"
                      size="sm"
                      onClick={addIngredient}
                    >
                      Add Ingredient
                    </Button>
                  )}
                </Group>

                {!isEditing ? (
                  <>
                    {data.ingredients.length === 0 ? (
                      <Text c="dimmed">No ingredients added yet</Text>
                    ) : (
                      <List spacing="sm">
                        {data.ingredients.map((ingredient) => (
                          <List.Item key={ingredient.id}>
                            <Text>
                              <Text component="span" fw={500}>
                                {ingredient.quantity} {ingredient.unit}
                              </Text>{' '}
                              {ingredient.ingredient_name || `Ingredient #${ingredient.ingredient}`}
                              {ingredient.preparation_note && (
                                <Text component="span" c="dimmed">
                                  {' '}
                                  ({ingredient.preparation_note})
                                </Text>
                              )}
                            </Text>
                          </List.Item>
                        ))}
                      </List>
                    )}
                  </>
                ) : (
                  <Stack gap="sm">
                    {editIngredients.map((ingredient, index) => (
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
                          onChange={(e) =>
                            updateIngredient(index, 'preparation_note', e.currentTarget.value)
                          }
                          style={{ flex: 1 }}
                        />
                        <ActionIcon color="red" onClick={() => removeIngredient(index)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                    {editIngredients.length === 0 && (
                      <Text c="dimmed" size="sm">
                        No ingredients added yet. Click "Add Ingredient" to add one.
                      </Text>
                    )}
                  </Stack>
                )}
              </div>

              <Divider />

              <div>
                <Group justify="space-between" mb="md">
                  <Title order={2}>Instructions</Title>
                  {isEditing && (
                    <Button
                      leftSection={<IconPlus size={16} />}
                      variant="light"
                      size="sm"
                      onClick={addStep}
                    >
                      Add Step
                    </Button>
                  )}
                </Group>

                {!isEditing ? (
                  <>
                    {data.steps.length === 0 ? (
                      <Text c="dimmed">No instructions added yet</Text>
                    ) : (
                      <Stack gap="md">
                        {data.steps.map((step) => (
                          <Card key={step.id} withBorder>
                            <Group align="flex-start" gap="md">
                              <Badge size="xl" circle>
                                {step.step_number}
                              </Badge>
                              <Stack gap="xs" style={{ flex: 1 }}>
                                <Text>{step.instruction}</Text>
                                {step.time_minutes && (
                                  <Text size="sm" c="dimmed">
                                    <IconClock size={14} style={{ verticalAlign: 'middle' }} />{' '}
                                    {formatTime(step.time_minutes)}
                                  </Text>
                                )}
                              </Stack>
                            </Group>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </>
                ) : (
                  <Stack gap="sm">
                    {editSteps.map((step, index) => (
                      <Group key={index} align="flex-start" wrap="nowrap">
                        <Text fw={500} mt={8} style={{ width: 30 }}>
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
                    {editSteps.length === 0 && (
                      <Text c="dimmed" size="sm">
                        No steps added yet. Click "Add Step" to add one.
                      </Text>
                    )}
                  </Stack>
                )}
              </div>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Recipe"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete <strong>{data.name}</strong>? This action cannot be
            undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={18} />}
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
