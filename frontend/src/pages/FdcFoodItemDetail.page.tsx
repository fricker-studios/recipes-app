import { useState } from 'react';
import { IconAlertCircle, IconArrowLeft, IconPlus } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { CreateIngredientModal } from '../components/CreateIngredientModal';
import { JsonViewer } from '../components/JsonViewer';
import { useFdcFoodItem } from '../hooks/useFdcFoodItem';

export function FdcFoodItemDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFdcFoodItem(id ? parseInt(id, 10) : null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleCreateSuccess = (ingredientId: number) => {
    refetch();
    // Could also navigate to ingredient detail page:
    // navigate(`/ingredients/${ingredientId}`);
  };

  if (loading) {
    return (
      <Container size="xl" py="xl" pos="relative" style={{ minHeight: 400 }}>
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error.message}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container size="xl" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="yellow" title="Not Found">
          Food item not found
        </Alert>
      </Container>
    );
  }

  console.log('FDC Food Item Detail Data:', data);

  return (
    <Container size="xl" py="xl">
      <Button
        leftSection={<IconArrowLeft size={16} />}
        variant="subtle"
        onClick={() => navigate(-1)}
        mb="md"
      >
        Back
      </Button>

      <Stack gap="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <div style={{ flex: 1 }}>
                <Title order={2} mb="xs">
                  {data.description}
                </Title>
                {data.brand_name && (
                  <Text size="lg" c="dimmed" mb="xs">
                    {data.brand_name}
                  </Text>
                )}
                <Group gap="xs">
                  <Badge color="blue" variant="light">
                    {data.data_type}
                  </Badge>
                  <Badge color="gray" variant="light">
                    FDC ID: {data.fdc_id}
                  </Badge>
                </Group>
                {data.ingredient ? (
                  <Group gap="xs" mt="xs">
                    <Text size="sm" c="dimmed">
                      Ingredient:
                    </Text>
                    <Anchor href={`/ingredients/${data.ingredient}`} c="blue">
                      View Ingredient #{data.ingredient}
                    </Anchor>
                  </Group>
                ) : (
                  <Button
                    size="xs"
                    variant="light"
                    color="green"
                    leftSection={<IconPlus size={14} />}
                    onClick={() => setCreateModalOpen(true)}
                    mt="xs"
                  >
                    Create Ingredient
                  </Button>
                )}
              </div>
            </Group>

            <Divider />

            <Group>
              <div>
                <Text size="sm" c="dimmed">
                  Database ID
                </Text>
                <Text fw={500}>{data.id}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">
                  Detail Fetched
                </Text>
                <Text fw={500}>
                  {data.detail_fetch_date
                    ? new Date(data.detail_fetch_date).toLocaleString()
                    : 'N/A'}
                </Text>
              </div>
            </Group>
          </Stack>
        </Card>

        {data.detail && (
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <JsonViewer data={data.detail} label="Detail Data" />
          </Card>
        )}

        {!data.detail && (
          <Alert color="gray" title="No Detail Data">
            No detailed information has been fetched for this food item yet.
          </Alert>
        )}
      </Stack>

      <CreateIngredientModal
        opened={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        foodItemId={data.id}
        foodItemDescription={data.description}
        foodItemDetail={data.detail}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
}
