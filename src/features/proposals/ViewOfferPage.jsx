import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { proposalsApi } from '../../api/proposals';

const ViewOfferPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const response = await proposalsApi.getOffer(id);
        setOffer(response.data);
      } catch (error) {
        console.error('Error fetching offer:', error);
        // Fallback for demo
        setOffer({
          id: id,
          title: "Senior Frontend Developer",
          clientName: "TechCorp Inc.",
          amount: 60.00,
          weeklyLimit: "40 hrs/week",
          startDate: "Jan 28, 2026",
          message: "Hi there! We were impressed with your profile and previous work. We'd like to offer you the position of Senior Frontend Developer on our team. Please review the terms and let us know if you have any questions!"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  const handleAccept = async () => {
    if (!window.confirm(t('proposals.accept_offer_confirm'))) return;

    try {
      await proposalsApi.acceptOffer(id);
      toast.success(t('proposals.accept_offer_success'));
      navigate('/contracts'); // Assuming there is a contracts page
    } catch (error) {
      toast.error(t('errors.unexpected'));
    }
  };

  const handleDecline = async () => {
    const reason = window.prompt(t('proposals.decline_reason_prompt'));
    if (reason === null) return;

    try {
      await proposalsApi.declineOffer(id, reason);
      toast.success(t('proposals.decline_offer_success'));
      navigate('/proposals/my-proposals');
    } catch (error) {
      toast.error(t('errors.unexpected'));
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;
  if (!offer) return <div className="p-8 text-center text-red-500">{t('proposals.offer_not_found')}</div>;

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <div className="section-wrapper mx-auto" style={{ maxWidth: '900px', padding: '2.5rem' }}>
        <div className="border-b border-gray-100 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('proposals.offer_prefix')}: {offer.title}
          </h1>
          <div className="text-lg text-gray-500">{offer.clientName}</div>
        </div>

        <div className="section-title text-xl font-semibold mb-6">{t('proposals.contract_terms')}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="term-item">
            <label className="block text-sm text-gray-500 mb-1">{t('proposals.contract_title')}</label>
            <div className="font-semibold text-lg">{offer.title}</div>
          </div>
          <div className="term-item">
            <label className="block text-sm text-gray-500 mb-1">{t('proposals.amount')}</label>
            <div className="font-semibold text-lg">${offer.amount.toFixed(2)}</div>
          </div>
          <div className="term-item">
            <label className="block text-sm text-gray-500 mb-1">{t('proposals.weekly_limit')}</label>
            <div className="font-semibold text-lg">{offer.weeklyLimit}</div>
          </div>
          <div className="term-item">
            <label className="block text-sm text-gray-500 mb-1">{t('proposals.start_date')}</label>
            <div className="font-semibold text-lg">{offer.startDate}</div>
          </div>
        </div>

        <div className="section-title text-xl font-semibold mb-4">{t('proposals.message_from_client')}</div>
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-10 text-gray-700 leading-relaxed italic">
          "{offer.message}"
        </div>

        <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
          <button 
            onClick={handleAccept}
            className="btn sidebar-btn-primary rounded-full px-10 py-3 font-bold"
          >
            {t('proposals.accept_offer')}
          </button>
          <button 
            onClick={handleDecline}
            className="btn bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-full px-10 py-3 font-bold"
          >
            {t('proposals.decline_offer')}
          </button>
          <button 
            onClick={() => navigate('/messages')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full px-10 py-3 font-bold"
          >
            {t('proposals.message_client')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOfferPage;
