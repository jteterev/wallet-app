import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthProvider, { RequireAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Expenses from "./pages/Expenses";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthProvider />,
    children: [
      { index: true, element: <Login /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "expenses",
        element: (
          <RequireAuth>
            <Expenses />
          </RequireAuth>
        ),
      },
      {
        path: "analytics",
        element: (
          <RequireAuth>
            <Analytics />
          </RequireAuth>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

