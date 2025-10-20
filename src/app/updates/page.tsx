import { getAllUpdates } from '@/lib/content';
import UpdateItem from '@/components/UpdateItem';

export const metadata = {
  title: 'Updates',
  description: 'Latest updates and blog posts about AI, machine learning, and software development',
};

export default function UpdatesPage() {
  const updates = getAllUpdates();

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold">Updates</h1>
      </header>
      
      {updates.length === 0 ? (
        <p className="text-gray-400 text-center py-12 text-base sm:text-lg" role="status">
          No updates yet. Check back soon!
        </p>
      ) : (
        <div className="space-y-6 sm:space-y-8" role="feed" aria-label="Blog updates">
          {updates.map((update, index) => (
            <UpdateItem key={update.slug} update={update} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
