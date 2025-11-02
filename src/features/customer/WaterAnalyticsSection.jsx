import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import * as DataService from '../../services/dataService';
import { formatDate } from '../../utils/userUtils';
import { TrendingUp, Calendar, AlertTriangle, Info, BarChart2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const getSixMonthsAgo = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
};

const getToday = () => {
    return new Date().toISOString().split('T')[0];
};

const WaterAnalyticsSection = ({ user, userData, db, showNotification }) => {
    const [consumptionData, setConsumptionData] = useState([]);
    const [grouping, setGrouping] = useState('monthly');
    const [startDate, setStartDate] = useState(getSixMonthsAgo());
    const [endDate, setEndDate] = useState(getToday());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchConsumptionData = useCallback(async () => {
        if (!user || !user.uid) {
             setError("User data not available.");
             setIsLoading(false);
             return;
        }
        setIsLoading(true);
        setError('');
        try {
            const billsResult = await DataService.getBillsForUser(db, user.uid);
            if (billsResult.success) {
                const sortedBills = billsResult.data
                    .filter(bill => bill.billDate?.toDate && typeof bill.consumption === 'number' && bill.consumption >= 0)
                    .sort((a, b) => a.billDate.toDate() - b.billDate.toDate());
                setConsumptionData(sortedBills);
            } else {
                throw new Error(billsResult.error || "Failed to fetch billing data.");
            }
        } catch (err) {
            setError(err.message || "An unexpected error occurred fetching data.");
            showNotification(err.message || "Could not load consumption data.", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [db, user, showNotification]);

    useEffect(() => {
        fetchConsumptionData();
    }, [fetchConsumptionData]);

    const aggregateData = (data, group, start, end) => {
        const aggregated = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime() + (24 * 60 * 60 * 1000 - 1);

        const filteredData = data.filter(bill => {
            const billTime = bill.billDate.toDate().getTime();
            return billTime >= startTime && billTime <= endTime;
        });

        filteredData.forEach(bill => {
            const date = bill.billDate.toDate();
            const year = date.getFullYear();
            const month = date.getMonth();
            let key;

            switch (group) {
                case 'yearly':
                    key = `${year}`;
                    break;
                case 'daily':
                    key = `${year}-${String(month + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                    break;
                case 'monthly':
                default:
                     key = `${year}-${String(month + 1).padStart(2, '0')}`;
                    break;
            }
            aggregated[key] = (aggregated[key] || 0) + (bill.consumption || 0);
        });

         const sortedKeys = Object.keys(aggregated).sort();

         return sortedKeys.reduce((obj, key) => {
            let label = key;
            if (group === 'monthly') {
                const [year, monthNum] = key.split('-');
                if(monthNum && monthNames[parseInt(monthNum) - 1]){
                    label = `${monthNames[parseInt(monthNum) - 1]} '${year.slice(-2)}`;
                }
            } else if (group === 'daily') {
                const [year, monthNum, day] = key.split('-');
                if(monthNum && day) {
                    label = `${monthNames[parseInt(monthNum) - 1]} ${day}, '${year.slice(-2)}`;
                }
            }
            obj[label] = aggregated[key];
            return obj;
         }, {});
    };

    const processedData = aggregateData(consumptionData, grouping, startDate, endDate);

    const chartData = {
        labels: Object.keys(processedData),
        datasets: [
            {
                label: 'Consumption (m³)',
                data: Object.values(processedData),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(37, 99, 235, 1)',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: 'rgba(37, 99, 235, 0.8)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: `Water Consumption Trend (${grouping.charAt(0).toUpperCase() + grouping.slice(1)})`,
                font: { size: 16 },
                color: '#374151',
                padding: { bottom: 15 }
            },
            tooltip: {
                backgroundColor: '#1F2937',
                titleColor: '#E5E7EB',
                bodyColor: '#D1D5DB',
                borderColor: '#4B5563',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: function(context) {
                        return ` Consumption: ${context.parsed.y.toFixed(2)} m³`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Consumption (m³)', color: '#4B5563' },
                grid: { color: '#E5E7EB' },
                ticks: { color: '#6B7280' }
            },
            x: {
                title: { display: true, text: 'Period', color: '#4B5563' },
                grid: { display: false },
                ticks: { color: '#6B7280' }
            }
        }
    };

    const avgConsumption = consumptionData.length > 0
        ? (consumptionData.reduce((sum, bill) => sum + (bill.consumption || 0), 0) / consumptionData.length)
        : 0;

     const calculateInsights = (data) => {
        const values = Object.values(data);
        const keys = Object.keys(data);
        if (values.length < 2) return "Not enough data for comparison in the selected range.";
        const lastValue = values[values.length - 1];
        const prevValue = values[values.length - 2];
        const lastPeriod = keys[values.length - 1];
        const change = lastValue - prevValue;
        const percentChange = prevValue !== 0 ? (change / prevValue) * 100 : (lastValue > 0 ? Infinity : 0);

        let insight = `Consumption in ${lastPeriod} was ${lastValue.toFixed(2)} m³. `;
        if (percentChange === Infinity) {
             insight += `This is up from 0 in the previous period.`;
        } else if (change > 0) {
            insight += `This is ${percentChange >= 0.1 ? '+' : ''}${percentChange.toFixed(1)}% (${change >= 0 ? '+' : ''}${change.toFixed(2)} m³) compared to the previous period.`;
            if (percentChange > 25) insight += " Consider checking for potential leaks or reviewing usage patterns.";
        } else if (change < 0) {
            insight += `This is a ${Math.abs(percentChange).toFixed(1)}% decrease (${change.toFixed(2)} m³) compared to the previous period.`;
        } else {
            insight += "Consumption remained stable compared to the previous period.";
        }
        return insight;
    };


    return (
        <div className="p-4 sm:p-6 bg-white rounded-xl shadow-xl animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 gap-4">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center">
                    <TrendingUp size={30} className="mr-3 text-blue-600" /> Water Consumption Analytics
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                     <div className="flex items-center gap-2 w-full">
                        <BarChart2 size={18} className="text-gray-500" />
                        <select
                            value={grouping}
                            onChange={(e) => setGrouping(e.target.value)}
                            className="p-2 border rounded-md text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 w-full"
                            disabled={isLoading}
                        >
                            <option value="daily">Group by Day</option>
                            <option value="monthly">Group by Month</option>
                            <option value="yearly">Group by Year</option>
                        </select>
                     </div>
                     <div className="flex items-center gap-2 w-full">
                        <Calendar size={18} className="text-gray-500" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="p-2 border rounded-md text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 w-full"
                            disabled={isLoading}
                            max={endDate}
                        />
                         <span className="text-gray-500">-</span>
                         <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="p-2 border rounded-md text-sm bg-gray-50 focus:ring-blue-500 focus:border-blue-500 w-full"
                            disabled={isLoading}
                            min={startDate}
                            max={getToday()}
                        />
                    </div>
                </div>
            </div>

            {isLoading && <LoadingSpinner message="Loading consumption data..." />}
            {error && !isLoading && (
                <div className="text-center py-10 bg-red-50 p-4 rounded-lg">
                    <AlertTriangle size={48} className="mx-auto text-red-400 mb-3" />
                    <p className="text-red-600 text-lg font-semibold">Error Loading Data</p>
                    <p className="text-sm text-red-500 mt-1">{error}</p>
                </div>
            )}
             {!isLoading && !error && consumptionData.length === 0 && (
                 <div className="text-center py-10 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <Info size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No consumption data found yet.</p>
                     <p className="text-sm text-gray-500 mt-1">Analytics will appear after your first few bills.</p>
                </div>
            )}

            {!isLoading && !error && consumptionData.length > 0 && Object.keys(processedData).length > 0 && (
                <div className="space-y-6">
                     <div className="text-sm text-center text-gray-700 bg-blue-50 p-3 rounded-md border border-blue-200 shadow-sm">
                         <p><strong>Insight:</strong> {calculateInsights(processedData)}</p>
                         <p className="mt-1">Average monthly use (all data): <strong>{avgConsumption.toFixed(2)} m³</strong>.</p>
                    </div>
                    <div className="h-64 md:h-80 lg:h-96 w-full p-4 border rounded-lg bg-gray-50 shadow-inner">
                        <Bar options={chartOptions} data={chartData} />
                    </div>
                </div>
            )}
             {!isLoading && !error && consumptionData.length > 0 && Object.keys(processedData).length === 0 && (
                 <div className="text-center py-10 bg-gray-50 p-6 rounded-lg shadow-inner">
                    <Info size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No data found for the selected date range and grouping.</p>
                     <p className="text-sm text-gray-500 mt-1">Try expanding your date range or changing the grouping.</p>
                </div>
            )}
        </div>
    );
};

export default WaterAnalyticsSection;