import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/movies", "/cinemas"],
        disallow: ["/admin", "/bookings", "/payments", "/showtimes/*/seats"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}