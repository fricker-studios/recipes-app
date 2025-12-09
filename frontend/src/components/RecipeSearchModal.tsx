import { useEffect, useState } from 'react';
import { IconAlertCircle, IconClock, IconPlus, IconSearch } from '@tabler/icons-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Image,
  Loader,
  Modal,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Api } from '../api/Api';
import type { RecipeListItem } from '../api/types';

interface RecipeSearchModalProps {
  opened: boolean;
  onClose: () => void;
  onSelectRecipe: (recipeId: number) => Promise<void>;
  excludeRecipeIds?: number[];
}

export function RecipeSearchModal({
  opened,
  onClose,
  onSelectRecipe,
  excludeRecipeIds = [],
}: RecipeSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchQuery, 300);
  const [recipes, setRecipes] = useState<RecipeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingRecipeId, setAddingRecipeId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await Api.getRecipes({
          search: debouncedSearch || undefined,
          limit: 20,
        });
        setRecipes(response.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
      } finally {
        setLoading(false);
      }
    };

    if (opened) {
      fetchRecipes();
    }
  }, [debouncedSearch, opened]);

  const handleAddRecipe = async (recipeId: number) => {
    setAddingRecipeId(recipeId);
    try {
      await onSelectRecipe(recipeId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add recipe');
    } finally {
      setAddingRecipeId(null);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setError(null);
    onClose();
  };

  const filteredRecipes = recipes.filter((recipe) => !excludeRecipeIds.includes(recipe.id));

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Text fw={600}>Add Recipe to Collection</Text>}
      size="lg"
      zIndex={300}
    >
      <Stack gap="md">
        <TextInput
          placeholder="Search recipes..."
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {error}
          </Alert>
        )}

        <ScrollArea h={400}>
          {loading ? (
            <Center py="xl">
              <Loader size="md" />
            </Center>
          ) : filteredRecipes.length === 0 ? (
            <Center py="xl">
              <Text c="dimmed">No recipes found</Text>
            </Center>
          ) : (
            <Stack gap="sm">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} shadow="xs" padding="md" radius="md" withBorder>
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    {recipe.image && (
                      <Image
                        src={recipe.image}
                        alt={recipe.name}
                        w={80}
                        h={80}
                        fit="cover"
                        radius="md"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                    <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs">
                        <Text fw={500} lineClamp={1}>
                          {recipe.name}
                        </Text>
                        <Badge
                          size="sm"
                          variant="light"
                          color={
                            recipe.difficulty === 'easy'
                              ? 'green'
                              : recipe.difficulty === 'medium'
                                ? 'yellow'
                                : 'red'
                          }
                        >
                          {recipe.difficulty}
                        </Badge>
                      </Group>

                      {recipe.description && (
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {recipe.description}
                        </Text>
                      )}

                      <Group gap="xs">
                        {recipe.total_time_minutes > 0 && (
                          <Group gap={4}>
                            <IconClock size={14} />
                            <Text size="xs" c="dimmed">
                              {recipe.total_time_minutes} min
                            </Text>
                          </Group>
                        )}
                        <Text size="xs" c="dimmed">
                          {recipe.ingredient_count} ingredients
                        </Text>
                      </Group>
                    </Stack>

                    <Button
                      leftSection={<IconPlus size={16} />}
                      size="sm"
                      loading={addingRecipeId === recipe.id}
                      onClick={() => handleAddRecipe(recipe.id)}
                    >
                      Add
                    </Button>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Stack>
    </Modal>
  );
}
