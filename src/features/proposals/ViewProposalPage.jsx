import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { proposalsApi } from '../../api/proposals';

const ViewProposalPage = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await proposalsApi.getProposal(id);
        setProposal(response.data);
      } catch (error) {
        console.error('Error fetching proposal:', error);
        // Fallback for demo
        setProposal({
          id: id,
          title: "React Native Mobile App Development",
          status: "Submitted",
          bidAmount: 45.00,
          description: "Looking for an experienced React Native developer to build a cross-platform mobile app for our e-commerce store.",
          coverLetter: "Hi, I have 3 years of experience with React Native. I have built several apps including a food delivery app and a fitness tracker. I am proficient in Redux, Context API, and integrating REST APIs.",
          jobId: '1'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id]);

  const handleWithdraw = async () => {
    if (!window.confirm(t('proposals.withdraw_confirm'))) return;

    try {
      await proposalsApi.withdrawProposal(id);
      toast.success(t('proposals.withdraw_success'));
      navigate('/proposals/my-proposals');
    } catch (error) {
      toast.error(t('errors.unexpected'));
    }
  };

  if (loading) return <div className="p-8 text-center">{t('common.loading')}</div>;
  if (!proposal) return <div className="p-8 text-center text-red-500">{t('proposals.not_found')}</div>;

  const horrFee = proposal.bidAmount * 0.10;
  const receiveAmount = proposal.bidAmount - horrFee;

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 section-wrapper" style={{ padding: '2rem' }}>
          <h1 className="text-2xl font-bold mb-2">{proposal.title}</h1>
          <div className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm font-medium mb-6">
            {proposal.status}
          </div>

          <div className="section-title text-lg font-semibold mb-4 border-b pb-2">
            {t('job_details.details_title')}
          </div>
          <p className="mb-6 text-gray-700 leading-relaxed">
            {proposal.description}
            <Link to={`/jobs/${proposal.jobId}`} className="text-[#C5A47E] ml-2 font-medium hover:underline">
              {t('proposals.view_posting')}
            </Link>
          </p>

          <div className="section-title text-lg font-semibold mb-4 border-b pb-2">
            {t('proposals.your_proposal')}
          </div>
          <div className="mb-6">
            <div className="font-bold mb-2">{t('proposals.cover_letter')}</div>
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
              {proposal.coverLetter}
            </div>
          </div>
        </div>

        <div className="sidebar-col">
          <div className="section-wrapper" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <h3 className="text-lg font-bold mb-4">{t('proposals.proposed_terms')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('proposals.bid_price')}</span>
                <span className="font-semibold">${proposal.bidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('proposals.service_fee')}</span>
                <span className="font-semibold">-${horrFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100 font-bold">
                <span>{t('proposals.you_receive')}</span>
                <span>${receiveAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {proposal.status === 'Submitted' && (
                <button className="sidebar-btn sidebar-btn-primary w-full">
                  {t('proposals.edit_proposal')}
                </button>
              )}
              <button 
                onClick={handleWithdraw}
                className="sidebar-btn sidebar-btn-outline w-full text-red-500 border-red-200 hover:bg-red-50"
              >
                {t('proposals.withdraw_button')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProposalPage;
