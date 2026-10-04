import { LoginPage } from "@/components/login/login-page";
import { isMockMode } from "@/lib/api/client";

export default function LoginRoute() {
  return <LoginPage mockMode={isMockMode} />;
}
