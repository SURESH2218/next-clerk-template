"use client";

import Image from "next/image";
import { toast } from "sonner";
import { useAuth, useUser } from "@clerk/nextjs";
import { Image as ImageType } from "@/types";
import { useDropzone } from "react-dropzone";
import { useState, useCallback, useEffect } from "react";
import { useImageStore } from "@/store/useImageStore";

export default function Page() {
  const { isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const [previews, setPreviews] = useState<string[]>([]);
  const [showAllImages, setShowAllImages] = useState(true);

  const { images, uploading, fetchImages, uploadImages } = useImageStore();

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const displayedImages = showAllImages
    ? images
    : images.filter((image: ImageType) => image.userId === userId);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [previews]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 5) {
        toast.error("Maximum 5 images allowed");
        return;
      }

      const newPreviews = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

      try {
        const token = await getToken();
        if (!token || !userId) return;

        await uploadImages(acceptedFiles, token, userId);
        setPreviews([]);
        await fetchImages();
        setShowAllImages(true);
      } catch (error) {
        console.error("Upload error:", error);
      }
    },
    [userId, getToken, uploadImages, fetchImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 5,
  });

  return (
    <div className="containermx-auto py-8 px-4 relative">
      <div className="w-[80%] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Upload Images
          </h1>
          <p>
            Hello <span className="font-bold">{user?.firstName}</span>, you can
            upload up to 5 images at once
          </p>
        </div>

        {!isSignedIn && (
          <div>
            <h1 className="shadow-md inline-block p-2 rounded-md">
              Please sign in to upload images
            </h1>
          </div>
        )}

        {isSignedIn && (
          <>
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-blue-500">Drop the images here...</p>
              ) : (
                <p>Drag & drop images here, or click to select files</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Maximum 5 images allowed
              </p>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllImages}
                  onChange={(e) => setShowAllImages(e.target.checked)}
                  className="mr-2"
                />
                Show all user images
              </label>
            </div>
          </>
        )}

        {previews.length > 0 && (
          <div className="mt-8 border-2 border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {displayedImages.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              {showAllImages ? "All Uploaded Images" : "Your Uploaded Images"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {displayedImages.map((image) => (
                <div
                  key={image.id}
                  className="relative w-full border-2 border-gray-300 rounded-lg p-4 shadow-md"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="relative h-5 w-5">
                        <Image
                          src={image.user.profileImage}
                          alt={`${image.user.firstName}'s profile`}
                          fill
                          className="object-cover rounded-full"
                        />
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <h1>{image.user.firstName}</h1>
                        <h1>{image.user.lastName}</h1>
                      </div>
                    </div>
                    <div className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={`Uploaded by ${image.user.firstName}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploading && (
          <div className="mt-4 text-center absolute top-0 right-10">
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg">
              Uploading images...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
