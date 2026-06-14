import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, RefreshCw, Check, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

export default function ServiceDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  
  const service = {
    id: id || '1',
    title: 'I will design a modern UI/UX for your web application',
    category: 'UI/UX Design',
    description: 'Looking for a robust and scalable web application? I specialize in building custom fullstack solutions. With over 5 years of experience, I ensure clean code, excellent performance, and modern UI/UX design.\n\nWhat you will get:\n- Custom frontend design\n- Secure backend API\n- Database integration\n- Responsive layouts\n- Deployment support',
    price: 100,
    deliveryTime: 5,
    revisions: 3,
    rating: 5.0,
    reviewsCount: 12,
    seller: {
      name: 'Omar Alsawah',
      avatar: null,
      level: 'Top Rated',
      joined: '2022'
    },
    images: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80'
    ],
    features: ['Source file', 'Responsive design', 'Interactive prototype']
  };

  const [activeImage, setActiveImage] = useState(service.images[0]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-6 flex items-center gap-2 font-medium">
        <Link to="/" className="hover:text-yellow-600 transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <Link to="/services/my-services" className="hover:text-yellow-600 transition-colors">Services</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 truncate">{service.category}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-8">
          
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {service.title}
          </h1>

          {/* Seller Info Brief */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {service.seller.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                {service.seller.name} 
                <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{service.seller.level}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1 font-medium">
                <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                <span className="font-bold text-gray-900 mr-1">{service.rating}</span>
                <span>({service.reviewsCount} reviews)</span>
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div>
            <div className="rounded-xl overflow-hidden mb-4 bg-gray-100 aspect-video border border-gray-200">
              <img src={activeImage} alt="Service Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {service.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-32 aspect-video rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === img ? 'border-yellow-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* About This Service */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('services.aboutThisService', 'About This Service')}</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
              {service.description}
            </div>
          </div>

        </div>

        {/* Right Column: Pricing Package */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                  <h3 className="text-xl font-bold text-gray-900">{t('services.standardPackage', 'Standard Package')}</h3>
                  <div className="text-3xl font-bold text-gray-900">${service.price}</div>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  Full UI/UX design for up to 5 pages. Includes responsive design and interactive prototype.
                </p>

                <div className="flex items-center justify-between text-sm text-gray-700 font-semibold mb-6 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {service.deliveryTime} {t('services.daysDelivery', 'Days Delivery')}
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                    {service.revisions} {t('services.revisionsCount', 'Revisions')}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 font-medium text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full py-3.5 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-bold text-lg flex justify-center items-center gap-2 transition-all shadow-sm hover:shadow-md">
                  {t('services.continue', 'Continue')} (${service.price}) <ArrowRight className="w-5 h-5 ml-1" />
                </button>
              </div>
              
              <div className="bg-gray-50/80 p-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>{t('services.securePayment', 'Secure payment via Horr Escrow')}</span>
              </div>
            </div>

            {/* Contact Seller Widget */}
            <div className="mt-6">
              <button className="w-full py-3 px-4 border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 rounded-xl font-semibold transition-colors shadow-sm">
                {t('services.contactSeller', 'Contact Seller')}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
