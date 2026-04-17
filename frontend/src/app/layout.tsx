import type { Metadata } from "next";
import "@/styles/globals.css";
import AppProvider from "@/providers/AppProvider";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Movie Booking";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: "Movie ticket booking platform with real seat selection and payment flow.",
  metadataBase: new URL(appUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <AppProvider>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <div className="flex-1">{children}</div>
            <AppFooter />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}