import { Box, Paper } from '@mantine/core';
import { FdcFoodItemTable } from '@/components/FdcFoodItemTable';

export function FdcFoodItems() {
  return (
    <Box m="xl">
      <Paper withBorder shadow="sm" p="lg" radius="md">
        <FdcFoodItemTable />
      </Paper>
    </Box>
  );
}
