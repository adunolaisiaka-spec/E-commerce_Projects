import React from 'react'
import { href } from 'react-router-dom'
import CategoryItem from '../components/CategoryItem';
import { useEffect } from 'react';
import { useProductStore } from '../stores/UseProductStore';
import FeaturedProducts from '../components/FeaturedProducts';

const categories = [
  { href: "/jeans", name: "Jeans", imageUrl: "/jeans.jpg" },
  { href: "/t-shirts", name: "T-Shirts", imageUrl: "/tshirts.jpg" },
  { href: "/shoes", name: "Shoes", imageUrl: "/shoes.jpg" },
  { href: "/glasses", name: "Glasses", imageUrl: "/glasses.png" },
  { href: "/jackets", name: "Jackets", imageUrl: "/jackets.jpg" },
  { href: "/suits", name: "Suits", imageUrl: "/suits.jpg" },
  { href: "/bags", name: "Bags", imageUrl: "/bags.jpg" },
];

const Home = () => {
  const {fetchFeaturedProducts, products, isLoading} = useProductStore();
   
  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className='relative min-h-screen text-white overflow-hidden'>
      <div className='relative z-10 max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 '>
        <h1 className='text-center text-5xl font-bold mb-4 sm:text-6xl text-emerald-400'>
          Welcome to Our Store
        </h1>
        <p className='text-center text-xl text-gray-300 mb-12'>
          Discover the latest trends and styles at unbeatable prices.
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8'>
          {categories.map((category) => (
            <CategoryItem 
              category={category}
              key={category.name}
            />
          ))}
        </div>

        {!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
      </div>
    </div>
  )
}

export default Home
