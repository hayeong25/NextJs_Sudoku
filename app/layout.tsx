import type {Metadata} from "next";
import "./global.css";
import * as React from "react";

export const metadata: Metadata = {
    title: "Sudoku",
    description: "Next.js-based web page where you can enjoy Sudoku games",
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
        <body className="antialiased">{children}</body>
        </html>
    );
}