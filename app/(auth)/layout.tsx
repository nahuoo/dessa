import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autenticación - DessaTech',
  description: 'Plataforma para profesionales de salud mental',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
