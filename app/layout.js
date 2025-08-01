import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import Layout from "@/components/layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BuildFolio - Project Tracking & Journaling",
  description:
    "Track your projects, hobbies, and collections with detailed logs and reminders.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <Layout>{children}</Layout>
        </AuthProvider>
      </body>
    </html>
  );
}
