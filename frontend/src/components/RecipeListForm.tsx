import { useEffect } from 'react';
import { Button, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { CreateRecipeCollectionRequest, RecipeCollection } from '../api/types';

interface RecipeListFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRecipeCollectionRequest) => Promise<void>;
  initialData?: RecipeCollection | null;
  isLoading?: boolean;
}

export function RecipeListForm({
  opened,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: RecipeListFormProps) {
  const form = useForm<CreateRecipeCollectionRequest>({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (!value || value.trim().length === 0 ? 'Name is required' : null),
    },
  });

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.setValues({
        name: initialData.name,
        description: initialData.description || '',
      });
    } else {
      form.reset();
    }
  }, [initialData]);

  const handleSubmit = async (values: CreateRecipeCollectionRequest) => {
    try {
      await onSubmit(values);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Failed to save recipe list:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={<Text fw={600}>{initialData ? 'Edit Collection' : 'Create New Collection'}</Text>}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter collection name"
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Description"
            placeholder="Enter collection description (optional)"
            minRows={3}
            {...form.getInputProps('description')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {initialData ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
