"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, Eye, EyeOff } from "lucide-react";
import { DeletePostButton } from "./DeletePostButton";
import type { Post } from "../contracts/posts.contract";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-12 h-12 text-text-quaternary mb-4" />
        <p className="text-text-tertiary font-medium">No posts yet.</p>
        <p className="text-text-quaternary text-sm mt-1">
          Create your first post above.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {posts.map((post) => (
          <motion.li
            key={post.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-4 p-5 rounded-2xl glass-light border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-sm truncate">{post.title}</h3>
                {post.published ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full shrink-0">
                    <Eye className="w-3 h-3" /> Published
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-400/10 px-2 py-0.5 rounded-full shrink-0">
                    <EyeOff className="w-3 h-3" /> Draft
                  </span>
                )}
              </div>
              <p className="text-xs text-text-tertiary line-clamp-2">
                {post.content}
              </p>
              <p className="text-xs text-text-quaternary mt-2">
                By {post.author} ·{" "}
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
            <DeletePostButton postId={post.id} />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
