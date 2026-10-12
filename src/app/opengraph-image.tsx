import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Elite Interview Prep — structured interview mastery';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 80,
          background: '#f8f8fa',
          color: '#030213',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.6, marginBottom: 24 }}>Elite Interview Prep</div>
        <div style={{ fontSize: 64, fontWeight: 600, lineHeight: 1.15, maxWidth: 900 }}>
          Master every topic before the next one.
        </div>
        <div style={{ fontSize: 28, marginTop: 32, opacity: 0.7, maxWidth: 800 }}>
          JavaScript & React · playgrounds · interview Q&A · mastery gates
        </div>
      </div>
    ),
    { ...size },
  );
}
