import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Paperclip, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { contractsService } from '../../../services/contractsService';
import { getChatByContract } from '../../../services/chatService';

function formatEgp(amount) {
  if (amount == null) return '';
  const n = Number(amount);
  return `EGP ${new Intl.NumberFormat('en-EG').format(n)}`;
}

export default function ContractDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchContract = useCallback(async () => {
    try {
      setLoading(true);
      const contractData = await contractsService.getContract(id);
      setContract(contractData);
      try {
        const resDeliveries = await contractsService.getDeliveries(id);
        setDeliveries(Array.isArray(resDeliveries) ? resDeliveries : []);
      } catch (err) {
        console.error('Failed to load deliveries:', err);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load contract details.');
      navigate('/client/contracts');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      await Promise.resolve();
      if (active) {
        fetchContract();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchContract]);

  const submitReview = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating before submitting.");
      return;
    }
    
    setReviewSubmitting(true);
    try {
      const res = await contractsService.submitReview(id, { rating, comment });
      toast.success('Feedback submitted successfully');
      
      // Update contract state to hide form & show review
      setContract(prev => ({
        ...prev,
        review: res.data || { rating, comment }
      }));
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('You have already submitted feedback for this contract.');
      } else {
        toast.error(err.response?.data?.message || err.message || 'Failed to submit feedback.');
      }
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMessageFreelancer = async () => {
    try {
      setLoading(true);
      const chatObj = await getChatByContract(id);
      const targetChatId = chatObj?.chatId ?? chatObj?.ChatId ?? chatObj?.id ?? chatObj?.Id;
      if (targetChatId) {
        navigate(`/client/messages/${targetChatId}`);
      } else {
        toast.error('Could not resolve chat ID');
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
      toast.error('Failed to open chat.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#B7A06A] border-t-transparent"></div>
      </div>
    );
  }

  if (!contract) return null;

  const statusVal = contract.status !== undefined ? contract.status : contract.Status;
  const statusStr = String(statusVal != null ? statusVal : '').toLowerCase();
  const isActive = statusStr === 'active' || statusStr === '1';
  const isClosed = statusStr === 'closed' || statusStr === 'completed' || statusStr === '2' || statusStr === '5';
  const title = contract.proposal_Title || contract.proposalTitle || contract.jobTitle || contract.JobTitle || contract.title || 'Contract';
  const freelancerName = contract.freelancerName ?? contract.freelancer_Name ?? contract.FreelancerName ?? contract.Freelancer_Name ?? contract.freelancer?.name ?? contract.freelancer?.Name ?? 'Freelancer';
  const rate = contract.agreedRate || contract.AgreedRate;
  const started = contract.startedAt || contract.startDate || contract.StartedAt;
  const formattedStartDate = started ? new Date(started).toLocaleDateString() : 'N/A';
  const dueDate = contract.dueDate || contract.DueDate;
  const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A';
  const description = contract.description || contract.Description || 'This contract involves the full scope of work as discussed in the proposal. The goal is to deliver high-quality results within the agreed timeline.';
  const review = contract.review || contract.Review || null;
  const hasPending = deliveries?.some(d => {
    const s = String(d.status ?? d.Status ?? '').toLowerCase();
    return s === 'pending' || s === '0';
  });

  return (
    <div style={{ maxWidth: '850px', width: '100%', margin: '0 auto', padding: '2.5rem 3rem', boxSizing: 'border-box' }}>
      
      {/* Back button */}
      <button
        onClick={() => navigate('/client/contracts')}
        style={{
          fontSize: '13px',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginBottom: '1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      >
        ← Back to My Contracts
      </button>

      <div className="details-card" style={{
        background: '#ffffff',
        border: '1px solid #e8e8e8',
        borderRadius: '14px',
        padding: '2.5rem 2.75rem',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <div className="contract-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.75rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid #f0f0f0',
          width: '100%',
        }}>
          <div className="header-left">
            <h1 id="contract-title" style={{ fontSize: '22px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 6px 0' }}>
              {title}
            </h1>
            <div className="client-subtitle" style={{ fontSize: '14px', color: '#666' }}>
              Freelancer: <span style={{ fontWeight: '500', color: '#1a1a1a' }}>{freelancerName}</span>
            </div>
          </div>
          <div className="header-right header-buttons" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isActive && hasPending && (
              <button
                className="btn-specialist"
                onClick={() => navigate(`/client/contracts/${id}/deliveries`)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: '1px solid #e0e0e0',
                  background: '#ffffff',
                  color: '#555',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f7f7f5';
                  e.currentTarget.style.borderColor = '#ccc';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                Request Specialist
              </button>
            )}
            {isActive && (
              <button
                className="btn-deliver"
                onClick={() => navigate(`/client/contracts/${id}/deliveries`)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: '1px solid #B7A06A',
                  background: '#B7A06A',
                  color: '#fff',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#a08d5a'}
                onMouseLeave={e => e.currentTarget.style.background = '#B7A06A'}
              >
                View Delivery Portal
              </button>
            )}
            <button
              className="btn-message"
              onClick={handleMessageFreelancer}
              title="Message Freelancer"
              style={{
                background: '#ffffff',
                border: '1px solid #e8e8e8',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#555',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#B7A06A';
                e.currentTarget.style.color = '#B7A06A';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e8e8e8';
                e.currentTarget.style.color = '#555';
              }}
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>

        {/* Terms Grid */}
        <div className="section-title" style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.25rem' }}>
          Contract Terms
        </div>
        <div className="terms-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '2rem',
          width: '100%',
        }}>
          <div className="term-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="term-label" style={{ fontSize: '13px', color: '#888' }}>Price</span>
            <span className="term-value" style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>{formatEgp(rate)}</span>
          </div>
          <div className="term-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="term-label" style={{ fontSize: '13px', color: '#888' }}>Start Date</span>
            <span className="term-value" style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>{formattedStartDate}</span>
          </div>
          <div className="term-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="term-label" style={{ fontSize: '13px', color: '#888' }}>Due Date</span>
            <span className="term-value" style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>{formattedDueDate}</span>
          </div>
          <div className="term-item" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="term-label" style={{ fontSize: '13px', color: '#888' }}>Status</span>
            <span className="term-value" style={{ fontSize: '16px', fontWeight: '600' }}>
              <span className={`contract-status ${isActive ? 'status-active' : 'status-closed'}`}>
                {isActive ? 'Active' : 'Closed'}
              </span>
            </span>
          </div>
        </div>

        <div className="section-title" style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.25rem' }}>
          Description
        </div>
        <div className="description-box mb-8 whitespace-pre-wrap" style={{
          fontSize: '14px',
          lineHeight: '1.7',
          color: '#444',
          padding: '1.25rem 1.5rem',
          background: '#fcfcfc',
          borderRadius: '10px',
          border: '1px solid #e8e8e8',
          marginBottom: '2rem',
          width: '100%',
          boxSizing: 'border-box',
        }}>
          {description}
        </div>

        {/* Delivery History */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.5rem', marginBottom: '2rem', width: '100%' }}>
            <div className="section-title" style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.25rem' }}>
              Delivery History
            </div>
            {(!deliveries || deliveries.length === 0) ? (
               <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>No deliveries submitted yet</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                   {deliveries.map((delivery, idx) => {
                      const dStatus = delivery.status || 'Delivered';
                      const dNote = delivery.deliveryNote || delivery.note || '';
                      const dDate = delivery.submittedAt || delivery.date || new Date().toISOString();
                      const dAttachments = delivery.attachments || delivery.files || [];

                      return (
                        <div key={delivery.id || idx} style={{
                          padding: '1.25rem 1.5rem',
                          border: '1px solid #e8e8e8',
                          borderRadius: '12px',
                          background: '#fafafa',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', width: '100%' }}>
                               <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{new Date(dDate).toLocaleDateString()}</div>
                               <span style={{
                                 fontSize: '11px',
                                 background: '#e8e8e8',
                                 color: '#555',
                                 padding: '3px 10px',
                                 borderRadius: '99px',
                                 fontWeight: '500',
                               }}>{dStatus}</span>
                            </div>
                            {dNote && <p style={{ fontSize: '14px', color: '#555', margin: '0 0 0.75rem 0', whitespace: 'pre-wrap', lineHeight: '1.6' }}>{dNote}</p>}
                            {dAttachments.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%' }}>
                                 {dAttachments.map((f, i) => {
                                   const fName = f.name || f.fileName || f.originalFileName || 'Attachment';
                                   return (
                                     <span key={f.id || i} style={{
                                       fontSize: '12px',
                                       background: '#ffffff',
                                       border: '1px solid #e0e0e0',
                                       padding: '4px 12px',
                                       borderRadius: '99px',
                                       display: 'inline-flex',
                                       alignItems: 'center',
                                       gap: '6px',
                                       color: '#555',
                                       boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                     }}>
                                       <Paperclip size={12}/>
                                       {fName}
                                     </span>
                                   );
                                 })}
                              </div>
                            )}
                        </div>
                      );
                   })}
                </div>
            )}
        </div>

        {/* Contract Closed Notice OR Review Section */}
        {isClosed && (
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.5rem', width: '100%' }}>
                {!review ? (
                    <>
                        <div style={{
                          marginBottom: '1.25rem',
                          padding: '1rem',
                          background: '#fcfaf6',
                          color: '#B7A06A',
                          borderRadius: '10px',
                          fontSize: '14px',
                          textAlign: 'center',
                          fontWeight: '500',
                          border: '1px solid #f5ebd5',
                          width: '100%',
                          boxSizing: 'border-box',
                        }}>
                            This contract is closed.
                        </div>
                        <div className="section-title" style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', marginBottom: '1.25rem' }}>
                          Rate Freelancer
                        </div>
                        <div className="star-rating" style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <span 
                                    key={star} 
                                    style={{
                                      fontSize: '28px',
                                      cursor: 'pointer',
                                      transition: 'color 0.2s',
                                      color: rating >= star ? '#FFC107' : '#e0e0e0'
                                    }}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <textarea 
                          style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: '1rem',
                            fontSize: '14px',
                            color: '#1a1a1a',
                            background: '#ffffff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '12px',
                            resize: 'vertical',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                            marginBottom: '1rem',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                          }}
                          placeholder="Share your experience working with this freelancer…"
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                        />
                        <button 
                          onClick={submitReview}
                          disabled={reviewSubmitting}
                          style={{
                            padding: '10px 24px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            border: '1px solid #B7A06A',
                            background: '#B7A06A',
                            color: '#fff',
                            fontWeight: '600',
                            transition: 'background 0.2s',
                            opacity: reviewSubmitting ? 0.6 : 1,
                          }}
                          onMouseEnter={e => {
                            if (!reviewSubmitting) e.currentTarget.style.background = '#a08d5a';
                          }}
                          onMouseLeave={e => {
                            if (!reviewSubmitting) e.currentTarget.style.background = '#B7A06A';
                          }}
                        >
                          {reviewSubmitting ? 'Loading...' : 'Submit Feedback'}
                        </button>
                    </>
                ) : (
                    <div style={{
                      background: '#f5fbf2',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #e2f0d9',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}>
                        <div className="section-title" style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Your Review</div>
                        <div style={{ color: '#FFC107', fontSize: '24px', marginBottom: '8px', lineHeight: 1 }}>{'★'.repeat(review.rating || 5)}</div>
                        {review.comment && <p style={{ color: '#555', fontStyle: 'italic', margin: 0 }}>"{review.comment}"</p>}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
