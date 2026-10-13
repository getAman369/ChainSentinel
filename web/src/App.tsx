import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Layout } from "@components/layout/Layout";

import Home from "@pages/Home";
import History from "@pages/History";
import ApiDocs from "@pages/ApiDocs";
import Settings from "@pages/Settings";
import About from "@pages/About";
import NotFound from "@pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/docs" element={<ApiDocs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
