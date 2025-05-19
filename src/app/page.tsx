import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <p className="text-2xl font-semibold mb-6">Hello world</p>
      <div className="space-x-4">
        <Link href="/login">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Login
          </button>
        </Link>
        <Link href="/register">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}
