import { Navigate, Outlet } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const ProtectedRoute = () => {
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  useEffect(() => {
    // If there is no token, show a quick toast message explaining why they were redirected
    if (!token) {
      toast({
        title: "Access Denied",
        description: "Please log in to view this page.",
        variant: "destructive",
      });
    }
  }, [token, toast]);

  // If the user is NOT logged in, redirect them to the auth page
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  // If they ARE logged in, render the child route they were trying to visit
  return <Outlet />;
};

export default ProtectedRoute;