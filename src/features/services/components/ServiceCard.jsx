import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, Star, MoreVertical, Edit, Trash, PauseCircle } from 'lucide-react';

export default function ServiceCard({ service }) {
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="relative h-48 w-full bg-gray-100">
        {service.thumbnail ? (
          <img src={service.thumbnail} alt={service.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">{t('services.noImage', 'No Image')}</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${
            service.status === 'active' ? 'bg-green-100 text-green-700' :
            service.status === 'draft' ? 'bg-gray-100 text-gray-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            {t(`services.status.${service.status}`, service.status)}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <Link to={`/services/${service.id}`} className="block mt-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-yellow-600 transition-colors">
              {service.title}
            </h3>
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                  <Edit className="w-4 h-4" /> {t('common.edit', 'Edit')}
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                  <PauseCircle className="w-4 h-4" /> {t('common.pause', 'Pause')}
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                  <Trash className="w-4 h-4" /> {t('common.delete', 'Delete')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="font-medium text-gray-900">{service.rating || '0.0'}</span>
          <span>({service.reviewsCount || 0})</span>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1.5" />
            {service.deliveryTime} {t('services.days', 'Days')}
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500 uppercase tracking-wider">{t('services.startingAt', 'Starting at')}</span>
            <div className="text-lg font-bold text-gray-900">${service.price}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
