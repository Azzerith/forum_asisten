import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-6">
      <div className="text-center max-w-md lg:max-w-2xl space-y-6">
        {/* Error Icon/Illustration */}
        <div className="flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-32 w-32 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Error Code */}
        <h1 className="text-9xl font-bold text-blue-600">404</h1>

        {/* Error Message */}
        <h2 className="text-3xl font-semibold text-gray-800">
          Halaman Tidak Ditemukan
        </h2>

        <p className="text-lg text-gray-600">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Kembali ke Beranda
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-all duration-300"
          >
            Kembali ke Halaman Sebelumnya
          </button>
        </div>

        {/* Additional Help */}
        <div className="pt-8">
          <p className="text-sm text-gray-500">
            Jika Anda merasa ini adalah kesalahan, silakan{' '}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:underline"
            >
              hubungi dukungan teknis
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage