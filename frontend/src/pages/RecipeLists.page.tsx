import { IconAlertCircle, IconList, IconPlus } from '@tabler/icons-react';
import {
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
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useRecipeLists } from '../hooks/useRecipeLists';

export function RecipeLists() {
  const { data, loading, error } = useRecipeLists();

  return (
    <Box p="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>Recipe Collections</Title>
          <Button leftSection={<IconPlus size={18} />}>Create Collection</Button>
        </Group>

        <Divider />

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
              <IconList size={48} stroke={1.5} opacity={0.5} />
              <Text c="dimmed">No collections found</Text>
              <Button leftSection={<IconPlus size={18} />}>Create your first collection</Button>
            </Stack>
          </Center>
        )}

        {!loading && !error && data.length > 0 && (
          <Grid gutter="md">
            {data.map((list) => (
              <Grid.Col key={list.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start">
                      <Title order={3}>{list.name}</Title>
                      <Badge size="lg">{list.recipe_count}</Badge>
                    </Group>

                    {list.description && (
                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {list.description}
                      </Text>
                    )}

                    {list.recipes.length > 0 && (
                      <Stack gap="xs">
                        <Text size="sm" fw={500}>
                          Recipes:
                        </Text>
                        {list.recipes.slice(0, 3).map((recipe) => (
                          <Text key={recipe.id} size="sm" c="dimmed">
                            • {recipe.name}
                          </Text>
                        ))}
                        {list.recipes.length > 3 && (
                          <Text size="sm" c="dimmed">
                            ... and {list.recipes.length - 3} more
                          </Text>
                        )}
                      </Stack>
                    )}

                    <Button variant="light" fullWidth mt="auto">
                      View Collection
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
}
