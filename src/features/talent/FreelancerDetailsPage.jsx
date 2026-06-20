import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchFreelancerDetails,
  toggleSaveFreelancer,
  clearSelectedFreelancer,
} from "./talentSlice";
import { mapFreelancerDetails } from "./freelancerDetailsMapper";
import { getClientJobs, sendConversationMessage, sendJobInvitation } from "../../services/clientService";
import FreelancerHeaderCard from "./components/FreelancerHeaderCard";
import FreelancerMainInfoCard from "./components/FreelancerMainInfoCard";
import FreelancerDetailsSidebarCard from "./components/FreelancerDetailsSidebarCard";
import FreelancerSkillsCard from "./components/FreelancerSkillsCard";
import FreelancerLanguagesCard from "./components/FreelancerLanguagesCard";
import FreelancerEducationCard from "./components/FreelancerEducationCard";
import FreelancerEmploymentCard from "./components/FreelancerEmploymentCard";
import FreelancerPortfolioCard from "./components/FreelancerPortfolioCard";
import FreelancerReviewsCard from "./components/FreelancerReviewsCard";
import FreelancerDetailsSkeleton from "./components/FreelancerDetailsSkeleton";
import "./styles/freelancerDetails.css";

export default function FreelancerDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { selectedFreelancer, detailsLoading, detailsError } = useSelector(
    (state) => state.talent
  );

  const [inviteOpen, setInviteOpen] = useState(
    () => searchParams.get("invite") === "true"
  );
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [message, setMessage] = useState(
    "Hi, I would like to invite you to discuss my job post."
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchFreelancerDetails(id));
    }
    return () => {
      dispatch(clearSelectedFreelancer());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (!inviteOpen) return;

    const fetchJobs = async () => {
      setJobsLoading(true);
      setJobsError(null);
      try {
        const response = await getClientJobs();
        const rawJobs = Array.isArray(response)
          ? response
          : response?.data || [];
        setJobs(Array.isArray(rawJobs) ? rawJobs : []);
        if (Array.isArray(rawJobs) && rawJobs.length > 0) {
          setSelectedJobId((current) => current || rawJobs[0].id || "");
        }
      } catch (err) {
        setJobsError(
          err.response?.data?.message || err.message || "Unable to load job list."
        );
      } finally {
        setJobsLoading(false);
      }
    };

    fetchJobs();
  }, [inviteOpen]);

  const freelancer = useMemo(() => {
    if (!selectedFreelancer?.data) return null;
    return mapFreelancerDetails(selectedFreelancer.data, {
      id: selectedFreelancer.userIdHash,
      isSaved: selectedFreelancer.isSaved,
    });
  }, [selectedFreelancer]);

  if (detailsLoading && !freelancer) {
    return <FreelancerDetailsSkeleton />;
  }

  if (detailsError || !freelancer) {
    return (
      <div className="fd-page">
        <div className="fd-shell">
          <div className="fd-section-card fd-center-state">
            <h2>Unable to load profile</h2>
            <p>{detailsError || "Freelancer profile could not be found."}</p>
            <Link to="/client/search-talent" className="fd-back-link">
              Back to search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleSave = () => {
    dispatch(
      toggleSaveFreelancer({
        freelancerId: freelancer.id,
        isSaved: freelancer.isSaved,
      })
    );
  };

  const handleInvite = () => {
    setInviteOpen((open) => !open);
    setInviteSuccess("");
    setInviteError(null);
  };

  const handleSendInvite = async () => {
    if (!selectedJobId) {
      setInviteError("Select a job before sending the invitation.");
      return;
    }

    if (!freelancer?.id) {
      setInviteError("Unable to resolve freelancer identifier.");
      return;
    }

    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess("");

    try {
      await sendJobInvitation({
        jobPostId: selectedJobId,
        freelancerId: freelancer.id,
        message: message,
      });
      setInviteSuccess("Invitation sent successfully.");
      toast.success("Invitation sent successfully.");
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Failed to send invitation.";
      setInviteError(message);
      toast.error(message);
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="fd-page">
      <div className="fd-shell">
        <nav className="fd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/client/search-talent" className="fd-breadcrumb-link">
            Search Talent
          </Link>
          <span className="fd-breadcrumb-sep" aria-hidden="true">
            /
          </span>
          <span className="fd-breadcrumb-current">{freelancer.fullName}</span>
        </nav>

        <FreelancerHeaderCard
          freelancer={freelancer}
          onToggleSave={handleToggleSave}
          onInvite={handleInvite}
        />

        {inviteOpen && (
          <section className="fd-invite-panel">
            <button
              type="button"
              className="fd-invite-close-btn"
              onClick={() => {
                setInviteOpen(false);
                setInviteError(null);
                setInviteSuccess("");
              }}
              aria-label="Close invitation panel"
            >
              ×
            </button>
            <div className="fd-invite-panel-body">
              <div className="fd-invite-panel-copy">
                <p className="fd-invite-panel-label">Invite this freelancer</p>
                <h2 className="fd-invite-panel-title">Send a job invitation</h2>
                <p className="fd-invite-panel-description">
                  Choose one of your job posts and send a message so the freelancer can review the opportunity.
                </p>
              </div>

              <div className="fd-invite-panel-controls">
                <label className="fd-invite-select-label" htmlFor="invite-job-select">
                  Select a job post
                </label>
                <select
                  id="invite-job-select"
                  className="fd-invite-select"
                  value={selectedJobId}
                  onChange={(event) => setSelectedJobId(event.target.value)}
                  disabled={jobsLoading || jobs.length === 0}
                >
                  <option value="">Select a job post</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title || job.name || `Job ${job.id}`}
                    </option>
                  ))}
                </select>

                <label className="fd-invite-select-label" htmlFor="invite-message" style={{ marginTop: '0.5rem' }}>
                  Message
                </label>
                <textarea
                  id="invite-message"
                  className="fd-invite-textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your invitation message..."
                  rows={4}
                  maxLength={1000}
                />
                <div className="fd-invite-remaining">{message.length}/1000</div>

                <button
                  type="button"
                  className="fd-invite-send-btn"
                  onClick={handleSendInvite}
                  disabled={inviteLoading || jobsLoading || !selectedJobId}
                >
                  {inviteLoading ? "Sending invitation…" : "Send Invitation"}
                </button>
              </div>

              {jobsError && <p className="fd-invite-error">{jobsError}</p>}
              {inviteError && <p className="fd-invite-error">{inviteError}</p>}
              {inviteSuccess && <p className="fd-invite-success">{inviteSuccess}</p>}
            </div>
          </section>
        )}

        <div className="fd-grid">
          <aside className="fd-column-left">
            <FreelancerDetailsSidebarCard freelancer={freelancer} />
          </aside>

          <div className="fd-column-right">
            <FreelancerMainInfoCard freelancer={freelancer} />
            <FreelancerSkillsCard skills={freelancer.skills} />
            <FreelancerLanguagesCard
              languages={freelancer.languages}
              formatLanguage={freelancer.formatLanguage}
            />
            <FreelancerEducationCard
              education={freelancer.education}
              formatEducation={freelancer.formatEducation}
            />
            <FreelancerEmploymentCard
              employmentHistory={freelancer.employmentHistory}
              formatExperience={freelancer.formatExperience}
            />
            <FreelancerPortfolioCard portfolio={freelancer.portfolio} />
            <FreelancerReviewsCard reviews={freelancer.reviews} />
          </div>
        </div>
      </div>
    </div>
  );
}
