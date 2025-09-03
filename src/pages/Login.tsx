import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore'; // Adjust the import path
import { login } from '../api/authApi';

// Define the login schema with Zod
const loginSchema = z.object({
  phone: z.string()
    .min(9, 'رقم الهاتف يجب أن يحتوي على 9 أرقام بعد 966')
    .max(9, 'رقم الهاتف يجب أن يحتوي على 9 أرقام بعد 966')
    .regex(/^5\d{8}$/, 'رقم الهاتف يجب أن يبدأ بـ 5 ويحتوي على 9 أرقام'),
  password: z.string()
    .min(6, 'كلمة المرور يجب أن تحتوي على الأقل 6 أحرف')
});

// Extract the type from the schema
type LoginFormData = z.infer<typeof loginSchema>;

function Login() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading, login: storeLogin, setLoading } = useAuthStore();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // You can add role-based redirection logic here if needed
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      
      // Format the phone number with the country code
      const formattedData = {
        phone: `966${data.phone}`,
        password: data.password
      };
      
      const response = await login(formattedData);
      
      // Store user data and token in Zustand store
      storeLogin(response.user, response.token);
      
      // Navigate based on user role
      if (response.user.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
      
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'حدث خطأ في تسجيل الدخول'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneInput = (e: React.FormEvent<HTMLInputElement>) => {
    // Allow only numbers and limit to 9 digits
    const input = e.currentTarget;
    let value = input.value.replace(/\D/g, '');
    
    // Ensure it starts with 5
    if (value.length > 0 && !value.startsWith('5')) {
      value = '5' + value;
    }
    
    // Limit to 9 digits
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    
    input.value = value;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  966+
                </span>
                <input
                  {...register('phone')}
                  id="phone"
                  name="phone"
                  type="tel"
                  onInput={handlePhoneInput}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="555555555"
                  disabled={isLoading}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <input
                {...register('password')}
                id="password"
                name="password"
                type="password"
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="كلمة المرور"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {errors.root.message}
                  </h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {(isLoading || isSubmitting) ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;