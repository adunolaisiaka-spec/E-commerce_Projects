import React from 'react'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Mail, Lock, ArrowRight, Loader, LogIn, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUserStore } from '../stores/useUserStore';

const LogInPage = () => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, loading } = useUserStore();

  function handleSubmit  (e) {
    e.preventDefault();
    // Handle form submission logic here
    console.log("correct form data")
    login( { email, password } )
  };

  return (
    <div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
          <motion.div
            className='sm:mx-auto sm:w-full sm:max-w-md'
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay:0.2 }}
          >
            <h2 className='mt-6 text-center text-3xl font-bold text-emerald-400 '>Login Your Account</h2>
            </motion.div>
    
            <motion.div
              className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay:0.2 }}
            >
              <div 
                className='bg-gray-800 py-8 px-4 shadow    sm:rounded-lg sm:px-10 '>
    
                <form onSubmit={handleSubmit}   className='space-y-4'>
    
                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-2'>Email</label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none '>
                        <Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
                      </div>
    
                      <input
                        type='text'
                        id='email'
                        required
                        placeholder='Enter your email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value )}
                        className='block w-full px-3 py-2 pl-10 bg-gray-700 rounded-md shadow-sm text-gray-300 placeholder:text-gray-500 border border-gray-500 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none sm:text-sm'
                        />
                    </div>
                  </div>
    
                  <div>
                    <label htmlFor='password' className='block text-sm font-medium text-gray-300 mb-2'>Password</label>
                    <div className='mt-1 relative rounded-md shadow-sm'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none '>
                        <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
                      </div>
    
                      <input
                        type='password'
                        id='password'
                        required
                        placeholder='********'
                        value={password}
                        onChange={(e) => setPassword(e.target.value )}
                        className='block w-full px-3 py-2 pl-10 bg-gray-700 rounded-md shadow-sm text-gray-300 placeholder:text-gray-500 border border-gray-500 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none sm:text-sm'
                        />
                    </div>
                  </div>
    
    
                  <button 
                    type='submit'
                    className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50' disabled={loading}
                    >
                    {loading ? (
                      <>
                        <Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
                        Loading...
                      </>
                    ) : (
                      <>
                        <LogIn className='mr-2 h-5 w-5' aria-hidden='true' />
                        Login
                      </>
                    )}
                  </button>
                </form>
    
                <p className='mt-8 text-center text-sm text-gray-400'>
                  User account does not exist?{" "}
                  <Link to='/signup' className='font-medium text-emerald-400 hover:text-emerald-300'>
                    Sign up now <ArrowRight className='inline h-4 w-4'/>
                  </Link>
                </p>
              </div>
          </motion.div>
        </div>
    
  )
}

export default LogInPage