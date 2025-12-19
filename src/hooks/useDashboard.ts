import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/dashboard";

export const useDashboard = () => {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: getDashboard,
  });
};
