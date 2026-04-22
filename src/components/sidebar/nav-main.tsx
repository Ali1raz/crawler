import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, linkOptions } from '@tanstack/react-router';
import { Bookmark, Import, Compass, type LucideIcon } from 'lucide-react';

interface NavItems {
  title: string;
  icon: LucideIcon;
  to: string;
  activeOptions?: { exact: boolean };
}

const itemLinks = linkOptions([
  {
    to: '/dashboard/import',
    activeOptions: { exact: false },
  },
  {
    to: '/dashboard/items',
    search: { search: undefined, status: undefined },
    activeOptions: { exact: false },
  },
  {
    to: '/dashboard/discover',
    activeOptions: { exact: false },
  },
]);

const items: NavItems[] = [
  {
    title: 'Import',
    icon: Import,
    ...itemLinks[0],
  },
  {
    title: 'Items',
    icon: Bookmark,
    ...itemLinks[1],
  },
  {
    title: 'Discover',
    icon: Compass,
    ...itemLinks[2],
  },
];

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <Link
                  to={item.to}
                  activeOptions={item.activeOptions}
                  activeProps={{
                    className:
                      'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors duration-100',
                  }}
                >
                  <item.icon className="mr-1" />
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
