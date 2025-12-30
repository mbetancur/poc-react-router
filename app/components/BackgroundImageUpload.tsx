import { useRef, useState } from "react";

interface BackgroundImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
  currentImageUrl: string | null;
}

const BackgroundImageUpload = ({
  onImageUpload,
  onImageRemove,
  currentImageUrl,
}: BackgroundImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setPreviewUrl(imageUrl);
      onImageUpload(imageUrl);
    };
    reader.onerror = () => {
      alert('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
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
      />
      {previewUrl ? (
        <div className="space-y-2">
          <div className="relative w-full h-24 bg-gray-800 rounded overflow-hidden">
            <img
              src={previewUrl}
              alt="Background preview"
              className="w-full h-full object-contain"
            />
          </div>
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
        </div>
      ) : (
        <button
          onClick={handleButtonClick}
          className="w-full bg-gray-600 text-white text-xs px-2 py-2 rounded hover:bg-gray-700"
          title="Upload background image"
        >
          Upload Image
        </button>
      )}
    </div>
  );
};

export default BackgroundImageUpload;

