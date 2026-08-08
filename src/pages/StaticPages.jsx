import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGraduationCap, FaEnvelope, FaGithub, FaArrowRight } from "react-icons/fa";
import PageShell from "../components/Layout/PageShell";
import SEOHead from "../components/SEO/SEOHead";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const Section = ({ title, children }) => (
  <section className="space-y-4">
    <h2 className="text-xl sm:text-2xl font-bold text-[color:var(--color-text)] flex items-center gap-3">
      <span className="inline-block w-1 h-6 rounded-full bg-[color:var(--color-primary)] shrink-0" />
      {title}
    </h2>
    <div className="text-base sm:text-lg leading-8 text-[color:var(--color-text-muted)] space-y-3">
      {children}
    </div>
  </section>
);

// ─── About Us ────────────────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <>
      <SEOHead
        title="About GateQA | GATE CS Practice Platform"
        description="GateQA is a free, no-login GATE CS practice platform offering 3,500+ previous year questions from 1987–2026 with subject-wise filters, solutions, and offline support."
        path="/about"
      />
      <PageShell contentClassName="py-6 sm:py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl mx-auto space-y-10"
        >
          <header className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-primary-text)]">
              <FaGraduationCap size={14} />
              About GateQA
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--color-text)] leading-tight">
              About Us
            </h1>
          </header>

          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 md:p-8 shadow-[var(--shadow-soft)] space-y-8">
            <Section title="What is GateQA?">
              <p>
                GateQA is a free, open-access practice platform built specifically for GATE Computer
                Science (CS &amp; IT) aspirants. Our mission is simple: make high-quality exam
                preparation available to every student in India — with zero cost and zero barriers.
              </p>
              <p>
                We provide access to <strong>3,500+ official GATE CS previous year questions (PYQs)</strong> from
                1987 to 2026, complete with subject-wise filters, year-wise sets, detailed solutions,
                and offline-first progress tracking — all without requiring registration or login.
              </p>
            </Section>

            <Section title="Our Mission">
              <p>
                We believe that exam preparation resources should be free and universally accessible.
                GateQA was built to democratize GATE CS preparation by removing paywalls and
                account-creation friction, so that every aspirant can focus entirely on learning.
              </p>
            </Section>

            <Section title="What We Offer">
              <ul className="space-y-2 list-none pl-0">
                {[
                  "3,500+ GATE CS PYQs from 1987–2026, fully organized and searchable",
                  "Subject-wise and year-wise practice filters across 10+ core CS topics",
                  "Full-length year mock tests with timed practice environment",
                  "Interactive virtual calculator widget for numerical problems",
                  "Offline-first architecture — works without a stable internet connection",
                  "Completely free — no login, no subscription, no hidden fees",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-primary)] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Who Builds GateQA?">
              <p>
                GateQA is an independent project maintained by developers passionate about open education. The platform is not affiliated with IITs, IISc, or any official GATE conducting body.
              </p>
            </Section>

            <div className="pt-4 border-t border-[color:var(--color-border)]">
              <Link
                to="/practice"
                className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-all"
              >
                Start Practicing <FaArrowRight size={12} />
              </Link>
            </div>
          </div>
        </motion.div>
      </PageShell>
    </>
  );
}

