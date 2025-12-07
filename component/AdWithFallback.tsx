'use client';

import {useEffect, useRef, useState} from 'react';

interface AdWithFallbackProps {
    // Kakao AdFit
    kakaoUnit: string;
    // Google AdSense
    googleAdSlot: string;
    // Size
    width: string;
    height: string;
}

export default function AdWithFallback({
                                           kakaoUnit,
                                           googleAdSlot,
                                           width,
                                           height
                                       }: AdWithFallbackProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const [showFallback, setShowFallback] = useState(false);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
        // Production environment only
        if (process.env.NODE_ENV !== 'production') return;

        const loadKakaoAd = () => {
            if (!adRef.current || adLoaded) return;

            try {
                // Create ins element for Kakao AdFit
                const ins = document.createElement('ins');
                ins.className = 'kakao_ad_area';
                ins.style.display = 'none';
                ins.setAttribute('data-ad-unit', kakaoUnit);
                ins.setAttribute('data-ad-width', width);
                ins.setAttribute('data-ad-height', height);

                // Append ins element
                adRef.current.appendChild(ins);
                setAdLoaded(true);

                // Check if ad is displayed after a delay
                setTimeout(() => {
                    if (adRef.current) {
                        const kakaoAd = adRef.current.querySelector('.kakao_ad_area');
                        if (kakaoAd) {
                            const computedStyle = window.getComputedStyle(kakaoAd);
                            const hasContent = kakaoAd.children.length > 0;
                            const isVisible = computedStyle.display !== 'none' && hasContent;

                            if (!isVisible) {
                                setShowFallback(true);
                            }
                        } else {
                            setShowFallback(true);
                        }
                    }
                }, 3000);
            } catch (error) {
                console.error('Kakao AdFit loading error:', error);
                setShowFallback(true);
            }
        };

        // Wait for script to load, then create ad elements
        const checkScriptLoaded = setInterval(() => {
            const scripts = document.querySelectorAll('script[src*="ba.min.js"]');
            if (scripts.length > 0) {
                clearInterval(checkScriptLoaded);
                setTimeout(loadKakaoAd, 200);
            }
        }, 100);

        // Cleanup after 5 seconds and show fallback if Kakao script not loaded
        const timeout = setTimeout(() => {
            clearInterval(checkScriptLoaded);
            if (!adLoaded) {
                setShowFallback(true);
            }
        }, 5000);

        return () => {
            clearInterval(checkScriptLoaded);
            clearTimeout(timeout);
        };
    }, [kakaoUnit, width, height, adLoaded]);

    // Google AdSense fallback
    useEffect(() => {
        if (process.env.NODE_ENV !== 'production') return;
        if (!showFallback) return;

        const loadGoogleAd = () => {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (error) {
                console.error('Google AdSense loading error:', error);
            }
        };

        // Small delay to ensure the ins element is in DOM
        setTimeout(loadGoogleAd, 100);
    }, [showFallback]);

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
                Ad (Kakao/Google)
            </div>
        );
    }

    return (
        <div
            style={{
                width: `${width}px`,
                height: `${height}px`,
                overflow: 'hidden'
            }}
        >
            {/* Kakao AdFit */}
            <div
                ref={adRef}
                style={{
                    display: showFallback ? 'none' : 'block',
                    width: '100%',
                    height: '100%'
                }}
            />

            {/* Google AdSense Fallback */}
            {showFallback && (
                <ins
                    className="adsbygoogle"
                    style={{
                            display: 'inline-block',
                        width: `${width}px`,
                        height: `${height}px`
                    }}
                    data-ad-client="ca-pub-8155259965118969"
                    data-ad-slot={googleAdSlot}
                />
            )}
        </div>
    );
}