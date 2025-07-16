import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { FaUpload } from 'react-icons/fa';
import Image from 'next/image';

interface ImageDropzoneProps {
  onChange: (file: File | null) => void;
  value: File | string | null; // Can be either a File or a string (URL)
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onChange, value }) => {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (typeof value === 'string' && value) {
      // If value is a string (URL), don't treat it as a file
      setFile(null);
    } else if (value instanceof File) {
      // If value is a file, set it
      setFile(value);
    }
  }, [value]);

  const onDrop = (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      onChange(selectedFile); // Send the file to the parent component
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onChange(selectedFile); // Send the file to the parent component
    }
  };

  const handleRemove = () => {
    setFile(null);
    onChange(null); // Remove the file from the parent component
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] }, // Only accept image files
    onDrop
  });

  return (
    <div className="w-fit">
      <div
        {...getRootProps({ className: 'dropzone' })}
        style={{
          width: '300px',
          height: '300px',
          border: '2px dashed #cccccc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: '#f7f7f7',
          cursor: 'pointer'
        }}
      >
        <input id="image-dropzone" {...getInputProps()} />
        {file ? (
          <img
            src={URL.createObjectURL(file)} // Display the preview of the uploaded image
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        ) : typeof value === 'string' && value ? (
          <img
            src={`${process.env.NEXT_PUBLIC_IMG_URL}/medium_${value}`} // Fallback to <img> tag
            alt="Preview"
            width={200}
            height={200}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        ) : (
          <p>Drag and drop an image here, or click to select one</p>
        )}
      </div>

      <div className="mt-3 flex flex-row justify-between gap-2">
        <Button
          type="button"
          onClick={handleRemove}
          variant="default"
          className="w-[10%] bg-red-700 hover:bg-red-500"
        >
          X
        </Button>
        <Button
          type="button"
          onClick={() => document.getElementById('file-input')?.click()}
          variant="default"
          className="flex w-full items-center gap-1"
        >
          <FaUpload /> <p className="text-center text-sm">Upload</p>
        </Button>
      </div>

      <input
        id="file-input"
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default ImageDropzone;
