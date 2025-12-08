import { IconCarrot, IconChefHat, IconDatabase, IconList, IconSettings } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppShell, Burger, Group, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/recipes', label: 'Recipes', icon: IconChefHat },
    { path: '/ingredients', label: 'Ingredients', icon: IconCarrot },
    { path: '/lists', label: 'Collections', icon: IconList },
    {
      path: '/fdc',
      label: 'FDC Database',
      icon: IconDatabase,
      children: [
        { path: '/fdc/settings', label: 'Settings', icon: IconSettings },
        { path: '/fdc', label: 'Food Items', icon: IconDatabase },
      ],
    },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Group style={{ flex: 1 }}>
            <IconChefHat size={28} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Recipe Manager</span>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            label={item.label}
            leftSection={<item.icon size={20} stroke={1.5} />}
            active={
              !item.children &&
              (location.pathname === item.path || location.pathname.startsWith(item.path + '/'))
            }
            onClick={() => {
              if (!item.children) {
                navigate(item.path);
                if (opened) toggle();
              }
            }}
            style={{ borderRadius: 'var(--mantine-radius-sm)' }}
            childrenOffset={28}
          >
            {item.children &&
              item.children.map((child) => (
                <NavLink
                  key={child.path}
                  label={child.label}
                  leftSection={<child.icon size={18} stroke={1.5} />}
                  active={location.pathname === child.path}
                  onClick={() => {
                    navigate(child.path);
                    if (opened) toggle();
                  }}
                  style={{ borderRadius: 'var(--mantine-radius-sm)' }}
                />
              ))}
          </NavLink>
        ))}
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
