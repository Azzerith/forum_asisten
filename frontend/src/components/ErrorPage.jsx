import { useRouteError, Link } from 'react-router-dom'
import PropTypes from 'prop-types'

const ErrorPage = ({ customMessage }) => {
  const error = useRouteError()
  console.error(error)

  // Default error message
  let errorMessage = customMessage || 'Terjadi kesalahan yang tidak terduga'
  let errorStatus = ''
  let errorDetails = ''

  // Jika error dari router
  if (error) {
    errorStatus = error.status || ''
    errorDetails = error.statusText || error.message || ''
    
    if (error.status === 404) {
      errorMessage = 'Halaman yang Anda cari tidak ditemukan'
    } else if (error.status === 401) {
      errorMessage = 'Anda tidak memiliki akses ke halaman ini'
    } else if (error.status === 500) {
      errorMessage = 'Terjadi kesalahan di server'
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-5">
      <div className="text-center bg-white rounded-xl shadow-md p-10 max-w-2xl w-full">
        <h1 className="text-5xl font-bold text-red-600 mb-6">Oops!</h1>
        
        {errorStatus && (
          <p className="text-lg text-gray-500 mb-2">Kode Error: {errorStatus}</p>
        )}
        
        <p className="text-2xl text-gray-800 mb-6">{errorMessage}</p>
        
        {errorDetails && (
          <p className="text-sm text-gray-500 mb-8">
            <span className="font-medium">Detail:</span> {errorDetails}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/" 
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 text-center"
          >
            Kembali ke Halaman Utama
          </Link>
          
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            Muat Ulang Halaman
          </button>
        </div>
      </div>
    </div>
  )
}

ErrorPage.propTypes = {
  customMessage: PropTypes.string
}

export default ErrorPage