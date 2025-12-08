import { useEffect, useState } from 'react';
import { IconAlertCircle, IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Checkbox,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Api } from '../api/Api';
import { useFdcSettings } from '../hooks/useFdcSettings';

export function FdcSettings() {
  const { data, loading, error, refetch } = useFdcSettings();
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [triggeringTask, setTriggeringTask] = useState<string | null>(null);
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setSelectedDataTypes(data.enabled_data_types);
    }
  }, [data]);

  const handleToggle = (dataType: string) => {
    setSelectedDataTypes((prev) =>
      prev.includes(dataType) ? prev.filter((dt) => dt !== dataType) : [...prev, dataType]
    );
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await Api.updateFdcSettings(selectedDataTypes);
      setSaveSuccess(true);
      await refetch();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerTask = async (taskName: string) => {
    setTriggeringTask(taskName);
    setTaskError(null);
    setTaskSuccess(null);

    try {
      const result = await Api.triggerFdcTask(taskName);
      setTaskSuccess(result.message);
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'Failed to trigger task');
    } finally {
      setTriggeringTask(null);
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
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const hasChanges =
    JSON.stringify([...selectedDataTypes].sort()) !==
    JSON.stringify([...data.enabled_data_types].sort());

  return (
    <Box p="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>FDC Settings</Title>
          <Text size="sm" c="dimmed" mt="xs">
            Configure which FoodData Central data types to fetch and maintain
          </Text>
        </div>

        <Divider />

        {saveError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Save Error">
            {saveError}
          </Alert>
        )}

        {saveSuccess && (
          <Alert color="green" title="Success">
            Settings saved successfully
          </Alert>
        )}

        {taskSuccess && (
          <Alert color="green" title="Task Queued">
            {taskSuccess}
          </Alert>
        )}

        {taskError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Task Error">
            {taskError}
          </Alert>
        )}

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={3}>Enabled Data Types</Title>
              <Text size="sm" c="dimmed" mt="xs">
                Select which FoodData Central data types to sync. Changes will affect the next
                scheduled data fetch.
              </Text>
            </div>

            <Stack gap="sm">
              {data.available_data_types.map((dataType) => (
                <Checkbox
                  key={dataType}
                  label={dataType}
                  checked={selectedDataTypes.includes(dataType)}
                  onChange={() => handleToggle(dataType)}
                  disabled={isSaving}
                />
              ))}
            </Stack>

            {selectedDataTypes.length === 0 && (
              <Alert color="yellow" title="Warning">
                At least one data type should be selected to fetch data from FoodData Central.
              </Alert>
            )}

            <Group justify="flex-end" mt="md">
              <Button
                leftSection={<IconDeviceFloppy size={18} />}
                onClick={handleSave}
                loading={isSaving}
                disabled={!hasChanges || selectedDataTypes.length === 0}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={3}>Manual Task Triggers</Title>
              <Text size="sm" c="dimmed" mt="xs">
                Manually trigger background tasks to fetch and update FDC data. These tasks will run
                asynchronously in the background.
              </Text>
            </div>

            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <div>
                  <Text fw={500}>Fetch Food Items</Text>
                  <Text size="sm" c="dimmed">
                    Fetches the list of food items from FDC for enabled data types
                  </Text>
                </div>
                <Button
                  leftSection={<IconRefresh size={18} />}
                  onClick={() => handleTriggerTask('fetch_food_items')}
                  loading={triggeringTask === 'fetch_food_items'}
                  disabled={triggeringTask !== null}
                  variant="light"
                >
                  Trigger
                </Button>
              </Group>

              <Divider />

              <Group justify="space-between" align="center">
                <div>
                  <Text fw={500}>Fetch Missing Food Details</Text>
                  <Text size="sm" c="dimmed">
                    Fetches detailed information for food items that don't have details yet (up to
                    1000)
                  </Text>
                </div>
                <Button
                  leftSection={<IconRefresh size={18} />}
                  onClick={() => handleTriggerTask('fetch_missing_food_details')}
                  loading={triggeringTask === 'fetch_missing_food_details'}
                  disabled={triggeringTask !== null}
                  variant="light"
                >
                  Trigger
                </Button>
              </Group>

              <Divider />

              <Group justify="space-between" align="center">
                <div>
                  <Text fw={500}>Fetch Outdated Food Details</Text>
                  <Text size="sm" c="dimmed">
                    Updates food items with outdated details based on expiry settings (up to 1000)
                  </Text>
                </div>
                <Button
                  leftSection={<IconRefresh size={18} />}
                  onClick={() => handleTriggerTask('fetch_outdated_food_details')}
                  loading={triggeringTask === 'fetch_outdated_food_details'}
                  disabled={triggeringTask !== null}
                  variant="light"
                >
                  Trigger
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}
