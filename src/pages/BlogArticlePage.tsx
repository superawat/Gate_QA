import { Link, useParams } from "react-router-dom";
import { FaBookOpen } from "react-icons/fa";
import PageShell from "../components/Layout/PageShell";
import SEOHead from "../components/SEO/SEOHead";
import EditorialPage from "./EditorialPage";
import { getBlogArticleBySlug } from "../utils/blog";
import { BLOG_ROUTE, buildBlogArticlePath } from "../utils/routes";

export default function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return (
      <>
        <SEOHead
          title="Article Not Found | GateQA"
          description="This GateQA guide could not be found. Browse the latest GATE preparation articles."
          path={slug ? buildBlogArticlePath(slug) : BLOG_ROUTE}
          noIndex
        />
        <PageShell contentClassName="flex items-center justify-center py-12">
          <section className="w-full max-w-xl rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-muted)]">
              GateQA Guides
            </p>
            <h1 className="mt-2 text-balance font-display text-3xl leading-tight text-[color:var(--color-text)]">
              Article not found
            </h1>
            <p className="mt-3 text-pretty text-sm leading-6 text-[color:var(--color-text-muted)]">
              The link may be outdated or the article may have moved. Browse the current guides to find what you need.
            </p>
            <Link
              to={BLOG_ROUTE}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[color:var(--color-primary-text)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              <FaBookOpen aria-hidden="true" />
              Browse all articles
            </Link>
          </section>
        </PageShell>
      </>
    );
  }

  return <EditorialPage data={article} />;
}

