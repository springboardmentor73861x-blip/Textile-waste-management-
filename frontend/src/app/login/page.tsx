export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Login
        </h1>

        <form className="space-y-4">
          <div>
            <label className="mb-2 block">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-md border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-md border p-3"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 p-3 text-white hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}