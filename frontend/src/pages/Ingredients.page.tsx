import { useEffect, useState } from 'react';
import { IconAlertCircle, IconPlus, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
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
  Pagination,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useIngredients } from '../hooks/useIngredients';

export function Ingredients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [pageSize] = useState(12);

  const { data, count, loading, error, goToPage, updateParams, params } = useIngredients({
    limit: pageSize,
  });

  useEffect(() => {
    updateParams({
      search: debouncedSearch || undefined,
      offset: 0,
    });
  }, [debouncedSearch, updateParams]);

  const currentPage = Math.floor((params.offset || 0) / pageSize) + 1;
  const totalPages = Math.ceil(count / pageSize);

  return (
    <Box p="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>Ingredients</Title>
          <Button leftSection={<IconPlus size={18} />}>Add Ingredient</Button>
        </Group>

        <Divider />

        <TextInput
          placeholder="Search ingredients..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

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
            <Text c="dimmed">No ingredients found</Text>
          </Center>
        )}

        {!loading && !error && data.length > 0 && (
          <Grid gutter="md">
            {data.map((ingredient) => (
              <Grid.Col key={ingredient.id} span={{ base: 12, sm: 6, md: 4 }}>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                  onClick={() => navigate(`/ingredients/${ingredient.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Title order={4}>{ingredient.name}</Title>
                      {ingredient.fdc_food_item && (
                        <Badge size="sm" variant="light">
                          From FDC
                        </Badge>
                      )}
                    </Group>

                    {ingredient.plural_name && (
                      <Text size="sm" c="dimmed">
                        Plural: {ingredient.plural_name}
                      </Text>
                    )}

                    {ingredient.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {ingredient.description}
                      </Text>
                    )}

                    {ingredient.grams_per_cup && (
                      <Text size="sm">
                        <Text component="span" fw={500}>
                          {ingredient.grams_per_cup}g
                        </Text>{' '}
                        per cup
                      </Text>
                    )}

                    {ingredient.nutrients && ingredient.nutrients.length > 0 && (
                      <Badge size="sm" variant="outline">
                        {ingredient.nutrients.length} nutrients
                      </Badge>
                    )}
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {totalPages > 1 && (
          <Group justify="space-between" align="center">
            <Text size="sm">
              Showing {Math.min((params.offset || 0) + 1, count)} to{' '}
              {Math.min((params.offset || 0) + pageSize, count)} of {count} ingredients
            </Text>
            <Pagination
              total={totalPages}
              value={currentPage}
              onChange={(page) => goToPage(page - 1)}
              boundaries={1}
              siblings={1}
            />
          </Group>
        )}
      </Stack>
    </Box>
  );
}
