// src/utils/fileUrl.ts
export const getFileUrl = (path: string) =>
  `${import.meta.env.VITE_API_BASE_URL}${path}`;
