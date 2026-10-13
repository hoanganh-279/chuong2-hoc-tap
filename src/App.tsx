import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { PageSkeleton } from "./components/ui";

const ModulePage = lazy(() => import("./pages/ModulePage"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Result = lazy(() => import("./pages/Result"));
const Review = lazy(() => import("./pages/Review"));

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/chu-de/:moduleId/lam-bai" element={<Quiz />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/chu-de/:moduleId" element={<ModulePage />} />
          <Route path="/ket-qua" element={<Result />} />
          <Route path="/on-tap" element={<Review />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
