import { create } from "zustand";
import { api } from "@/lib/index";
import { toast } from "sonner";
import { Image, ApiResponse } from "@/types";

interface ImageStore {
  images: Image[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  fetchImages: () => Promise<void>;
  uploadImages: (files: File[], token: string, userId: string) => Promise<void>;
}

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  loading: false,
  uploading: false,
  error: null,

  fetchImages: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get<ApiResponse<Image[]>>("/image/all-images");

      if (response.data.success) {
        set({ images: response.data.data });
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch images";
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  uploadImages: async (files: File[], token: string, userId: string) => {
    try {
      set({ uploading: true, error: null });
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await api.post<ApiResponse<Image[]>>(
        "/image/upload-images",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-clerk-user-id": userId,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        set({ images: response.data.data });
        toast.success(response.data.message);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Error uploading images";
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ uploading: false });
    }
  },
}));
