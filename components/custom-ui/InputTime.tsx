// TimeInput.js
import React, { useState } from 'react';
import InputMask from 'react-input-mask';

function TimeInput() {
  const [time, setTime] = useState('12:00');
  const startWithTwo = time[0] === '2';
  const otherCases = ['0', '1'].includes(time[0]);
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setTime(value);
  };

  const mask = [
    /[0-2]/,
    startWithTwo ? /[0-3]/ : otherCases ? /[0-9]/ : /[0-0]/, // Ensure a valid RegExp is always returned
    ':',
    /[0-5]/,
    /[0-9]/
  ];
  return <InputMask mask={mask} onChange={handleInput} value={time} />;
}

export default TimeInput;
