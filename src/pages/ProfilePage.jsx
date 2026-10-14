import React from "react";
import PageShell from "../components/Layout/PageShell";
import SEOHead from "../components/SEO/SEOHead";
import UserProfileHub from "../components/Profile/UserProfileHub";
import { PROFILE_ROUTE } from "../utils/routes";

const ProfilePage = () => {
  return (
    <>
      <SEOHead
        title="Candidate Profile & Discipline Hub | GateQA"
        description="Manage enrolled GATE disciplines, switch active examination tracks, set target goals, and configure cloud synchronization."
        path={PROFILE_ROUTE}
      />
      <PageShell contentClassName="py-6 sm:py-8">
        <UserProfileHub />
      </PageShell>
    </>
  );
};

export default ProfilePage;