// ─── Contact Us ──────────────────────────────────────────────────────────────
export function ContactPage() {
  return (
    <>
      <SEOHead
        title="Contact GateQA | Get in Touch"
        description="Contact the GateQA team for feedback, question corrections, content suggestions, or general inquiries about our GATE CS practice platform."
        path="/contact"
      />
      <PageShell contentClassName="py-6 sm:py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl mx-auto space-y-10"
        >
          <header className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary-border)] bg-[color:var(--color-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[color:var(--color-primary-text)]">
              <FaEnvelope size={14} />
              Contact
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--color-text)] leading-tight">
              Contact Us
            </h1>
          </header>

          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 md:p-8 shadow-[var(--shadow-soft)] space-y-8">
            <Section title="Get in Touch">
              <p>
                We welcome feedback, bug reports, question corrections, and content suggestions.
                GateQA is a community-driven platform and your input directly helps improve the
                experience for thousands of GATE aspirants.
              </p>
            </Section>

            <Section title="How to Reach Us">
              <div className="grid gap-4 sm:grid-cols-2">
                <a
                  href="mailto:rawathr01@gmail.com"
                  className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4 hover:border-[color:var(--color-primary-border)] hover:bg-[color:var(--color-primary-soft)] transition-all group"
                >
                  <FaEnvelope size={20} className="text-[color:var(--color-primary-text)] shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[color:var(--color-text)]">Email</p>
                    <p className="text-sm text-[color:var(--color-text-muted)]">rawathr01@gmail.com</p>
                  </div>
                </a>
                <a
                  href="https://github.com/superawat/Gate_QA/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] p-4 hover:border-[color:var(--color-primary-border)] hover:bg-[color:var(--color-primary-soft)] transition-all group"
                >
                  <FaGithub size={20} className="text-[color:var(--color-primary-text)] shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[color:var(--color-text)]">GitHub Issues</p>
                    <p className="text-sm text-[color:var(--color-text-muted)]">Report bugs or request features</p>
                  </div>
                </a>
              </div>
            </Section>

            <Section title="What to Include">
              <ul className="space-y-2">
                {[
                  "For question corrections: mention the question year, set, and the specific issue.",
                  "For feature requests: describe the use case and how it would help aspirants.",
                  "For general feedback: any message is welcome — we read everything.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-primary)] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-[color:var(--color-text)]">
              <strong>Response Time:</strong> We typically respond within 2–5 business days. GateQA is maintained by a small independent team; we appreciate your patience.
            </div>
          </div>
        </motion.div>
      </PageShell>
    </>
  );
}

