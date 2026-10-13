import { BrowserRouter, Route, Routes } from "react-router-dom";

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
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/docs" element={<ApiDocs />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
