"use client";

import { useState, useEffect, useMemo } from "react";
import { Star, CheckCircle2, Film, MessageSquare, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getReviews, canUserReview, addReview } from "@/lib/actions";

interface ProductReviewsProps {
  produtoId: string;
  initialReviews?: any[];
  canReviewInitially?: boolean;
}

export function ProductReviews({
  produtoId,
  initialReviews = [],
  canReviewInitially = false
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<any[]>(initialReviews);
  const [canReview, setCanReview] = useState(canReviewInitially);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  // useEffect for initial fetch is removed because data comes from SSR now.

  // Calculate review statistics
  const stats = useMemo(() => {
    if (reviews.length === 0) return null;
    const counts = [0, 0, 0, 0, 0, 0]; // 0-5
    let totalScore = 0;
    reviews.forEach(r => {
      counts[r.rating]++;
      totalScore += r.rating;
    });
    const avg = totalScore / reviews.length;
    return {
      average: avg,
      counts: counts.slice(1).reverse(), // 5, 4, 3, 2, 1
      total: reviews.length
    };
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment) return;

    setIsSubmitting(true);
    try {
      await addReview({ produtoId, rating, texto: comment });
      setComment("");
      setShowForm(false);
      const r = await getReviews(produtoId);
      setReviews(r);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Header & Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-tight light:text-black">
              Verified Experience
            </h2>
            <p className="text-[10px] font-medium text-white/50 uppercase tracking-[0.2em] light:text-black/50">
              Real feedback from our global community
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-6xl font-black text-white tracking-tighter light:text-black">
              {stats?.average.toFixed(1) || "5.0"}
            </div>
            <div className="space-y-1">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.round(stats?.average || 5) ? "fill-accent text-accent" : "text-white/10 light:text-black/10"}
                  />
                ))}
              </div>
              <p className="text-[10px] font-black uppercase text-white/60 tracking-luxury light:text-black/60">
                Based on {reviews.length} reviews
              </p>
            </div>
          </div>

          {canReview && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="group flex items-center gap-3 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-accent transition-all light:bg-black light:text-white"
            >
              <Plus size={14} />
              Share Your Experience
            </button>
          )}
        </div>

        <div className="md:col-span-7 space-y-4 bg-white/[0.02] p-6 md:p-8 rounded-2xl border border-white/5 light:bg-black/[0.02] light:border-black/10">
          {stats ? (
            stats.counts.map((count, i) => {
              const stars = 5 - i;
              const percentage = (count / stats.total) * 100;
              return (
                <div key={stars} className="flex items-center gap-4 group">
                  <span className="w-4 text-xs font-medium text-white/60 group-hover:text-white transition-colors light:text-black/60 light:group-hover:text-black">
                    {stars}
                  </span>
                  <div className="flex-grow h-1 bg-white/[0.05] rounded-full overflow-hidden light:bg-black/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-accent"
                    />
                  </div>
                  <span className="w-8 text-[10px] font-bold text-white/60 text-right light:text-black/60">
                    {Math.round(percentage)}%
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 light:text-black/30">Awaiting your first review</p>
            </div>
          )}
        </div>
      </div>

      {/* Write Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="p-10 bg-white/[0.03] rounded-[2rem] border border-white/10 space-y-8 backdrop-blur-xl light:bg-black/[0.03] light:border-black/10"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-white uppercase tracking-luxury light:text-black">Submit Your Review</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-white/40 hover:text-white transition-colors light:text-black/40 light:hover:text-black"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 light:text-black/40">Overall Rating</label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform active:scale-95 group"
                    >
                      <Star
                        size={28}
                        className={`${star <= rating ? "fill-accent text-accent" : "text-white/10 group-hover:text-white/30 light:text-black/10 light:group-hover:text-black/30"} transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 light:text-black/40">Review Content</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="The craftsmanship of this piece exceeded my expectations..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-white placeholder:text-white/10 focus:outline-none focus:border-accent/50 min-h-[140px] transition-all resize-none light:bg-black/5 light:border-black/10 light:text-black light:placeholder:text-black/30"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-accent disabled:opacity-50 transition-all shadow-xl shadow-white/5 light:bg-black light:text-white light:shadow-black/5"
              >
                {isSubmitting ? "Processing..." : "Publish Review"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-12">
            {reviews.map((review, idx) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                key={review.id}
                className="group relative"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Left Column: User & Meta */}
                  <div className="md:w-64 shrink-0 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black uppercase text-white tracking-widest light:text-black">
                          {review.userName}
                        </span>
                        <CheckCircle2 size={12} className="text-accent" />
                      </div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest light:text-black/30">
                        {new Date(review.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex gap-1 pb-4 border-b border-white/5 light:border-black/10">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? "fill-accent text-accent" : "text-white/5 light:text-black/10"}
                        />
                      ))}
                    </div>

                    <span className="inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-luxury text-white/40 light:text-black/40">
                      North Mind Verified
                    </span>
                  </div>

                  {/* Right Column: Content & Media */}
                  <div className="flex-grow space-y-6">
                    <p className="text-sm md:text-base leading-relaxed text-white/80 font-medium font-plus-jakarta-sans italic light:text-black/70">
                      &quot;{review.texto}&quot;
                    </p>

                    {/* Media Gallery */}
                    {(review.fotos?.length > 0 || review.videoUrl) && (
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-4">
                        {review.videoUrl && (
                          <div className="relative h-40 aspect-[4/5] rounded-2xl overflow-hidden border border-accent/20 bg-black shrink-0 group/video cursor-pointer">
                            <video
                              src={review.videoUrl}
                              className="w-full h-full object-cover opacity-80 group-hover/video:opacity-100 transition-opacity"
                              muted
                              loop
                              onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                              onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                            />
                            <div className="absolute top-3 right-3 p-1.5 bg-accent rounded-full text-black">
                              <Film size={12} />
                            </div>
                          </div>
                        )}
                        {review.fotos?.map((foto: string, i: number) => (
                          <div key={i} className="relative h-40 aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-white/5 shrink-0 hover:border-white/30 transition-all duration-700 hover:scale-[1.02] light:border-black/10 light:bg-black/5 light:hover:border-black/20">
                            <img
                              src={foto}
                              alt="Review detail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Separator */}
                <div className="absolute -bottom-6 left-0 right-0 h-[1px] bg-gradient-to-r from-white/10 to-transparent opacity-50 light:from-black/10" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white/[0.02] border border-dashed border-white/5 rounded-[3rem] group hover:border-white/10 transition-all duration-1000 light:bg-black/[0.02] light:border-black/10 light:hover:border-black/20">
            <div className="size-20 mx-auto rounded-full border border-white/5 flex items-center justify-center mb-6 bg-black/40 light:border-black/10 light:bg-black/5">
              <MessageSquare size={24} className="text-white/10 group-hover:text-accent transition-colors light:text-black/20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-hover:text-white/40 transition-colors light:text-black/30 light:group-hover:text-black/50">
              Pristine · No feedback yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
