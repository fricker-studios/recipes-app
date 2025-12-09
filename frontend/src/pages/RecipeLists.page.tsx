import { useState } from 'react';
import {
  IconAlertCircle,
  IconEdit,
  IconEye,
  IconList,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
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
  Loader,
  Menu,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Api } from '../api/Api';
import type { CreateRecipeCollectionRequest, RecipeCollection } from '../api/types';
import { RecipeListDetail } from '../components/RecipeListDetail';
import { RecipeListForm } from '../components/RecipeListForm';
import { RecipeSearchModal } from '../components/RecipeSearchModal';
import { useRecipeLists } from '../hooks/useRecipeLists';

export function RecipeLists() {
  const { data, loading, error, refetch } = useRecipeLists();
  const [formOpened, setFormOpened] = useState(false);
  const [detailOpened, setDetailOpened] = useState(false);
  const [searchOpened, setSearchOpened] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [listToDelete, setListToDelete] = useState<RecipeCollection | null>(null);
  const [editingList, setEditingList] = useState<RecipeCollection | null>(null);
  const [selectedList, setSelectedList] = useState<RecipeCollection | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateOrUpdate = async (formData: CreateRecipeCollectionRequest) => {
    setIsSubmitting(true);
    try {
      if (editingList) {
        await Api.updateRecipeList(editingList.id, formData);
        notifications.show({
          title: 'Success',
          message: 'Collection updated successfully',
          color: 'green',
        });
      } else {
        await Api.createRecipeList(formData);
        notifications.show({
          title: 'Success',
          message: 'Collection created successfully',
          color: 'green',
        });
      }
      await refetch();
      setFormOpened(false);
      setEditingList(null);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to save collection',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (list: RecipeCollection) => {
    setListToDelete(list);
    setDeleteModalOpened(true);
  };

  const confirmDelete = async () => {
    if (!listToDelete) return;

    setIsDeleting(true);
    try {
      await Api.deleteRecipeList(listToDelete.id);
      notifications.show({
        title: 'Success',
        message: 'Collection deleted successfully',
        color: 'green',
      });
      await refetch();
      if (selectedList?.id === listToDelete.id) {
        setDetailOpened(false);
        setSelectedList(null);
      }
      setDeleteModalOpened(false);
      setListToDelete(null);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to delete collection',
        color: 'red',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = async (listId: number) => {
    try {
      const list = await Api.getRecipeList(listId);
      setSelectedList(list);
      setDetailOpened(true);
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to load collection details',
        color: 'red',
      });
    }
  };

  const handleEdit = (list: RecipeCollection) => {
    setEditingList(list);
    setFormOpened(true);
  };

  const handleEditFromDetail = () => {
    if (selectedList) {
      setDetailOpened(false);
      setEditingList(selectedList);
      setFormOpened(true);
    }
  };

  const handleDeleteFromDetail = () => {
    if (selectedList) {
      setDetailOpened(false);
      handleDelete(selectedList);
    }
  };

  const handleAddRecipeToList = async (recipeId: number) => {
    if (!selectedList) return;

    try {
      await Api.addRecipeToList(selectedList.id, recipeId);
      notifications.show({
        title: 'Success',
        message: 'Recipe added to collection',
        color: 'green',
      });
      const updatedList = await Api.getRecipeList(selectedList.id);
      setSelectedList(updatedList);
      await refetch();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to add recipe',
        color: 'red',
      });
      throw err;
    }
  };

  const handleRemoveRecipeFromList = async (recipeId: number) => {
    if (!selectedList) return;

    try {
      await Api.removeRecipeFromList(selectedList.id, recipeId);
      notifications.show({
        title: 'Success',
        message: 'Recipe removed from collection',
        color: 'green',
      });
      const updatedList = await Api.getRecipeList(selectedList.id);
      setSelectedList(updatedList);
      await refetch();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to remove recipe',
        color: 'red',
      });
    }
  };

  const handleOpenCreateForm = () => {
    setEditingList(null);
    setFormOpened(true);
  };

  const handleCloseForm = () => {
    setFormOpened(false);
    setEditingList(null);
  };

  const handleCloseDetail = () => {
    setDetailOpened(false);
    setSelectedList(null);
  };

  return (
    <Box p="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={1}>Recipe Collections</Title>
          <Button leftSection={<IconPlus size={18} />} onClick={handleOpenCreateForm}>
            Create Collection
          </Button>
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
              <Button leftSection={<IconPlus size={18} />} onClick={handleOpenCreateForm}>
                Create your first collection
              </Button>
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
                      <Title order={3} style={{ flex: 1 }}>
                        {list.name}
                      </Title>
                      <Group gap="xs">
                        <Badge size="lg">{list.recipe_count}</Badge>
                        <Menu shadow="md" width={200}>
                          <Menu.Target>
                            <ActionIcon variant="subtle" color="gray">
                              <IconEdit size={18} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item
                              leftSection={<IconEye size={14} />}
                              onClick={() => handleViewDetails(list.id)}
                            >
                              View Details
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconEdit size={14} />}
                              onClick={() => handleEdit(list)}
                            >
                              Edit
                            </Menu.Item>
                            <Menu.Item
                              leftSection={<IconTrash size={14} />}
                              color="red"
                              onClick={() => handleDelete(list)}
                            >
                              Delete
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
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

                    <Button
                      variant="light"
                      fullWidth
                      mt="auto"
                      onClick={() => handleViewDetails(list.id)}
                    >
                      View Collection
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>

      <RecipeListForm
        opened={formOpened}
        onClose={handleCloseForm}
        onSubmit={handleCreateOrUpdate}
        initialData={editingList}
        isLoading={isSubmitting}
      />

      <RecipeListDetail
        opened={detailOpened}
        onClose={handleCloseDetail}
        recipeList={selectedList}
        onAddRecipe={() => setSearchOpened(true)}
        onRemoveRecipe={handleRemoveRecipeFromList}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      <RecipeSearchModal
        opened={searchOpened}
        onClose={() => setSearchOpened(false)}
        onSelectRecipe={handleAddRecipeToList}
        excludeRecipeIds={selectedList?.recipes.map((r) => r.id) || []}
      />

      <Modal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false);
          setListToDelete(null);
        }}
        title="Delete Collection"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete <strong>{listToDelete?.name}</strong>? This action
            cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={() => {
                setDeleteModalOpened(false);
                setListToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color="red"
              leftSection={<IconTrash size={18} />}
              onClick={confirmDelete}
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
