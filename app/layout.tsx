import type {Metadata} from "next";
import "./global.css";
import * as React from "react";
import Script from "next/script";

export const metadata: Metadata = {
    title: "Sudoku",
    description: "Next.js-based web page where you can enjoy Sudoku games",
    other: {
        'propeller': '9e39afa0361fca43d0b0455e6608584e' // PropellerAds
    }
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
        <body className="antialiased">
            {/* PropellerAds - Load external scripts dynamically */}
            <Script
                src={"https://fpyf8.com/88/tag.min.js"}
                data-zone="177383"
                strategy="afterInteractive"
                async
            />
            {children}
        </body>
        </html>
    );
}