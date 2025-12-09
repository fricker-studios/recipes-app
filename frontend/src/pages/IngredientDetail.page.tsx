import { useEffect, useState } from 'react';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconDeviceFloppy,
  IconEdit,
  IconPlus,
  IconTrash,
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
  Grid,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { Api } from '../api/Api';
import type { Ingredient, IngredientNutrient } from '../api/types';
import { useIngredient } from '../hooks/useIngredient';

// Nutrient options matching the Django NutrientNames choices
const NUTRIENT_OPTIONS = [
  { value: 'calcium', label: 'Calcium' },
  { value: 'carbohydrates', label: 'Carbohydrates' },
  { value: 'cholesterol', label: 'Cholesterol' },
  { value: 'energy', label: 'Energy' },
  { value: 'fiber', label: 'Fiber, total dietary' },
  { value: 'fat', label: 'Total lipid (fat)' },
  { value: 'iron', label: 'Iron, Fe' },
  { value: 'monounsaturated_fat', label: 'Fatty acids, total monounsaturated' },
  { value: 'polyunsaturated_fat', label: 'Fatty acids, total polyunsaturated' },
  { value: 'protein', label: 'Protein' },
  { value: 'saturated_fat', label: 'Fatty acids, total saturated' },
  { value: 'sodium', label: 'Sodium, Na' },
  { value: 'sugars', label: 'Sugars, Total' },
  { value: 'vitamin_c', label: 'Vitamin C, total ascorbic acid' },
];

