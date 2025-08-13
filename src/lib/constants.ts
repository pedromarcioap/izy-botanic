import { LayoutDashboard, PlusCircle, Library, BarChart3 } from 'lucide-react';

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
    href: '/analysis',
    label: 'Análise de Desempenho',
    icon: BarChart3,
  },
];
