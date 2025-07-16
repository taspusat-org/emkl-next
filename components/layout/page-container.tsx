import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PageContainer({
  children,
  scrollable = true
}: {
  children: React.ReactNode;
  scrollable?: boolean;
}) {
  return (
    <>
      {scrollable ? (
        <ScrollArea className="h-full bg-[#f4f6f9]">
          <div className="h-full px-4 pb-16 pt-4 md:px-6">{children}</div>
        </ScrollArea>
      ) : (
        <div className="h-full p-4 py-8 md:px-6">{children}</div>
      )}
    </>
  );
}
