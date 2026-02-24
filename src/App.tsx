import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Features from "./pages/Features";
import NotFound from "./pages/NotFound";
import Questionnaire from "./pages/Questionnaire";
import Recommendations from "./pages/Recommendations";


const queryClient = new QueryClient();

const router = createBrowserRouter(
  [
    { path: "/", element: <Index /> },
    { path: "/auth", element: <Auth /> },
    { path: "/features", element: <Features /> },
    { path: "*", element: <NotFound /> },
    {path: "/questionnaire", element: <Questionnaire /> },
    { path: "/recommendations", element: <Recommendations /> },
  ],
);

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
