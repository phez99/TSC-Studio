import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ url, size = 200 }) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: size,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((res) => {
        setDataUrl(res);
        setError(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        setError(true);
      });
  }, [url, size]);

  if (error || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 text-center border border-slate-300"
      >
        <span className="text-xs font-semibold text-slate-700">QR Code Error</span>
        <span className="text-[10px] text-slate-500 mt-1 break-all">{url}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-2.5 rounded-2xl shadow-xl border border-slate-200 inline-block">
      <img
        src={dataUrl}
        alt="Scan QR untuk bergabung kuis"
        width={size}
        height={size}
        className="rounded-xl block"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
