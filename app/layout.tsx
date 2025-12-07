import type {Metadata} from "next";
import "./global.css";
import * as React from "react";
import Script from "next/script";

export const metadata: Metadata = {
    title: "Sudoku",
    description: "Next.js-based web page where you can enjoy Sudoku games",
    other: {
        'google-adsense-account': 'ca-pub-8155259965118969', // Google AdSense
    }
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
        <body className="antialiased">
        {/* Google AdSense Script */}
        <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8155259965118969"
            crossOrigin="anonymous"
        />
        {/* Kakao AdFit Script */}
        <Script
            src="https://t1.daumcdn.net/kas/static/ba.min.js"
            strategy="afterInteractive"
            async
        />
        {children}
        </body>
        </html>
    );
}