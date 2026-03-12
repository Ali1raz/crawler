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

const items: NavItems[] = linkOptions([
  {
    title: 'Import',
    icon: Import,
    to: '/dashboard/import',
    activeOptions: { exact: false },
  },
  {
    title: 'Items',
    icon: Bookmark,
    to: '/dashboard/items',
    activeOptions: { exact: false },
  },
  {
    title: 'Discover',
    icon: Compass,
    to: '/dashboard/discover',
    activeOptions: { exact: false },
  },
]);

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <Link to={item.to} activeOptions={item.activeOptions}>
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
