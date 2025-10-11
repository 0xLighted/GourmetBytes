import React from 'react';

export default function MarketplaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-gradient-to-br bg-gray-200 dark:bg-gradient-to-br dark:from-dark-gradient-from dark:to-dark-gradient-to min-h-full">
      {children}
    </main>
  );
} 