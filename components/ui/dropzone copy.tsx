import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFilePdf } from 'react-icons/fa';

interface ImageDropzoneProps {
  onChange: (files: File[] | null) => void;
  value: File[] | string[] | null; // Dapat menerima array File atau URL (string)
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onChange, value }) => {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (value) {
      // Jika value adalah array file, set sebagai state files
      if (Array.isArray(value)) {
        setFiles(value as File[]);
      } else {
        // Jika value adalah array URL gambar, tampilkan pratinjau gambar
        setFiles([]); // Tidak menambah file lokal saat ada URL
      }
    }
  }, [value]);

  const onDrop = (acceptedFiles: File[]) => {
    const updatedFiles = [...files, ...acceptedFiles];
    setFiles(updatedFiles);
    onChange(updatedFiles); // Mengirimkan files ke form
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const updatedFiles = [...files, ...selectedFiles];
    setFiles(updatedFiles);
    onChange(updatedFiles); // Mengirimkan files ke form
  };

  const handleRemove = (fileToRemove: File | string) => {
    const updatedFiles = files.filter((file) => file !== fileToRemove);
    setFiles(updatedFiles);
    onChange(updatedFiles); // Menghapus file dari form
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] }, // Terima file gambar dan PDF
    onDrop
  });

  return (
    <div className="w-auto">
      <div
        {...getRootProps({ className: 'dropzone' })}
        style={{
          width: '100%',
          height: '50px',
          border: '2px dashed #cccccc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: '#f7f7f7',
          cursor: 'pointer'
        }}
      >
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <p className="hidden lg:block">
            Drag and drop images or PDF files here, or click to select files
          </p>
        ) : (
          <p>{files.length} file(s) selected</p>
        )}
      </div>

      <div className="max-w-500px mt-3 flex flex-wrap gap-2">
        {files.map((file, index) => (
          <div key={index} className="relative">
            {typeof file === 'string' ? ( // Handle case when file is a URL (from API)
              <img
                src={file} // Display image from URL
                alt="Preview"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain'
                }}
              />
            ) : file.type === 'application/pdf' ? (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  backgroundColor: '#fff'
                }}
              >
                <FaFilePdf size={40} color="#ff0000" />
              </div>
            ) : (
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                style={{
                  width: '80px',
                  height: '80px',
                  objectFit: 'contain'
                }}
              />
            )}
            <button
              onClick={() => handleRemove(file)}
              className="absolute right-0 top-0 w-6 rounded-full bg-red-500 p-1 text-white"
              style={{ fontSize: '8px' }}
            >
              X
            </button>
          </div>
        ))}
      </div>

      <input
        id="file-input"
        type="file"
        accept="image/*, application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
    </div>
  );
};

export default ImageDropzone;
