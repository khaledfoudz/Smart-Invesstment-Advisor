import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Import your pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Features from "./pages/Features";
import NotFound from "./pages/NotFound";
import Questionnaire from "./pages/Questionnaire";
import Recommendations from "./pages/Recommendations";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile"; 


// Import the new ProtectedRoute
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  // Public Routes (Anyone can see these)
  { path: "/", element: <Index /> },
  { path: "/auth", element: <Auth /> },
  { path: "/features", element: <Features /> },
  
  // Protected Routes (Only logged-in users can see these)
  {
    element: <ProtectedRoute />, // This wrapper guards all the children below!
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/questionnaire", element: <Questionnaire /> },
      { path: "/recommendations", element: <Recommendations /> },

      { path: "/profile", element: <Profile /> },
    ],
  },

  // Catch-all for 404
  { path: "*", element: <NotFound /> },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <SonnerToaster />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;