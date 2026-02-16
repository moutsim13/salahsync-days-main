import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { AppLayout } from "@/components/AppLayout";
import { TodayPage } from "@/pages/Today";
import { BoardPage } from "@/pages/BoardPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { DeedsPage } from "@/pages/Deeds";
import { StatsPage } from "@/pages/Stats";
import { SettingsPage } from "@/pages/SettingsPage";
import { CompletedPage } from "@/pages/Completed";
import { TrashPage } from "@/pages/Trash";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/board" replace />} />
            <Route path="/today" element={<TodayPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/board" element={<BoardPage />} />
            <Route path="/deeds" element={<DeedsPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/completed" element={<CompletedPage />} />
            <Route path="/trash" element={<TrashPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
