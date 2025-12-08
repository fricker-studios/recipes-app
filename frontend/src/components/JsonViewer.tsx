import { useState } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { ActionIcon, Box, Code, Collapse, Group, Stack, Text } from '@mantine/core';

interface JsonViewerProps {
  data: any;
  label?: string;
  defaultExpanded?: boolean;
}

interface JsonNodeProps {
  value: any;
  name?: string;
  level?: number;
  defaultExpanded?: boolean;
}

function JsonNode({ value, name, level = 0, defaultExpanded = true }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const indent = level * 20;

  // Handle null
  if (value === null) {
    return (
      <Box pl={indent}>
        <Group gap={4} wrap="nowrap">
          {name && (
            <Text span c="blue.6" size="sm">
              {name}:
            </Text>
          )}
          <Text span c="dimmed" size="sm" fs="italic">
            null
          </Text>
        </Group>
      </Box>
    );
  }

  // Handle primitives
  if (typeof value !== 'object') {
    const color =
      typeof value === 'string' ? 'green.7' : typeof value === 'number' ? 'orange.6' : 'grape.6';
    const displayValue = typeof value === 'string' ? `"${value}"` : String(value);

    return (
      <Box pl={indent}>
        <Group gap={4} wrap="nowrap">
          {name && (
            <Text span c="blue.6" size="sm">
              {name}:
            </Text>
          )}
          <Text span c={color} size="sm" style={{ wordBreak: 'break-all' }}>
            {displayValue}
          </Text>
        </Group>
      </Box>
    );
  }

  // Handle arrays
  if (Array.isArray(value)) {
    const isEmpty = value.length === 0;

    return (
      <Box pl={indent}>
        <Group gap={4} wrap="nowrap">
          {!isEmpty && (
            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={() => setExpanded(!expanded)}
              style={{ cursor: 'pointer' }}
            >
              {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            </ActionIcon>
          )}
          {name && (
            <Text span c="blue.6" size="sm">
              {name}:
            </Text>
          )}
          <Text span c="dimmed" size="sm">
            [{isEmpty ? '' : value.length}]
          </Text>
          {isEmpty && (
            <Text span c="dimmed" size="sm" fs="italic">
              (empty)
            </Text>
          )}
        </Group>

        {!isEmpty && (
          <Collapse in={expanded}>
            <Box mt={4}>
              {value.map((item, index) => (
                <JsonNode
                  key={index}
                  value={item}
                  name={String(index)}
                  level={level + 1}
                  defaultExpanded={level < 1}
                />
              ))}
            </Box>
          </Collapse>
        )}
      </Box>
    );
  }

  // Handle objects
  const keys = Object.keys(value);
  const isEmpty = keys.length === 0;

  return (
    <Box pl={indent}>
      <Group gap={4} wrap="nowrap">
        {!isEmpty && (
          <ActionIcon
            size="xs"
            variant="subtle"
            onClick={() => setExpanded(!expanded)}
            style={{ cursor: 'pointer' }}
          >
            {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
          </ActionIcon>
        )}
        {name && (
          <Text span c="blue.6" size="sm">
            {name}:
          </Text>
        )}
        <Text span c="dimmed" size="sm">
          {'{'}
          {isEmpty
            ? '}'
            : keys.length > 0
              ? `${keys.length} ${keys.length === 1 ? 'key' : 'keys'}`
              : ''}
          {!isEmpty && '}'}
        </Text>
        {isEmpty && (
          <Text span c="dimmed" size="sm" fs="italic">
            (empty)
          </Text>
        )}
      </Group>

      {!isEmpty && (
        <Collapse in={expanded}>
          <Box mt={4}>
            {keys.map((key) => (
              <JsonNode
                key={key}
                value={value[key]}
                name={key}
                level={level + 1}
                defaultExpanded={level < 1}
              />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

export function JsonViewer({ data, label, defaultExpanded = true }: JsonViewerProps) {
  return (
    <Stack gap="xs">
      {label && (
        <Text fw={500} size="lg">
          {label}
        </Text>
      )}
      <Box
        p="md"
        style={(theme) => ({
          backgroundColor: theme.colors.gray[0],
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.colors.gray[3]}`,
          fontFamily: 'monospace',
          maxHeight: '600px',
          overflowY: 'auto',
        })}
      >
        <JsonNode value={data} level={0} defaultExpanded={defaultExpanded} />
      </Box>
    </Stack>
  );
}
