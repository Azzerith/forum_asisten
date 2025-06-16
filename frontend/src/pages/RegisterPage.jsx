import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiUser, FiMail, FiKey, FiPhone, FiArrowRight, FiCheckCircle, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    telepon: "",
    nim: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.nama.trim()) {
      newErrors.nama = "Nama lengkap wajib diisi";
    }

    if (!formData.nim.trim()) {
      newErrors.nim = "NIM wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email tidak valid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.telepon.trim()) {
      newErrors.telepon = "Nomor telepon wajib diisi";
    } else if (!/^[0-9]+$/.test(formData.telepon)) {
      newErrors.telepon = "Nomor telepon harus angka";
    } else if (formData.telepon.length < 10 || formData.telepon.length > 13) {
      newErrors.telepon = "Nomor telepon harus 10-13 digit";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRegistrationError("");
  
    if (!validateStep2()) return;
  
    setIsSubmitting(true);
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BASEURL}/api/register`,
        {
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
          telepon: formData.telepon,
          nim: formData.nim,
          role: "asisten",
        }
      );
  
      console.log("API Response:", response.data); // Debugging
  
      // Periksa response dengan lebih fleksibel
      if (response.data && (response.data.success || response.data.message)) {
        setShowSuccessModal(true);
        console.log("Registration success, modal should appear");
      } else {
        throw new Error("Format response tidak dikenali");
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Terjadi kesalahan saat pendaftaran";
      
      if (error.response) {
        // Handle berbagai format error response
        if (error.response.data) {
          if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        }
        
        if (error.response.status === 400) {
          errorMessage = errorMessage || "Data yang dimasukkan tidak valid";
        } else if (error.response.status === 409) {
          errorMessage = errorMessage || "Email atau NIM sudah terdaftar";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setRegistrationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  {showSuccessModal && (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-[1000]"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pendaftaran Berhasil!
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Akun telah berhasil dibuat. Mohon konfirmasi ke administrator untuk aktivasi akun.
            </p>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/");
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Kembali ke Halaman Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )}

  const closeModalAndRedirect = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 drop-shadow-2xl bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Pendaftaran Berhasil!
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Akun telah berhasil dibuat. Mohon konfirmasi ke administrator untuk aktivasi akun.
                </p>
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={closeModalAndRedirect}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Kembali ke Halaman Login
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Akun Baru</h1>
          <p className="text-gray-600 mt-2">
            Langkah {currentStep} dari 2 - Isi data berikut
          </p>
          
          {/* Step indicator */}
          <div className="flex justify-center mt-4 mb-6">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-16 h-1 mx-1 ${currentStep === 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
            </div>
          </div>
        </div>

        {registrationError && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <p>{registrationError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="nama"
                    className={`pl-10 w-full p-3 border ${
                      errors.nama ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama}
                    onChange={handleChange}
                  />
                </div>
                {errors.nama && (
                  <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIM
                </label>
                <input
                  type="text"
                  name="nim"
                  className={`w-full p-3 border ${
                    errors.nim ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                  placeholder="Masukkan NIM"
                  value={formData.nim}
                  onChange={handleChange}
                />
                {errors.nim && (
                  <p className="mt-1 text-sm text-red-600">{errors.nim}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    className={`pl-10 w-full p-3 border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Masukkan email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Lanjut ke Langkah 2
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Account Information */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiPhone className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="telepon"
                    className={`pl-10 w-full p-3 border ${
                      errors.telepon ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Masukkan nomor telepon"
                    value={formData.telepon}
                    onChange={handleChange}
                  />
                </div>
                {errors.telepon && (
                  <p className="mt-1 text-sm text-red-600">{errors.telepon}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    className={`pl-10 w-full p-3 border ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiKey className="text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={`pl-10 w-full p-3 border ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                    placeholder="Masukkan ulang password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex justify-center items-center py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                >
                  <FiArrowLeft className="mr-2" />
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 flex justify-center items-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                    isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    "Daftar Sekarang"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Sudah punya akun?{" "}
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;