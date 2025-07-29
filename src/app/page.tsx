import { redirect } from 'next/navigation';

// Metadata for the page
export const metadata = {
  title: 'CMS Platform Dashboard',
};

export default function HomePage() {
  redirect('/auth/jwt/login'); // Redirect to login page
  return null; // Prevents rendering anything
}
