/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { mobile } from './utils';
import { DELETE_CONTENT_BACKWARD } from './constants';

function ReactInputDateMask({
  mask = 'dd-mm-yyyy',
  showMaskOnFocus = false,
  showMaskOnHover = false,
  value: inputValue = '',
  className = '',
  onChange,
  disabled = false,
  readOnly = false
}) {
  const [value, setValue] = useState('');
  const [toggleCursor, setCursor] = useState(false);
  const [positionCursor, setPosCursor] = useState({
    start: 0,
    end: 1
  });
  const [letterObject, setLetterObject] = useState({});
  const [moveCursor, setMoveCursor] = useState({
    start: '',
    end: ''
  });
  const [maskOnFocus, setMaskOnFocus] = useState(false);
  const [statePlaceholder, setStatePlaceholder] = useState('');
  const myRef = useRef(null);

  useEffect(() => {
    myRef.current.setSelectionRange(positionCursor.start, positionCursor.end);
  }, [positionCursor.start, positionCursor.end, toggleCursor]);

  useEffect(() => {
    myRef.current.setSelectionRange(moveCursor.start, moveCursor.end);
  }, [moveCursor.start, moveCursor.end]);

  useEffect(() => {
    const value = inputValue ? inputValue : mask;
    const valueObject = createObject(value);
    setValue(valueObject);
    if (!showMaskOnFocus || inputValue) setMaskOnFocus(true);
  }, [inputValue, showMaskOnFocus]);

  useEffect(() => {
    const letterObject = createObject(mask);
    setLetterObject(letterObject);
    myRef.current.setSelectionRange(0, 1);
  }, [mask]);

  const onFocus = (e) => {
    if (showMaskOnFocus && !maskOnFocus) {
      setMaskOnFocus(true);
      setStatePlaceholder('');
    }

    const valueString = Object.values(value).join('');

    let lastEditablePos = valueString.lastIndexOf(/[0-9]/);

    const isFullDate =
      valueString.length === mask.length &&
      !valueString.includes('d') &&
      !valueString.includes('m') &&
      !valueString.includes('y');

    if (isFullDate) {
      lastEditablePos = valueString.length;
    } else {
      if (lastEditablePos === -1) {
        lastEditablePos = 0;
      } else {
        lastEditablePos += 1;
      }
    }

    setTimeout(() => {
      myRef.current.setSelectionRange(lastEditablePos, lastEditablePos);
    }, 0);
  };

  const onBlur = (e) => {
    const valueString = Object.values(value).join('');
    const year = valueString.slice(6, 8);

    if (year.length === 2 && valueString.length >= 8) {
      const fullYear = parseInt(year, 10) < 50 ? `20${year}` : `19${year}`;
      const updatedValue = valueString.slice(0, 6) + fullYear;
      setValue(createObject(updatedValue));
      onChange?.(updatedValue);
    }
  };

  const createObject = (string) => {
    let newObject = {};
    [...string].forEach((el, index) => {
      newObject[index + 1] = el;
    });
    return newObject;
  };

  const onInput = (e) => {
    let {
      target: { selectionStart, selectionEnd, value: curValue },
      nativeEvent: { inputType }
    } = e;

    // Menghindari penghapusan mask (d, m, y)
    if (inputType === 'deleteContentBackward') {
      const valueArray = [...curValue];
      const newPositionStart = selectionStart - 1;

      // Tentukan posisi yang tidak boleh dihapus (mask: d, m, y)
      if (
        [2, 5, 8].includes(newPositionStart) // Posisi mask di dd-mm-yyyy
      ) {
        e.preventDefault(); // Jangan hapus mask
        return;
      }

      // Jika posisi yang dihapus adalah angka, biarkan dihapus
      const newValue = valueArray[newPositionStart];
      const reg = /[\d]/g;
      const isValidValue = reg.test(newValue);

      if (isValidValue && selectionStart < 11) {
        const valueString = Object.values({
          ...value,
          [selectionStart]: newValue
        }).join('');
        const updatedValue =
          valueString.slice(0, newPositionStart) +
          ' ' +
          valueString.slice(newPositionStart + 1);
        setValue(createObject(updatedValue));
        onChange?.(updatedValue);
      }
    } else {
      // Logika biasa untuk memasukkan nilai
      const valueArray = [...curValue];
      const newPositionStart = selectionStart - 1;
      const newValue = valueArray[newPositionStart];
      const reg = /[\d]/g;
      const isValidValue = reg.test(newValue);
      let newState;

      if (isValidValue && selectionStart < 11) {
        const valueString = Object.values({
          ...value,
          [selectionStart]: newValue
        }).join('');
        newState = { ...value, [selectionStart]: newValue };
        setValue(newState);
        const newSelectionStart =
          selectionStart === 2 || selectionStart === 5
            ? selectionStart + 1
            : selectionStart;
        const newSelectionEnd =
          selectionStart === 2 || selectionStart === 5
            ? selectionEnd + 2
            : selectionEnd + 1;
        setPosCursor({
          ...positionCursor,
          start: newSelectionStart,
          end: newSelectionEnd
        });
      } else {
        newState = { ...value };
      }

      onChange?.(Object.values(newState).join(''));
    }
  };

  const newState =
    Object.keys(value)?.length > 0 ? Object.values(value).join('') : value;
  return (
    <input
      ref={myRef}
      placeholder={statePlaceholder}
      type="tel"
      className={className}
      spellCheck="false"
      onInput={onInput}
      onFocus={onFocus}
      value={maskOnFocus ? newState : ''}
      autoComplete="off"
      disabled={disabled}
      readOnly={readOnly}
    ></input>
  );
}

export { ReactInputDateMask as default };
