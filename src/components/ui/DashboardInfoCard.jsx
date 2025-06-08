import React from 'react';

const DashboardInfoCard = ({
    title,
    value,
    icon: Icon,
    iconColor = 'text-blue-600',
    borderColor = 'border-blue-600',
    subtext,
    onClick,
    className = ''
}) => {
    const cardBaseClass = "bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out flex items-start space-x-4 border-l-4";
    const clickableClass = onClick ? "cursor-pointer" : "";

    return (
        <div
            className={`${cardBaseClass} ${borderColor} ${clickableClass} ${className}`}
            onClick={onClick}
            role={onClick ? "button" : "figure"}
            tabIndex={onClick ? 0 : -1}
            onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
        >
            {Icon && (
                <div className={`p-2 bg-gray-100 rounded-full`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} aria-hidden="true" />
                </div>
            )}
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider truncate" title={title}>
                    {title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-800 truncate" title={String(value)}>
                    {value}
                </p>
                {subtext && (
                    <p className="text-xs text-gray-500 mt-1 truncate" title={subtext}>
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );
};

export default React.memo(DashboardInfoCard);
