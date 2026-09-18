'use client';
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>Something went wrong!</h1>
      <button onClick={() => reset()}>Try again</button>
    </div>;
}
