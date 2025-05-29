import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    return (
        <nav className="flex mb-4 py-2 px-4 bg-gray-100/5 rounded">
            <ol className="flex items-center space-x-2 text-sm">
                {items.map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && (
                            <li className="text-gray-400 mx-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </li>
                        )}
                        <li className={index === items.length - 1 ? "text-gold font-medium" : "text-gray-400"}>
                            {item.path && index !== items.length - 1 ? (
                                <Link to={item.path} className="hover:text-gray-200 transition-colors duration-200">
                                    {item.label}
                                </Link>
                            ) : (
                                <span>{item.label}</span>
                            )}
                        </li>
                    </React.Fragment>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumb;
