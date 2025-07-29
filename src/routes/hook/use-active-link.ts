import { usePathname } from 'next/navigation';

// ----------------------------------------------------------------------

type ReturnType = boolean;

export function useActiveLink(path: string = '', deep = true): ReturnType {
  const pathname = usePathname();

  if (!path) return false; // Prevents errors if path is undefined

  const checkPath = path.startsWith('#');

  const currentPath = path === '/' ? '/' : `${path}/`;

  const normalActive = !checkPath && pathname === currentPath;

  const deepActive = !checkPath && pathname.includes(currentPath);

  return deep ? deepActive : normalActive;
}
