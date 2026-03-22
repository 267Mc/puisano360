import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Video, UserCog, GraduationCap } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Puisano360 | Connecting Schools and Parents",
  description: "360-degree communication portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-6">
            <Link href="/" className="flex flex-col">
              <div className="flex items-center gap-2 font-bold text-blue-900 text-xl leading-none">
                <GraduationCap className="h-7 w-7 text-blue-600" />
                <span>Puisano<span className="text-blue-600">360</span></span>
              </div>
              <span className="text-[10px] uppercase tracking-tighter text-slate-500 font-bold ml-9">
                Connecting schools and parents
              </span>
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/parent" className="hover:text-blue-600 flex items-center gap-1 text-sm font-medium">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link href="/parent/profile" className="hover:text-blue-600 flex items-center gap-1 text-sm font-medium">
                <UserCog size={16} /> Profile
              </Link>
            </div>
          </div>
        </nav>
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
