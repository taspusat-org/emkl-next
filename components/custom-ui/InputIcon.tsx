import React from 'react';
import { Input } from '../ui/input';

const InputIcon = ({ icon, textIcon, ...props }: any) => {
  return (
    <div className="relative w-full">
      <Input
        {...props}
        className="pr-10" // memberi ruang agar teks tidak tabrakan dengan icon
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
