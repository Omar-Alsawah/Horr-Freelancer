import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from '../components/layout/RootLayout';
import Home from '../pages/Home';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
