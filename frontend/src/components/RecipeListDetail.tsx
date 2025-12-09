import { useState } from 'react';
import {
  IconChefHat,
  IconClock,
  IconDots,
  IconEdit,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Divider,
  Group,
  Image,
  Menu,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import type { RecipeCollection } from '../api/types';

interface RecipeListDetailProps {
  opened: boolean;
  onClose: () => void;
  recipeList: RecipeCollection | null;
  onAddRecipe: () => void;
  onRemoveRecipe: (recipeId: number) => Promise<void>;
  onEdit: () => void;
  onDelete: () => void;
}

export function RecipeListDetail({
  opened,
  onClose,
  recipeList,
  onAddRecipe,
  onRemoveRecipe,
  onEdit,
  onDelete,
}: RecipeListDetailProps) {
  const [removingRecipeId, setRemovingRecipeId] = useState<number | null>(null);
  const [removeModalOpened, setRemoveModalOpened] = useState(false);
  const [recipeToRemove, setRecipeToRemove] = useState<{ id: number; name: string } | null>(null);
  const navigate = useNavigate();

  if (!recipeList) return null;

  const handleRecipeClick = (recipeId: number) => {
    navigate(`/recipes/${recipeId}`);
    onClose();
  };

  const handleRemoveRecipe = (recipeId: number, recipeName: string) => {
    setRecipeToRemove({ id: recipeId, name: recipeName });
    setRemoveModalOpened(true);
  };

  const confirmRemoveRecipe = async () => {
    if (!recipeToRemove) return;

    setRemovingRecipeId(recipeToRemove.id);
    try {
      await onRemoveRecipe(recipeToRemove.id);
      setRemoveModalOpened(false);
      setRecipeToRemove(null);
    } finally {
      setRemovingRecipeId(null);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" style={{ width: '100%', paddingRight: '1rem' }}>
          <Text fw={600} size="lg">
            {recipeList.name}
          </Text>
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots size={18} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />} onClick={onEdit}>
                Edit Collection
              </Menu.Item>
              <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={onDelete}>
                Delete Collection
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      }
      size="lg"
      padding="lg"
    >
      <Stack gap="md">
        {recipeList.description && (
          <>
            <Text size="sm" c="dimmed">
              {recipeList.description}
            </Text>
            <Divider />
          </>
        )}

        <Group justify="space-between">
          <Group gap="xs">
            <IconChefHat size={20} />
            <Text fw={500}>
              {recipeList.recipe_count} {recipeList.recipe_count === 1 ? 'Recipe' : 'Recipes'}
            </Text>
          </Group>
          <Button leftSection={<IconPlus size={16} />} size="sm" onClick={onAddRecipe}>
            Add Recipe
          </Button>
        </Group>

        <ScrollArea h={400}>
          {recipeList.recipes.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="md">
                <IconChefHat size={48} stroke={1.5} opacity={0.5} />
                <Text c="dimmed" ta="center">
                  No recipes in this collection yet.
                  <br />
                  Click "Add Recipe" to get started!
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap="sm">
              {recipeList.recipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  shadow="xs"
                  m="xs"
                  padding="md"
                  radius="md"
                  withBorder
                  style={{ cursor: 'pointer', transition: 'transform 0.1s ease-in-out' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    {recipe.image && (
                      <Image
                        src={recipe.image}
                        alt={recipe.name}
                        w={80}
                        h={80}
                        fit="cover"
                        radius="md"
                        onClick={() => handleRecipeClick(recipe.id)}
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                      />
                    )}
                    <Stack
                      gap="xs"
                      style={{ flex: 1, minWidth: 0 }}
                      onClick={() => handleRecipeClick(recipe.id)}
                    >
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

                    <ActionIcon
                      color="red"
                      variant="subtle"
                      loading={removingRecipeId === recipe.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRecipe(recipe.id, recipe.name);
                      }}
                    >
                      <IconX size={18} />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Stack>

      <Modal
        opened={removeModalOpened}
        onClose={() => {
          setRemoveModalOpened(false);
          setRecipeToRemove(null);
        }}
        title="Remove Recipe"
        centered
        zIndex={400}
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to remove <strong>{recipeToRemove?.name}</strong> from this
            collection?
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setRemoveModalOpened(false);
                setRecipeToRemove(null);
              }}
              disabled={removingRecipeId !== null}
            >
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={18} />}
              onClick={confirmRemoveRecipe}
              loading={removingRecipeId !== null}
            >
              Remove
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Modal>
  );
}
