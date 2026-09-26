import "../globals.css";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = {
  title: {
    default: "Sign in · Tonaura",
    template: "%s · Tonaura",
  },
};

export default function AuthLayout({ children }) {
  return <AuthShell>{children}</AuthShell>;
}