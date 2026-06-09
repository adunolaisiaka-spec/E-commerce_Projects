import Order from "../models/orderpaymentmodel.js"
import Product from "../models/productmodel.js";
import User from "../models/usermodel.js"

export const getAnalyticsData = async() => {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null, //it groups all documents together,
                totalSales: {$sum:1},
                totalRevenue: {$sum:"$totalAmount"}
            }
        }
    ]);

    const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

    return {
        users: totalUsers,
        products: totalProducts,
        totalsales: totalSales,
        totalRevenue: totalRevenue,
        sales: totalSales,
        revenue: totalRevenue,
    };
}

export const getDailySalesData = async(startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate,
                },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt"} },
                sales: { $sum: 1},
                revenue: { $sum: "$totalAmount"},
            },
        },
        { $sort: { _id: 1} },
    ]),

    //example of dailySalesDate
    //[
//     {
//         _id: "2026-05-07",
//         sales: 32,
//         revenue: 1450.75
//     },
//     ]

dateArray = getDatesInRange(startDate, endDate);
//console.log("Data array:", dataArray);//['2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07'] //7 days data array for daily sales

return dateArray.map(date => {
    const foundData = dailySalesData.find(item => item._id === date);
    return {
        date,
        sales: foundData ? foundData.sales || 0 : 0,
        revenue: foundData ? foundData.revenue || 0 : 0,
    };
});
    } catch (error) {
        throw error;
    }
};

export const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const endData = new Date(endDate);

    while (currentDate <= endData) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
};