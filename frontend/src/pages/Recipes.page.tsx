import { useState } from 'react';
import {
  IconAlertCircle,
  IconChefHat,
  IconClock,
  IconDots,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
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
  Image,
  Loader,
  Menu,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { Api } from '../api/Api';
import type { DifficultyLevel, RecipeListItem } from '../api/types';
import { CreateRecipeModal } from '../components/CreateRecipeModal';
import { useRecipes } from '../hooks/useRecipes';

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'green',
  medium: 'yellow',
  hard: 'red',
};

export function Recipes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<RecipeListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, loading, error, refetch } = useRecipes({
    search: search || undefined,
    difficulty: difficulty || undefined,
  });

  const formatTime = (minutes: number | null) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleDeleteClick = (recipe: RecipeListItem) => {
    setRecipeToDelete(recipe);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!recipeToDelete) return;

    setIsDeleting(true);

    try {
      await Api.deleteRecipe(recipeToDelete.id);
      setDeleteModalOpen(false);
      setRecipeToDelete(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete recipe:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Box p="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>Recipes</Title>
          <Button leftSection={<IconPlus size={18} />} onClick={() => setCreateModalOpen(true)}>
            Add Recipe
          </Button>
        </Group>

        <Divider />

        <Group gap="md">
          <TextInput
            placeholder="Search recipes..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Difficulty"
            data={[
              { value: '', label: 'All' },
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
            value={difficulty || ''}
            onChange={(value) => setDifficulty(value as DifficultyLevel | null)}
            clearable
            style={{ minWidth: 150 }}
          />
        </Group>

        {loading && (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        )}

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {error.message}
          </Alert>
        )}

        {!loading && !error && data.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="md">
              <IconChefHat size={48} stroke={1.5} opacity={0.5} />
              <Text c="dimmed">No recipes found</Text>
              <Button leftSection={<IconPlus size={18} />} onClick={() => setCreateModalOpen(true)}>
                Create your first recipe
              </Button>
            </Stack>
          </Center>
        )}

        {!loading && !error && data.length > 0 && (
          <Grid gutter="md">
            {data.map((recipe) => (
              <Grid.Col key={recipe.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{ height: '100%', cursor: 'pointer' }}
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  <Card.Section>
                    {recipe.image ? (
                      <Image src={recipe.image} height={160} alt={recipe.name} fit="cover" />
                    ) : (
                      <Center
                        h={160}
                        style={{
                          backgroundColor: 'var(--mantine-color-gray-1)',
                        }}
                      >
                        <IconChefHat size={48} stroke={1.5} opacity={0.3} />
                      </Center>
                    )}
                  </Card.Section>

                  <Stack gap="xs" mt="md">
                    <Group justify="space-between" align="flex-start">
                      <Title order={4} lineClamp={2} style={{ flex: 1 }}>
                        {recipe.name}
                      </Title>
                      <Menu position="bottom-end" withinPortal>
                        <Menu.Target>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              // TODO: Open edit modal
                            }}
                          >
                            Edit
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(recipe);
                            }}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>

                    {recipe.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {recipe.description}
                      </Text>
                    )}

                    <Group gap="xs">
                      <Badge color={DIFFICULTY_COLORS[recipe.difficulty]} size="sm">
                        {recipe.difficulty}
                      </Badge>
                      {recipe.total_time_minutes > 0 && (
                        <Badge leftSection={<IconClock size={12} />} color="gray" size="sm">
                          {formatTime(recipe.total_time_minutes)}
                        </Badge>
                      )}
                    </Group>

                    <Group gap="xs" mt="auto">
                      <Text size="xs" c="dimmed">
                        {recipe.ingredient_count} ingredients
                      </Text>
                      <Text size="xs" c="dimmed">
                        • {recipe.servings} servings
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>

      <CreateRecipeModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={refetch}
      />

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Recipe"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete <strong>{recipeToDelete?.name}</strong>? This action
            cannot be undone.
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
