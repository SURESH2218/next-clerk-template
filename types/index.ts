export interface Image {
  id: number;
  url: string;
  cloudinaryId: string;
  userId: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    profileImage: string;
  };
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