// ─── Privacy Policy ──────────────────────────────────────────────────────────
export function PrivacyPage() {
  return (
    <>
      <SEOHead
        title="Privacy Policy | GateQA"
        description="GateQA Privacy Policy — learn how we protect your data. Guest mode remains default with optional Google Authentication for multi-device cloud backup."
        path="/privacy"
      />
      <PageShell contentClassName="py-6 sm:py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl mx-auto space-y-10"
        >
          <header className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--color-text)] leading-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">Last updated: August 2026</p>
          </header>

          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 md:p-8 shadow-[var(--shadow-soft)] space-y-8">
            <Section title="Overview & Philosophy">
              <p>
                GateQA (<strong>gateqa.in</strong>) is committed to protecting your privacy and student data.
                Our core philosophy is **Zero Friction & Zero Data Loss**: Guest Mode is the default for everyone, no login is required, and your study data is always preserved locally on your device.
              </p>
            </Section>

            <Section title="Information We Process & Store">
              <p>
                <strong>Guest Mode (Default):</strong> No account, name, or email is required to practice questions, take mock exams, or save personal notes. All progress is saved exclusively to your browser's local storage (`localStorage`).
              </p>
              <p>
                <strong>Optional Account & Cloud Backup:</strong> If you choose to sign in with Google Authentication (powered by Supabase), we process:
              </p>
              <ul className="space-y-2">
                {[
                  "Account Profile: Your Google email address, display name, and avatar picture URL to identify your account and render your profile badge.",
                  "Synced Progress Data: An encrypted cloud backup of your bookmarks, personal question notes, solved question IDs, and mock test scores.",
                  "Local Pre-Merge Snapshots: Automatic local backups created prior to any cloud sync to guarantee zero data loss.",
                  "Server Logs: Standard secure access logs (IP address, user-agent, timestamp) for rate limiting, security monitoring, and fraud prevention.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-primary)] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="How We Use Your Information">
              <p>
                We use your profile and study data strictly to:
              </p>
              <ul className="space-y-2">
                {[
                  "Synchronize your bookmarks, notes, and solved questions seamlessly across your devices.",
                  "Restore your progress if you switch devices or clear your browser cache.",
                  "Maintain service reliability, performance monitoring, and security.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-primary)] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-medium text-[color:var(--color-text)]">
                We never sell, rent, trade, or share your personal information or study notes with third-party advertisers.
              </p>
            </Section>

            <Section title="Cookies & Local Storage">
              <p>
                GateQA uses `localStorage` for instant performance and offline study support. Minimal essential cookies or session tokens are used exclusively to maintain your signed-in session state. We do not use intrusive cross-site tracking cookies.
              </p>
            </Section>

            <Section title="Data Control, Export & Deletion Rights">
              <p>
                Your study data belongs entirely to you. You have the right to:
              </p>
              <ul className="space-y-2">
                {[
                  "One-Click Data Export: Download a complete JSON file containing all your bookmarks, notes, and mock attempts at any time.",
                  "Sign Out Anytime: Signing out leaves your local progress intact on your device so you can continue in Guest Mode.",
                  "Account Deletion: Request account deletion to permanently purge all cloud backups from our database.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-primary)] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Changes to This Policy">
              <p>
                We may update this Privacy Policy to reflect platform enhancements or security updates. Any changes will be published here with an updated revision date.
              </p>
            </Section>

            <Section title="Contact Us">
              <p>
                For questions regarding your privacy, data export, or account management, email us at{" "}
                <a href="mailto:rawathr01@gmail.com" className="text-[color:var(--color-primary-text)] underline">rawathr01@gmail.com</a>.
              </p>
            </Section>
          </div>
        </motion.div>
      </PageShell>
    </>
  );
}

// ─── Terms and Conditions ────────────────────────────────────────────────────
export function TermsPage() {
  return (
    <>
      <SEOHead
        title="Terms and Conditions | GateQA"
        description="GateQA Terms and Conditions — rules and guidelines for using the GateQA GATE CS practice platform."
        path="/terms"
      />
      <PageShell contentClassName="py-6 sm:py-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="max-w-3xl mx-auto space-y-10"
        >
          <header className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[color:var(--color-text)] leading-tight">
              Terms and Conditions
            </h1>
            <p className="text-sm text-[color:var(--color-text-muted)]">Last updated: June 2026</p>
          </header>

          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 sm:p-6 md:p-8 shadow-[var(--shadow-soft)] space-y-8">
            <Section title="Acceptance of Terms">
              <p>
                By accessing and using GateQA (<strong>gateqa.in</strong>), you agree to be bound
                by these Terms and Conditions. If you do not agree to these terms, please do not
                use the platform.
              </p>
            </Section>

            <Section title="Use of the Platform">
              <p>GateQA is provided for personal, non-commercial educational use. You agree not to:</p>
              <ul className="space-y-2">
                {[
                  "Reproduce, redistribute, or sell any content from GateQA without explicit written permission.",
                  "Attempt to disrupt, hack, or compromise the security of the platform.",
                  "Misrepresent the source of content obtained from GateQA.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-[color:var(--color-primary)] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Intellectual Property">
              <p>
                GATE examination questions are the intellectual property of the Indian Institute of
                Technology (IIT) system and the National Coordination Board — GATE. GateQA presents
                these questions for educational reference purposes only. GateQA is not affiliated
                with, endorsed by, or officially connected to any IIT, IISc, or the GATE conducting
                authority.
              </p>
              <p>
                The GateQA platform design, code, and original content are owned by the GateQA
                team and are protected under applicable copyright law.
              </p>
            </Section>

            <Section title="Disclaimer of Warranties">
              <p>
                GateQA is provided on an <strong>"as is"</strong> basis without warranties of any
                kind. We do not guarantee the accuracy, completeness, or timeliness of any content,
                including question solutions and syllabus information. Always verify critical
                information against the official GATE website.
              </p>
            </Section>

            <Section title="Limitation of Liability">
              <p>
                GateQA and its maintainers shall not be liable for any direct, indirect, incidental,
                or consequential damages arising from the use or inability to use the platform,
                including but not limited to exam performance outcomes.
              </p>
            </Section>

            <Section title="Changes to Terms">
              <p>
                We reserve the right to update these Terms at any time. Changes will be reflected
                on this page with an updated date. Continued use of GateQA following any changes
                constitutes your acceptance of the revised terms.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                For questions about these Terms, contact us at{" "}
                <a href="mailto:rawathr01@gmail.com" className="text-[color:var(--color-primary-text)] underline">rawathr01@gmail.com</a>.
              </p>
            </Section>
          </div>
        </motion.div>
      </PageShell>
    </>
  );
}
