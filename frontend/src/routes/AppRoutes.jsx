import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Admin from "../pages/Admin";
import Chat from "../pages/Chat";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

export default AppRoutes;
