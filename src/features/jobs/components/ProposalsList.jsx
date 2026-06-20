import ProposalCard from './ProposalCard';

const ProposalsList = ({ proposals, onAccept, onReject, isHistory }) => {
  if (!proposals || proposals.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 1rem',
        background: '#ffffff',
        border: '1px solid #e8e8e8',
        borderRadius: '14px',
      }}>
        <p style={{
          fontSize: '17px',
          fontWeight: '600',
          color: '#1a1a1a',
          margin: '0 0 8px',
        }}>
          {isHistory ? 'No history yet' : 'No proposals yet'}
        </p>
        <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
          {isHistory
            ? 'Accepted and rejected proposals will appear here.'
            : 'When freelancers apply to your jobs, their proposals will appear here.'}
        </p>
      </div>
    );
  }

  // Group proposals by jobPostId
  const grouped = proposals.reduce((acc, proposal) => {
    const key = proposal.jobPostId;
    if (!acc[key]) {
      acc[key] = {
        jobPostTitle: proposal.jobPostTitle,
        jobBudget: proposal.jobBudget,
        jobType: proposal.jobType,
        proposals: [],
      };
    }
    acc[key].proposals.push(proposal);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(grouped).map(([jobPostId, group]) => (
        <div key={jobPostId} style={{ marginBottom: '3rem' }}>

          {/* Job group header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #C9A84C',
          }}>
            {/* Left — job title + pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a' }}>
                {group.jobPostTitle}
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                padding: '3px 10px',
                borderRadius: '99px',
                background: '#EEEDFE',
                color: '#3C3489',
              }}>
                {group.proposals.length} {group.proposals.length === 1 ? 'proposal' : 'proposals'}
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                padding: '3px 10px',
                borderRadius: '99px',
                background: '#EAF3DE',
                color: '#3B6D11',
              }}>
                {group.jobType === 'FixedPrice' ? 'Fixed price' : 'Hourly'}
              </span>
            </div>

            {/* Right — budget */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '11px', color: '#999', margin: '0 0 2px' }}>Budget</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
                {group.jobBudget.toLocaleString()}{' '}
                <span style={{ fontSize: '12px', color: '#999', fontWeight: '400' }}>EGP</span>
              </p>
            </div>
          </div>

          {/* Proposal cards */}
          {group.proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onAccept={onAccept}
              onReject={onReject}
              isHistory={isHistory}
            />
          ))}

        </div>
      ))}
    </div>
  );
};

export default ProposalsList;