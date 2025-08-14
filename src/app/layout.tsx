import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/layout";
import { AuthProvider } from "@/contexts/auth-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { PermissionsProvider } from "@/contexts/permissions-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fleet Maintenance Tracker",
  description: "Track and manage your truck fleet maintenance",
  keywords: ["fleet", "maintenance", "trucks", "management"],
  authors: [{ name: "Fleet Manager Team" }],
  openGraph: {
    title: "Fleet Maintenance Tracker",
    description: "Track and manage your truck fleet maintenance",
    siteName: "Fleet Manager",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <SidebarProvider>
            <PermissionsProvider>
              <Layout userRole="ADMIN">
                {children}
              </Layout>
            </PermissionsProvider>
          </SidebarProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
