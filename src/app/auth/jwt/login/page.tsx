// sections
import { JwtLoginView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'احرازهویت پیشخوان',
};

export default function LoginPage() {
  return <JwtLoginView />;
}
