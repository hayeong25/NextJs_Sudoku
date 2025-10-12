'use client';

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
    if (process.env.NODE_ENV === 'development') {
        return (
            <div
                style={{
                    width: '250px',
                    height: '250px',
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
        <ins
            className="kakao_ad_area"
            style={{display: 'none'}}
            data-ad-unit={unit}
            data-ad-width={width}
            data-ad-height={height}
        />
    );
}