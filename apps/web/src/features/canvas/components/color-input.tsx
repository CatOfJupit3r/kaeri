import { useCallback, useState } from 'react';

import { Input } from '@~/components/ui/input';
import { cn } from '@~/lib/utils';

import { isValidHexColor } from '../canvas.types';

interface iColorInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export default function ColorInput({ value, onChange, label, className }: iColorInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      if (isValidHexColor(newValue)) {
        setIsValid(true);
        onChange(newValue);
      } else {
        setIsValid(false);
      }
    },
    [onChange],
  );

  const handleColorPickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      setIsValid(true);
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? <label className="text-sm font-medium">{label}</label> : null}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isValidHexColor(inputValue) ? inputValue : '#000000'}
          onChange={handleColorPickerChange}
          className="h-9 w-12 cursor-pointer appearance-none border-2 border-foreground bg-transparent p-0.5"
        />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder="#000000"
          className={cn('flex-1 font-mono text-sm', !isValid && 'border-destructive')}
          maxLength={7}
        />
      </div>
      {!isValid && <span className="text-xs text-destructive">Invalid hex color format</span>}
    </div>
  );
}
