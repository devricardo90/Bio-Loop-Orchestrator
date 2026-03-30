import { Suspense } from "react";
import { LoginPanel } from "../../components/login-panel";

export const metadata = {
  title: "Login",
  description: "Role-based authentication for Bio Loop operational areas"
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPanel />
    </Suspense>
  );
}
