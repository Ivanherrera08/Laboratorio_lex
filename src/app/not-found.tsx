export const dynamic = 'force-dynamic';
export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>404 - Not Found</h1>
      <p>The page you requested could not be found.</p>
    </div>
  );
}
