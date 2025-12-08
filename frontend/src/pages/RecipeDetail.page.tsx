import {
  IconAlertCircle,
  IconArrowLeft,
  IconChefHat,
  IconClock,
  IconDots,
  IconEdit,
  IconExternalLink,
  IconTrash,
  IconUsers,
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
  Image,
  List,
  Loader,
  Menu,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import type { DifficultyLevel } from '../api/types';
import { useRecipe } from '../hooks/useRecipe';

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'green',
  medium: 'yellow',
  hard: 'red',
};

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useRecipe(id ? parseInt(id, 10) : null);

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
          <Menu position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="default" size="lg">
                <IconDots size={18} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconEdit size={14} />}>Edit Recipe</Menu.Item>
              <Menu.Item leftSection={<IconTrash size={14} />} color="red">
                Delete Recipe
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            {data.image_url ? (
              <Image src={data.image_url} alt={data.name} radius="md" fit="cover" h={300} />
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

            <Card withBorder mt="md">
              <Stack gap="md">
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
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              <div>
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
              </div>

              <Divider />

              <div>
                <Title order={2} mb="md">
                  Ingredients
                </Title>
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
              </div>

              <Divider />

              <div>
                <Title order={2} mb="md">
                  Instructions
                </Title>
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
              </div>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Box>
  );
}
