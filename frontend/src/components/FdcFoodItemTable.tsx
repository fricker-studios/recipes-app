import { useEffect, useState } from 'react';
import { IconAlertCircle, IconEye, IconPlus, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Button,
  Group,
  LoadingOverlay,
  Pagination,
  Select,
  Stack,
  Table,
  TextInput,
} from '@mantine/core';
import type { FdcDataType } from '../api/types';
import { useFdcFoodItem } from '../hooks/useFdcFoodItem';
import { useFdcFoodItems } from '../hooks/useFdcFoodItems';
import { CreateIngredientModal } from './CreateIngredientModal';

const DATA_TYPE_OPTIONS: { value: FdcDataType; label: string }[] = [
  { value: 'Branded', label: 'Branded' },
  { value: 'Foundation', label: 'Foundation' },
  { value: 'Survey (FNDDS)', label: 'Survey (FNDDS)' },
  { value: 'SR Legacy', label: 'SR Legacy' },
];

const INGREDIENT_OPTIONS = [
  { value: 'all', label: 'All Items' },
  { value: 'true', label: 'Has Ingredient' },
  { value: 'false', label: 'No Ingredient' },
];

export function FdcFoodItemTable() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState<string | null>(null);
  const [ingredientFilter, setIngredientFilter] = useState<string>('all');
  const [pageSize] = useState(25);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedFoodItemId, setSelectedFoodItemId] = useState<number | null>(null);
  const [selectedFoodItemDescription, setSelectedFoodItemDescription] = useState<string>('');

  const {
    data,
    count,
    loading,
    error,
    hasNext,
    hasPrevious,
    nextPage,
    previousPage,
    goToPage,
    updateParams,
    params,
  } = useFdcFoodItems({ limit: pageSize });

  const {
    data: foodItemDetail,
    loading: foodItemLoading,
    error: foodItemError,
  } = useFdcFoodItem(selectedFoodItemId);

  useEffect(() => {
    if (selectedFoodItemId && foodItemDetail && !foodItemLoading) {
      setCreateModalOpen(true);
    }
  }, [selectedFoodItemId, foodItemDetail, foodItemLoading]);

  const handleSearch = () => {
    updateParams({
      search: searchValue || undefined,
      dataType: dataTypeFilter as FdcDataType | undefined,
      hasIngredient: ingredientFilter === 'all' ? undefined : ingredientFilter === 'true',
      offset: 0,
    });
  };

  const handleReset = () => {
    setSearchValue('');
    setDataTypeFilter(null);
    setIngredientFilter('all');
    updateParams({
      search: undefined,
      dataType: undefined,
      hasIngredient: undefined,
      offset: 0,
    });
  };

  const currentPage = Math.floor((params.offset || 0) / pageSize) + 1;
  const totalPages = Math.ceil(count / pageSize);

  const handleCreateIngredient = (foodItemId: number, description: string) => {
    setSelectedFoodItemId(foodItemId);
    setSelectedFoodItemDescription(description);
  };

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={loading || foodItemLoading} />

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error.message}
        </Alert>
      )}

      {foodItemError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error Loading Food Item">
          {foodItemError.message}
        </Alert>
      )}

      <Group>
        <TextInput
          placeholder="Search descriptions..."
          leftSection={<IconSearch size={16} />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.currentTarget.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="Data Type"
          data={DATA_TYPE_OPTIONS}
          value={dataTypeFilter}
          onChange={setDataTypeFilter}
          clearable
          style={{ width: 200 }}
        />
        <Select
          placeholder="Ingredient Status"
          data={INGREDIENT_OPTIONS}
          value={ingredientFilter}
          onChange={(value) => setIngredientFilter(value || 'all')}
          style={{ width: 180 }}
        />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={handleReset} variant="subtle">
          Reset
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>FDC ID</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Brand Name</Table.Th>
            <Table.Th>Data Type</Table.Th>
            <Table.Th>Has Ingredient</Table.Th>
            <Table.Th>Detail Fetched</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.length === 0 && !loading ? (
            <Table.Tr>
              <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                No food items found
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.fdc_id}</Table.Td>
                <Table.Td>{item.description}</Table.Td>
                <Table.Td>{item.brand_name}</Table.Td>
                <Table.Td>{item.data_type}</Table.Td>
                <Table.Td>
                  {item.ingredient ? (
                    <Anchor href={`/ingredients/${item.ingredient}`} c="blue">
                      Ingredient #{item.ingredient}
                    </Anchor>
                  ) : (
                    <Anchor
                      c="green"
                      onClick={() => handleCreateIngredient(item.id, item.description)}
                      style={{
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <IconPlus size={14} />
                      Create
                    </Anchor>
                  )}
                </Table.Td>
                <Table.Td>
                  {item.detail_fetch_date
                    ? new Date(item.detail_fetch_date).toLocaleDateString()
                    : 'N/A'}
                </Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconEye size={14} />}
                    onClick={() => navigate(`/fdc/food-items/${item.id}`)}
                  >
                    View
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      <CreateIngredientModal
        opened={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedFoodItemId(null);
        }}
        foodItemId={selectedFoodItemId}
        foodItemDescription={selectedFoodItemDescription}
        foodItemDetail={foodItemDetail?.detail}
      />

      {totalPages > 1 && (
        <Group justify="space-between" align="center">
          <div>
            Showing {Math.min((params.offset || 0) + 1, count)} to{' '}
            {Math.min((params.offset || 0) + pageSize, count)} of {count} items
          </div>
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
  );
}
