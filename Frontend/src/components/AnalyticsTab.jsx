import React from 'react'
import {motion} from 'framer-motion'
import axios from '../lib/axios';
import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, Tooltip } from 'recharts';

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    users: 0,
    products: 0,
    totalsales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axios.get('/analytics');
        console.log('Analytics data fetched:', response.data.analyticsData);
        setAnalyticsData(response.data.analyticsData || {
          totalRevenue: 0,
          users: 0,
          products: 0,
          totalsales: 0,
        });
        setDailySalesData(response.data.dailySalesData || []);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <AnalyticsCard
          title="Total Revenue" 
          value={`$${(analyticsData.totalRevenue ?? analyticsData.revenue ?? 0).toLocaleString()}`} 
          icon={DollarSign} 
          color="from-emerald-500 to-emerald-700" 
        />
        <AnalyticsCard
          title="Total Users" 
          value={(analyticsData.users ?? 0).toLocaleString()}
          icon={Users} 
          color="from-emerald-500 to-emerald-700" 
        />
        <AnalyticsCard
          title="Total Products" 
          value={(analyticsData.products ?? 0).toLocaleString()}
          icon={Package} 
          color="from-emerald-500 to-emerald-700" 
        />
        <AnalyticsCard
          title="Total Sales" 
          value={(analyticsData.totalsales ?? analyticsData.sales ?? 0).toLocaleString()}
          icon={ShoppingCart} 
          color="from-emerald-500 to-emerald-700" 
        />  
      </div>
      <motion.div
        className='bg-gray-800/60 p-6 rounded-lg shadow-lg'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke='#D1D5DB'/>
            <YAxis yAxisId="left" stroke='#D1D5DB'/>
            <YAxis yAxisId="right" orientation="right" stroke='#D1D5DB'/>
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone"
               dataKey="sales" 
               stroke="#10b981" 
              activeDot={{ r: 8 }}
              name='Sales' 
              />
            <Line 
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              activeDot={{ r: 8 }}
              name='Revenue'
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div 
    className= {`bg-gray-800 p-6 rounded-lg shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center justify-between">
      <div className="z-10">
        <p className="text-emerald-400 font-semibold text-sm mb-1">{title}</p>
        <h3 className="text-white text-2xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30"/>
    <div className="absolute -bottom-4 -right-4 opacity-50 text-emerald-800">
      <Icon className="w-32 h-32"/>
    </div>
  </motion.div>
);

