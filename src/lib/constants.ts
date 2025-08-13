import { LayoutDashboard, PlusCircle, Library, BarChart3, MessageSquare } from 'lucide-react';

export const NAV_LINKS = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/generate',
    label: 'Gerar Quiz',
    icon: PlusCircle,
  },
  {
    href: '/library',
    label: 'Biblioteca',
    icon: Library,
  },
  {
      href: '/chat',
      label: 'Mentor IA',
      icon: MessageSquare
  },
  {
    href: '/analysis',
    label: 'Análise',
    icon: BarChart3,
  },
];
