"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Update } from '@/lib/content';

interface UpdateItemProps {
  update: Update;
  index?: number;
}

export default function UpdateItem({ update, index = 0 }: UpdateItemProps) {
  // Format date to readable format
  const formattedDate = new Date(update.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="border-b border-neutral-700 pb-6 last:border-b-0"
    >
      <Link 
        href={`/updates/${update.slug}`}
        className="group block focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-md p-2 -m-2"
        aria-label={`Read update: ${update.title}`}
      >
        <motion.div
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-2 group-hover:text-blue-400 transition-colors duration-300">
            {update.title}
          </h2>
          <time 
            className="text-sm text-gray-400 mb-3 block"
            dateTime={update.date}
          >
            {formattedDate}
          </time>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            {update.summary}
          </p>
          {update.tags && update.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3" role="list" aria-label="Tags">
              {update.tags.map((tag) => (
                <span
                  key={tag}
                  role="listitem"
                  className="text-xs px-2 py-1 bg-neutral-800 text-gray-400 rounded transition-colors duration-200 group-hover:bg-neutral-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </Link>
    </motion.article>
  );
}
