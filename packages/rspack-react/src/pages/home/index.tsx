export default function HomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Welcome to React Demo</h1>
            <p className="text-xl text-gray-600">
              Built with Esmx, React, and Tailwind CSS
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
