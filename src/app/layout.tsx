import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
    title: "Dashboard",
    description: "Admin dashboard with menus",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>

                    <main className="flex">
                        {children}
                    </main>

            </body>
        </html>
    );
}
