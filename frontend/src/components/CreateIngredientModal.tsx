import { useEffect, useState } from 'react';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import {
  Alert,
  Button,
  Divider,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { Api } from '../api/Api';
import type { CreateIngredientRequest } from '../api/types';

interface CreateIngredientModalProps {
  opened: boolean;
  onClose: () => void;
  foodItemId: number | null;
  foodItemDescription?: string;
  foodItemDetail?: any;
  onSuccess?: (ingredientId: number) => void;
}

interface NutrientValues {
  [key: string]: string;
}

const NUTRIENTS = [
  { key: 'calcium', label: 'Calcium (mg)', matchNames: ['Calcium', 'Calcium, Ca'] },
  { key: 'carbohydrates', label: 'Carbohydrates (g)', matchNames: ['Carbohydrate, by difference'] },
  { key: 'cholesterol', label: 'Cholesterol (mg)', matchNames: ['Cholesterol'] },
  {
    key: 'energy',
    label: 'Energy (kcal)',
    matchNames: ['Energy', 'Energy (Atwater General Factors)', 'Energy (Atwater Specific Factors)'],
  },
  { key: 'fiber', label: 'Fiber, total dietary (g)', matchNames: ['Fiber, total dietary'] },
  { key: 'fat', label: 'Total lipid (fat) (g)', matchNames: ['Total lipid (fat)'] },
  { key: 'iron', label: 'Iron, Fe (mg)', matchNames: ['Iron, Fe'] },
  {
    key: 'monounsaturated_fat',
    label: 'Fatty acids, total monounsaturated (g)',
    matchNames: ['Fatty acids, total monounsaturated'],
  },
  {
    key: 'polyunsaturated_fat',
    label: 'Fatty acids, total polyunsaturated (g)',
    matchNames: ['Fatty acids, total polyunsaturated'],
  },
  { key: 'protein', label: 'Protein (g)', matchNames: ['Protein'] },
  {
    key: 'saturated_fat',
    label: 'Fatty acids, total saturated (g)',
    matchNames: ['Fatty acids, total saturated'],
  },
  { key: 'sodium', label: 'Sodium, Na (mg)', matchNames: ['Sodium, Na'] },
  {
    key: 'sugars',
    label: 'Sugars, Total (g)',
    matchNames: ['Sugars, Total', 'Sugars, total including NLEA'],
  },
  {
    key: 'vitamin_c',
    label: 'Vitamin C, total ascorbic acid (mg)',
    matchNames: ['Vitamin C, total ascorbic acid'],
  },
];

export function CreateIngredientModal({
  opened,
  onClose,
  foodItemId,
  foodItemDescription,
  foodItemDetail,
  onSuccess,
}: CreateIngredientModalProps) {
  const [name, setName] = useState('');
  const [pluralName, setPluralName] = useState('');
  const [description, setDescription] = useState('');
  const [gramsPerCup, setGramsPerCup] = useState<number | string>('');
  const [nutrientGrams, setNutrientGrams] = useState<number | string>(100);
  const [nutrients, setNutrients] = useState<NutrientValues>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Pre-populate form when modal opens with detail data
  useEffect(() => {
    if (opened && foodItemDetail) {
      // Set name from description
      if (foodItemDescription) {
        setName(foodItemDescription);
        // Try to create a plural name (simple heuristic)
        const pluralGuess = foodItemDescription.endsWith('s')
          ? foodItemDescription
          : foodItemDescription + 's';
        setPluralName(pluralGuess);
      }

      // Set description from food category
      if (foodItemDetail.foodCategory?.description) {
        setDescription(foodItemDetail.foodCategory.description);
      }

      // Extract nutrients from foodNutrients array
      if (foodItemDetail.foodNutrients && Array.isArray(foodItemDetail.foodNutrients)) {
        const nutrientMap: NutrientValues = {};

        foodItemDetail.foodNutrients.forEach((foodNutrient: any) => {
          const nutrientName = foodNutrient.nutrient?.name;
          const amount = foodNutrient.amount;

          if (nutrientName && amount !== undefined && amount !== null) {
            // Find matching nutrient in our form
            const matchingNutrient = NUTRIENTS.find((n) => n.matchNames.includes(nutrientName));

            if (matchingNutrient) {
              nutrientMap[matchingNutrient.key] = String(amount);
            }
          }
        });

        setNutrients(nutrientMap);
      }
    }
  }, [opened, foodItemDetail, foodItemDescription]);

  const handleNutrientChange = (key: string, value: string) => {
    setNutrients((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const ingredientData: CreateIngredientRequest = {
        name,
        plural_name: pluralName || undefined,
        description: description || undefined,
        grams_per_cup: gramsPerCup ? Number(gramsPerCup) : null,
        fdc_food_item: foodItemId || undefined,
        nutrients: Object.entries(nutrients)
          .filter(([_, value]) => value && value.trim() !== '')
          .map(([key, value]) => ({
            nutrient_name: key,
            amount: Number(value),
            grams: Number(nutrientGrams) || 100.0,
          })),
      };

      const result = await Api.createIngredient(ingredientData);

      setSuccess(true);

      // Wait a moment to show success message
      setTimeout(() => {
        onClose();
        setName('');
        setPluralName('');
        setDescription('');
        setGramsPerCup('');
        setNutrientGrams(100);
        setNutrients({});
        setSuccess(false);

        if (onSuccess && result.id) {
          onSuccess(result.id);
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create Ingredient"
      centered
      size="lg"
      styles={{
        body: { maxHeight: '70vh', overflowY: 'auto' },
      }}
    >
      <Stack gap="md">
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            title="Error"
            onClose={() => setError(null)}
            withCloseButton
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert icon={<IconCheck size={16} />} color="green" title="Success">
            Ingredient created successfully!
          </Alert>
        )}

        {foodItemDescription && (
          <TextInput label="Based on Food Item" value={foodItemDescription} disabled />
        )}

        <Divider />

        <Title order={5}>Basic Information</Title>

        <TextInput
          label="Ingredient Name"
          placeholder="Enter ingredient name"
          required
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />

        <TextInput
          label="Plural Name"
          placeholder="Enter plural form (optional)"
          value={pluralName}
          onChange={(e) => setPluralName(e.currentTarget.value)}
        />

        <Textarea
          label="Description"
          placeholder="Enter ingredient description (optional)"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          rows={3}
        />

        <NumberInput
          label="Grams per Cup"
          placeholder="Enter grams per cup (optional)"
          value={gramsPerCup}
          onChange={setGramsPerCup}
          min={0}
          decimalScale={2}
        />

        <Divider />

        <Title order={5}>Nutritional Information</Title>

        <NumberInput
          label="Serving Size (grams)"
          description="The serving size that the nutritional values below are based on"
          value={nutrientGrams}
          onChange={setNutrientGrams}
          min={0.01}
          decimalScale={2}
          required
        />

        <Text size="sm" c="dimmed" mt="xs">
          Enter nutrient values for the serving size specified above. Leave blank if unknown.
        </Text>

        {NUTRIENTS.map(({ key, label }) => (
          <NumberInput
            key={key}
            label={label}
            placeholder="Enter amount"
            value={nutrients[key] || ''}
            onChange={(value) => handleNutrientChange(key, String(value))}
            min={0}
            decimalScale={2}
            styles={{
              input: nutrients[key] ? { fontWeight: 500 } : undefined,
            }}
          />
        ))}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading || success}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} disabled={!name.trim() || success}>
            Create Ingredient
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
