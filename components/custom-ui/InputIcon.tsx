import React from 'react';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';

const InputIcon = ({ icon, textIcon, readOnly, className, ...props }: any) => {
  return (
    <div className="relative w-full">
      <Input
        {...props}
        className={cn(
          'pr-10',
          readOnly ? 'text-zinc-400' : '',
          'tracking-normal', // Add this class for normal letter spacing
          className
        )} // memberi ruang agar teks tidak tabrakan dengan icon
      />
      {icon ||
        (textIcon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[30px] items-center justify-center rounded-br-sm rounded-tr-sm border border-[#ced4da] bg-[#e9ecef]">
            {icon ? icon : textIcon}
          </div>
        ))}
    </div>
  );
};

export default InputIcon;
