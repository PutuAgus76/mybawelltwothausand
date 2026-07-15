// app/admin/login/page.tsx — Server Component wrapper
// dynamic = 'force-dynamic' berfungsi di Server Component
export const dynamic = 'force-dynamic';

import LoginForm from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return <LoginForm />;
}
