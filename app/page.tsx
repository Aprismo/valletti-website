import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// Safety-net redirect; the i18n middleware normally handles "/" before
// this route is ever reached.
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
