'use client';

import {useEffect, useRef} from 'react';

interface KakaoAdFitProps {
    unit: string;
    width: string;
    height: string;
}

export default function KakaoAdFit({
                                       unit,
                                       width,
                                       height
                                   }: KakaoAdFitProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const insRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        // Production environment only
        if (process.env.NODE_ENV !== 'production') return;

        const loadAd = () => {
            if (adRef.current && !insRef.current) {
                try {
                    // Create ins element
                    const ins = document.createElement('ins');
                    ins.className = 'kakao_ad_area';
                    ins.style.display = 'none';
                    ins.setAttribute('data-ad-unit', unit);
                    ins.setAttribute('data-ad-width', width);
                    ins.setAttribute('data-ad-height', height);

                    // Append ins element
                    adRef.current.appendChild(ins);
                    insRef.current = ins;
                } catch (error) {
                    console.error('Kakao AdFit loading error:', error);
                }
            }
        };

        // Wait for script to load, then create ad elements
        const checkScriptLoaded = setInterval(() => {
            const scripts = document.querySelectorAll('script[src*="ba.min.js"]');
            if (scripts.length > 0) {
                clearInterval(checkScriptLoaded);
                // Add small delay to ensure script is fully initialized
                setTimeout(loadAd, 200);
            }
        }, 100);

        // Cleanup after 10 seconds to prevent infinite loop
        const timeout = setTimeout(() => {
            clearInterval(checkScriptLoaded);
            loadAd(); // Try loading anyway
        }, 10000);

        return () => {
            clearInterval(checkScriptLoaded);
            clearTimeout(timeout);
        };
    }, [unit, width, height]);

    if (process.env.NODE_ENV === 'development') {
        return (
            <div
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    border: '2px dashed #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    color: '#999'
                }}
            >
                Kakao AdFit
            </div>
        );
    }

    return (
        <div
            ref={adRef}
            style={{
                width: `${width}px`,
                height: `${height}px`,
                overflow: 'hidden'
            }}
        />
    );
}