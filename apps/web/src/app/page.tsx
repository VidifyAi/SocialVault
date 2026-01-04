export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Welcome to SocialVault</h1>
        <p className="text-xl mb-8">Secure marketplace for social media accounts</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">For Buyers</h2>
            <p>Find verified social media accounts with secure escrow payments</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">For Sellers</h2>
            <p>List your accounts and connect with serious buyers safely</p>
          </div>
        </div>
      </div>
    </main>
  );
}
