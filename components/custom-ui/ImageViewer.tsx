'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { FaDownload } from 'react-icons/fa';
import { FaArrowsRotate } from 'react-icons/fa6';
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md';
import { IoMdClose } from 'react-icons/io';

interface ImageModalProps {
  // Bisa berupa satu URL string atau array string/file/blob
  imageUrl: string | string[] | File | File[];
  isOpen: boolean;
  onClose: () => void;
  activeIndex?: number; // Indeks gambar yang aktif
}

const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  isOpen,
  activeIndex,
  onClose
}) => {
  // State untuk zoom dan rotasi gambar
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Ubah properti imageUrl menjadi array, jika bukan array, bungkus dalam array
  const imageList: (string | File)[] = Array.isArray(imageUrl)
    ? imageUrl
    : [imageUrl];

  // State untuk indeks gambar yang tampil
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  // Zoom properties
  const zoomStep = 0.1;
  const zoomMin = 1;
  const zoomMax = 3;

  // Reset scale, rotation, dan current index ketika modal dibuka
  useEffect(() => {
    if (isOpen && !activeIndex) {
      setScale(1);
      setRotation(0);
      setCurrentImageIndex(0);
    }
  }, [isOpen, imageUrl]);
  useEffect(() => {
    if (isOpen && activeIndex) {
      setCurrentImageIndex(activeIndex);
    }
  }, [isOpen, activeIndex]);

  // Handler slider zoom
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScale = parseFloat(e.target.value);
    setScale(newScale >= zoomMin ? newScale : zoomMin);
  };

  // Handler tombol zoom in per langkah
  const handleZoomInStep = () => {
    setScale((prev) => Math.min(prev + zoomStep, zoomMax));
  };

  // Handler tombol zoom out per langkah
  const handleZoomOutStep = () => {
    setScale((prev) => Math.max(prev - zoomStep, zoomMin));
  };

  // Handler rotasi gambar 90 derajat
  const handleRotate = () => {
    setRotation((prev) => prev + 90);
  };

  // Handler download gambar (menggunakan blob dari gambar yang sedang tampil)
  const handleDownload = async () => {
    try {
      const currentImage = imageList[currentImageIndex];
      let fileUrl: string;
      if (currentImage instanceof File) {
        fileUrl = URL.createObjectURL(currentImage); // Jika file, buat URL dari blob
      } else {
        fileUrl = currentImage as string; // Jika URL, gunakan langsung
      }
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'downloadImage.png'; // Ubah nama file jika diperlukan
      link.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Handler untuk tampilkan gambar sebelumnya
  const handlePrevious = () => {
    setCurrentImageIndex((prev) => Math.max(prev - 1, 0));
  };

  // Handler untuk tampilkan gambar selanjutnya
  const handleNext = () => {
    setCurrentImageIndex((prev) => Math.min(prev + 1, imageList.length - 1));
  };

  // Generate a URL for image if it's a File object
  const getImageUrl = (image: string | File) => {
    if (image instanceof File) {
      return URL.createObjectURL(image); // Convert File to Object URL
    }
    // Assuming the environment variable contains the base URL
    const baseUrl = process.env.NEXT_PUBLIC_IMG_URL || '';
    return `${baseUrl}${image}`; // Combine base URL with image path
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle hidden={true}>Karyawan Form</DialogTitle>
      <DialogContent className="h-full min-w-full overflow-hidden bg-white">
        <div
          className="modal-overlay bg-[#e0ecff]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-row justify-between px-2 py-1">
            <p className="text-base font-bold">Image Viewer</p>
            <div
              className="cursor-pointer rounded-md border border-zinc-200 bg-red-500 p-0 hover:bg-red-400"
              onClick={() => {
                onClose();
              }}
            >
              <IoMdClose className="h-5 w-5 font-bold text-white" />
            </div>
          </div>
          <div
            className="modal-content border border-blue-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="image-container">
              <img
                src={getImageUrl(imageList[currentImageIndex])}
                alt="Preview"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease'
                }}
              />
            </div>
            <div className="flex flex-col gap-2 bg-gray-200 p-2 lg:items-center lg:p-2">
              <div className="zoom-slider flex w-[100%] flex-1 items-center">
                <label htmlFor="zoomRange">Zoom:</label>
                {/* Tombol zoom out */}
                <Button
                  className="zoom-btn border border-blue-500 text-blue-500"
                  variant="default"
                  onClick={handleZoomOutStep}
                  aria-label="Zoom Out"
                >
                  –
                </Button>
                {/* Slider zoom */}
                <input
                  id="zoomRange"
                  type="range"
                  min={zoomMin.toString()}
                  max={zoomMax.toString()}
                  step={zoomStep.toString()}
                  value={scale}
                  onChange={handleZoomChange}
                />
                {/* Tombol zoom in */}
                <Button
                  className="zoom-btn border border-blue-500 text-blue-500"
                  variant="default"
                  onClick={handleZoomInStep}
                  aria-label="Zoom In"
                >
                  +
                </Button>
                <span>{scale.toFixed(1)}x</span>
              </div>
              <div className="flex flex-col gap-2 lg:flex-row">
                <div className="flex flex-row justify-between lg:gap-2">
                  <Button
                    onClick={handleRotate}
                    className="gap-1 bg-orange-500 hover:bg-orange-700"
                  >
                    <FaArrowsRotate /> <p>Rotate</p>
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="gap-1 bg-green-600 text-sm font-thin hover:bg-green-700"
                  >
                    <FaDownload /> <p>Download</p>
                  </Button>
                </div>

                <div className="flex w-full flex-row items-center justify-between gap-2 lg:justify-center">
                  <Button
                    onClick={handlePrevious}
                    disabled={currentImageIndex === 0}
                  >
                    <MdSkipPrevious />
                    <p>Previous</p>
                  </Button>

                  <span>
                    PAGE {currentImageIndex + 1} / OF {imageList.length}
                  </span>
                  <Button
                    onClick={handleNext}
                    disabled={currentImageIndex === imageList.length - 1}
                  >
                    <MdSkipNext /> <p>Next</p>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal;
