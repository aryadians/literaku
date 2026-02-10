import axiosInstance from "@/lib/api/axios";

export const fetcher = (url: string) =>
  axiosInstance.get(url).then((res) => res.data);
