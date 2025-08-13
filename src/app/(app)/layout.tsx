'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/logo';
import { NAV_LINKS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent className="flex flex-col">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarMenu className="flex-grow">
            {NAV_LINKS.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isClient ? pathname === link.href : false}
                  tooltip={{
                    children: link.label,
                    side: 'right',
                  }}
                >
                  <Link href={link.href}>
                    <link.icon />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className='grow'></div>
            <UserNav />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function UserNav() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="https://placehold.co/100x100.png" alt="User avatar" data-ai-hint="user avatar" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Usuário</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            estudante@email.com
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
