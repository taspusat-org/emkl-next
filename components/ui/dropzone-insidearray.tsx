import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaFilePdf } from 'react-icons/fa';
import ImageModal from '../custom-ui/ImageViewer';

interface ImageDropzoneProps {
  onChange: (files: File[] | null) => void;
  value: File[] | string[] | null; // Dapat menerima array File atau URL (string)
  disabled?: boolean; // Tambahkan prop disabled
}

const ImageDropzoneArray: React.FC<ImageDropzoneProps> = ({
  onChange,
  value,
  disabled = false // Menambahkan default disabled = false
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0); // Index for the active image
  useEffect(() => {
    if (value) {
      if (Array.isArray(value)) {
        setFiles(value as File[]);
      } else {
        setFiles([]); // Tidak menambah file lokal saat ada URL
      }
    }
  }, [value]);

  const onDrop = (acceptedFiles: File[]) => {
    if (disabled) return; // Cegah file ditambahkan jika disabled
    const updatedFiles = [...files, ...acceptedFiles];
    setFiles(updatedFiles);
    onChange(updatedFiles); // Mengirimkan files ke form
  };

  const handleRemove = (
    fileToRemove: File | string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Mencegah dialog file upload terbuka
    if (disabled) return; // Cegah penghapusan file jika disabled
    const updatedFiles = files.filter((file) => file !== fileToRemove);
    setFiles(updatedFiles);
    onChange(updatedFiles); // Menghapus file dari form
  };

  const handleImageClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the file dialog from opening
    setActiveImageIndex(index); // Set the active index for the clicked image
    setModalOpen(true); // Open the modal when image is clicked
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
          border: '2px dashed #cccccc',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          backgroundColor: '#f7f7f7',
          cursor: disabled ? 'not-allowed' : 'pointer', // Ganti cursor saat disabled
          padding: '10px',
          minHeight: '150px' // Agar dropzone cukup tinggi saat file di-upload
        }}
      >
        <input {...getInputProps()} disabled={disabled} />
        {files.length === 0 ? (
          <p>
            Drag and drop images or PDF files here, or click to select files
          </p>
        ) : null}

        {/* Preview gambar atau file di dalam dropzone */}
        <div
          className="flex flex-wrap justify-start gap-2"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            width: '100%',
            marginTop: '10px'
          }}
        >
          {files.map((file, index) => (
            <div key={index} className="relative flex flex-col items-center">
              {typeof file === 'string' ? ( // Handle case when file is a URL (from API)
                <img
                  src={file} // Display image from URL
                  className="hover:cursor-zoom-in"
                  onDoubleClick={(event) => handleImageClick(index, event)} // Handle double-click to open modal
                  onClick={(event) => event.stopPropagation()} // Prevent file dialog trigger on single click
                  alt="Preview"
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'contain'
                  }}
                />
              ) : file.type === 'application/pdf' ? (
                <div
                  style={{
                    width: '200px',
                    height: '200px',
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
                  className="hover:cursor-zoom-in"
                  onDoubleClick={(event) => handleImageClick(index, event)} // Handle double-click to open modal
                  onClick={(event) => event.stopPropagation()} // Prevent file dialog trigger on single click
                  style={{
                    width: '200px',
                    height: '200px',
                    objectFit: 'contain'
                  }}
                />
              )}
              <button
                type="button"
                onClick={(event) => handleRemove(file, event)}
                className="absolute right-0 top-0 w-6 rounded-full bg-red-500 p-1 text-white"
                style={{ fontSize: '8px' }}
                disabled={disabled} // Nonaktifkan tombol hapus jika disabled
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        accept="image/*, application/pdf"
        multiple
        style={{ display: 'none' }}
        disabled={disabled} // Nonaktifkan input file jika disabled
      />
      <ImageModal
        imageUrl={files} // Pass the whole array of files to the modal
        activeIndex={activeImageIndex} // Pass the active index to show the correct image
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default ImageDropzoneArray;
