import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Unauthorized() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="container mx-auto p-16 text-center max-w-md">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <h1 className="text-3xl text-red-500 font-bold font-cairo">
          {t('unauthorized.title')}
        </h1>
        <p className="text-gray-600 text-lg">
          {t('unauthorized.subtitle')}
        </p>
        <div className="text-sm text-gray-500">
          {t('unauthorized.redirecting', { seconds })}
        </div>
        <div>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-[#eab308] hover:text-[#c29307] font-semibold underline transition-colors"
          >
            {t('unauthorized.clickHere')}
          </button>
        </div>
      </div>
    </div>
  );
}

