import { useRef, useState, useEffect } from "react";

interface BackgroundImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
  currentImageUrl: string | null;
}

const compressImage = (file: File, quality: number = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // TODO Valite if we want full size for every pic
        // Keep original dimensions - no resizing
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob'));
              return;
            }
            const objectUrl = URL.createObjectURL(blob);
            resolve(objectUrl);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

const BackgroundImageUpload = ({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
}: BackgroundImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Image size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    try {
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
        lastObjectUrlRef.current = null;
      }

      // Compress image while keeping original dimensions
      const compressedImageUrl = await compressImage(file, 0.75);
      lastObjectUrlRef.current = compressedImageUrl;
      onImageUpload(compressedImageUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    if (lastObjectUrlRef.current) {
      URL.revokeObjectURL(lastObjectUrlRef.current);
      lastObjectUrlRef.current = null;
    }
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-2 border-t border-gray-600">
      <div className="text-sm font-medium mb-2">Background Image</div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />
      {isProcessing && (
        <div className="text-xs text-gray-400 mb-2">Processing image...</div>
      )}
      {currentImageUrl ? (
        <div className="flex gap-2">
          <button
            onClick={handleButtonClick}
            className="flex-1 bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700"
            title="Change image"
          >
            Change
          </button>
          <button
            onClick={handleRemove}
            className="flex-1 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
            title="Remove image"
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          onClick={handleButtonClick}
          className="w-full bg-gray-600 text-white text-xs px-2 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
          title="Upload background image"
          disabled={isProcessing}
        >
          Upload Image
        </button>
      )}
    </div>
  );
};

export default BackgroundImageUpload;

