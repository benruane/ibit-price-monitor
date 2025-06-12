export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">IBIT Price Monitor</h1>
      <p className="text-xl">Running on Vercel Cron Jobs</p>
      <p className="mt-4">Checks price every minute and submits to SEDA when:</p>
      <ul className="list-disc mt-2">
        <li>10 minutes have passed since last submission</li>
        <li>Price changes by more than 0.5%</li>
      </ul>
    </main>
  );
} 