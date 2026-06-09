import React from 'react'
import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from 'lucide-react';
// import { ShoppingCart, UserPlus, LogIn, LogOut, Lock } from "@heroicons/react/24/outline"
import { Link } from 'react-router-dom';
import { useUserStore } from '../stores/useUserStore';
import { useCartStore } from '../stores/useCartStore';

const Navbar = () => {
  const { user, logout } = useUserStore(); // Simulate user authentication status
  const isAdmin = user?.role === 'admin'; // Simulate admin status
  const { cart } = useCartStore();

  return (
    <header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-emerald-800'>
        <div className="container mx-auto px-4 py-3">
          <div className='flex flex-wrap justify-between items-center'>
            <Link to="/" className="text-2xl font-bold text-emerald-400 items-center space-x-2 flex">
                E-Commerce Store
            </Link>

            <nav className='flex flex-wrap items-center gap-4'>

                <Link to={"/"} className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'>Home</Link>

                {user && (
                  <Link to={"/cart"} className='relative group text-gray-300 ease-in-out'>

                    <ShoppingCart className='inline-block mr-1 group-hover:text-emerald-400' size={20} />

                    <span className='hidden sm:inline'>Cart</span>
                    
                    {cart.length > 0 && (
                       <span className='absolute -top-2 -left-2 bg-emerald-500 text-white text-xs rounded-full px-1 transition duration-300 ease-in-out group-hover:bg-emerald-400'>{cart.length}</span>
                    )}
                  </Link>
                )}

                {isAdmin && (
                  <Link to={"/secret-dashboard"} className='bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium flex items-center transition duration-300 ease-in-out'>
                    <Lock className='inline-block mr-1' size={18}/>
                    <span className='hidden sm:inline'>Dashboard</span>
                  </Link>
                )}

                {user ? (
                  <button className='bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md flex items-center transition duration-300 ease-in-out' onClick={logout}>
                    <LogOut size={18}/>
                    <span className='hidden sm:inline ml-2'>Logout</span>  
                  </button>
                ) : (
                  <>
                    <Link to={"/signup"} className='bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition duration-300 ease-in-out'>
                      <UserPlus className='inline-block mr-1' size={18}/>
                      <span className='hidden sm:inline'>Sign Up</span>
                    </Link>

                    <Link to={"/login"} className='bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition duration-300 ease-in-out'>
                      <LogIn className='inline-block mr-1' size={18}/>
                      <span className='hidden sm:inline'>Login</span>
                    </Link>
                
                    {/* <Link to={"/register"} className='bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium flex items-center transition duration-300 ease-in-out'>
                      <UserPlus className='inline-block mr-1' size={18}/>
                      <span className='hidden sm:inline'>Register</span>
                    </Link> */}
                  </>
                )}

            </nav>
            </div>
        </div>
    </header>
  )
}

export default Navbar