import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";


export const metadata: Metadata = {
    title: "Dashboard",
    description: "Admin dashboard with menus",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="flex">
        <Sidebar />
        <main className="flex-1 p-6 bg-gray-100 min-h-screen">{children}</main>
      </body>
        </html>
    );
}