export function IngredientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useIngredient(id ? parseInt(id, 10) : null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<Ingredient>>({});
  const [editNutrients, setEditNutrients] = useState<Partial<IngredientNutrient>[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper function to get friendly nutrient name
  const getNutrientLabel = (value: string) => {
    const option = NUTRIENT_OPTIONS.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  useEffect(() => {
    if (data) {
      setEditData({
        name: data.name,
        plural_name: data.plural_name,
        description: data.description,
        grams_per_cup: data.grams_per_cup,
      });
      setEditNutrients(data.nutrients || []);
    }
  }, [data]);

  const handleEdit = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
    if (data) {
      setEditData({
        name: data.name,
        plural_name: data.plural_name,
        description: data.description,
        grams_per_cup: data.grams_per_cup,
      });
      setEditNutrients(data.nutrients || []);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await Api.updateIngredient(parseInt(id, 10), {
        ...editData,
        nutrients: editNutrients as IngredientNutrient[],
      });
      setIsEditing(false);
      // Refetch the data
      window.location.reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNutrient = () => {
    setEditNutrients([...editNutrients, { nutrient_name: '', amount: 0, grams: 100 }]);
  };

  const handleUpdateNutrient = (index: number, field: keyof IngredientNutrient, value: any) => {
    const updated = [...editNutrients];
    updated[index] = { ...updated[index], [field]: value };
    setEditNutrients(updated);
  };

  const handleDeleteNutrient = (index: number) => {
    setEditNutrients(editNutrients.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);

    try {
      await Api.deleteIngredient(parseInt(id, 10));
      navigate('/ingredients');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to delete ingredient');
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box p="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error.message}
        </Alert>
        <Button
          mt="md"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate('/ingredients')}
        >
          Back to Ingredients
        </Button>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p="xl">
        <Alert color="yellow" title="Not Found">
          Ingredient not found
        </Alert>
        <Button
          mt="md"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate('/ingredients')}
        >
          Back to Ingredients
        </Button>
      </Box>
    );
  }

  return (
    <Box p="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={18} />}
            onClick={() => navigate('/ingredients')}
          >
            Back to Ingredients
          </Button>

          {!isEditing ? (
            <Group>
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={18} />}
                onClick={() => setDeleteModalOpen(true)}
                disabled={isEditing}
              >
                Delete
              </Button>
              <Button leftSection={<IconEdit size={18} />} onClick={handleEdit}>
                Edit
              </Button>
            </Group>
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

        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            {!isEditing ? (
              <>
                <Title order={1}>{data.name}</Title>
                {data.plural_name && (
                  <Text size="lg" c="dimmed" mt="xs">
                    Plural: {data.plural_name}
                  </Text>
                )}
              </>
            ) : (
              <Stack gap="sm">
                <TextInput
                  label="Name"
                  value={editData.name || ''}
                  onChange={(e) => setEditData({ ...editData, name: e.currentTarget.value })}
                  required
                />
                <TextInput
                  label="Plural Name"
                  value={editData.plural_name || ''}
                  onChange={(e) => setEditData({ ...editData, plural_name: e.currentTarget.value })}
                />
              </Stack>
            )}
          </div>
          {data.fdc_food_item && (
            <Badge size="lg" variant="light">
              From FDC
            </Badge>
          )}
        </Group>

        <Divider />

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Title order={3}>Details</Title>

                {!isEditing ? (
                  <>
                    {data.description && (
                      <div>
                        <Text fw={500} size="sm" mb={4}>
                          Description
                        </Text>
                        <Text size="sm">{data.description}</Text>
                      </div>
                    )}

                    {data.grams_per_cup && (
                      <div>
                        <Text fw={500} size="sm" mb={4}>
                          Grams per Cup
                        </Text>
                        <Text size="sm">{data.grams_per_cup}g</Text>
                      </div>
                    )}

                    {data.fdc_food_item && (
                      <div>
                        <Text fw={500} size="sm" mb={4}>
                          FDC Food Item ID
                        </Text>
                        <Text size="sm">
                          <Badge variant="outline">{data.fdc_food_item}</Badge>
                        </Text>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Textarea
                      label="Description"
                      value={editData.description || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, description: e.currentTarget.value })
                      }
                      minRows={3}
                      autosize
                    />

                    <NumberInput
                      label="Grams per Cup"
                      value={editData.grams_per_cup || undefined}
                      onChange={(value) =>
                        setEditData({ ...editData, grams_per_cup: value as number })
                      }
                      min={0}
                      step={0.1}
                      decimalScale={2}
                    />

                    {data.fdc_food_item && (
                      <div>
                        <Text fw={500} size="sm" mb={4}>
                          FDC Food Item ID
                        </Text>
                        <Text size="sm">
                          <Badge variant="outline">{data.fdc_food_item}</Badge>
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          (FDC Food Item cannot be edited)
                        </Text>
                      </div>
                    )}
                  </>
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {!isEditing && data.nutrients && data.nutrients.length > 0 && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={3}>Nutritional Information</Title>
                  <Text size="sm" c="dimmed">
                    {data.nutrients.length} nutrient{data.nutrients.length !== 1 ? 's' : ''}
                  </Text>

                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Nutrient</Table.Th>
                        <Table.Th>Amount</Table.Th>
                        <Table.Th>Per (g)</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {data.nutrients.map((nutrient, index) => (
                        <Table.Tr key={nutrient.id || index}>
                          <Table.Td>{getNutrientLabel(nutrient.nutrient_name)}</Table.Td>
                          <Table.Td>{nutrient.amount}</Table.Td>
                          <Table.Td>{nutrient.grams}g</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Stack>
              </Card>
            </Grid.Col>
          )}

          {isEditing && (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Title order={3}>Nutritional Information</Title>
                    <Button
                      size="sm"
                      leftSection={<IconPlus size={16} />}
                      onClick={handleAddNutrient}
                    >
                      Add Nutrient
                    </Button>
                  </Group>

                  {editNutrients.length === 0 ? (
                    <Text c="dimmed" size="sm">
                      No nutrients added yet. Click "Add Nutrient" to add one.
                    </Text>
                  ) : (
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Nutrient Name</Table.Th>
                          <Table.Th>Amount</Table.Th>
                          <Table.Th>Per (g)</Table.Th>
                          <Table.Th style={{ width: 60 }}></Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {editNutrients.map((nutrient, index) => (
                          <Table.Tr key={index}>
                            <Table.Td>
                              <Select
                                value={nutrient.nutrient_name || ''}
                                onChange={(value) =>
                                  handleUpdateNutrient(index, 'nutrient_name', value || '')
                                }
                                data={NUTRIENT_OPTIONS}
                                placeholder="Select nutrient"
                                size="sm"
                                searchable
                                clearable
                              />
                            </Table.Td>
                            <Table.Td>
                              <NumberInput
                                value={nutrient.amount || 0}
                                onChange={(value) =>
                                  handleUpdateNutrient(index, 'amount', value as number)
                                }
                                min={0}
                                step={0.1}
                                decimalScale={2}
                                placeholder="0"
                                size="sm"
                              />
                            </Table.Td>
                            <Table.Td>
                              <NumberInput
                                value={nutrient.grams || 100}
                                onChange={(value) =>
                                  handleUpdateNutrient(index, 'grams', value as number)
                                }
                                min={0}
                                step={1}
                                placeholder="100"
                                size="sm"
                              />
                            </Table.Td>
                            <Table.Td>
                              <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={() => handleDeleteNutrient(index)}
                              >
                                <IconTrash size={18} />
                              </ActionIcon>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          )}
        </Grid>
      </Stack>

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Ingredient"
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
