import { getAllUpdates } from '@/lib/content';
import UpdateItem from '@/components/UpdateItem';

export const metadata = {
  title: 'Updates',
  description: 'Latest updates and blog posts about AI, machine learning, and software development',
};

export default function UpdatesPage() {
  const updates = getAllUpdates();

  return (
    <div className="page-top">
      <header className="draw-load">
        <h1 className="page-title">
          <span className="highlight">Updates</span>
        </h1>
      </header>

      {updates.length === 0 ? (
        <p className="mt-16 text-lg text-[var(--color-ink-soft)]" role="status">
          No updates yet. Check back soon!
        </p>
      ) : (
        <div className="mt-8">
          {updates.map((update) => (
            <UpdateItem key={update.slug} update={update} />
          ))}
        </div>
      )}
    </div>
  );
}
