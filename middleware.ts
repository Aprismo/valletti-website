import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// The /admin panel is intentionally outside the localized [locale] tree —
// it's a single-user (Roberto) tool and stays in one language, so it's
// excluded here from locale-prefix redirects.
export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
