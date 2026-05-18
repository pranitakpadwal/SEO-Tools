import React from 'react'
import { Eye, ThumbsUp, MessageCircle, Clock } from 'lucide-react'
import { formatNumber, parseDuration, formatDuration } from '../utils/youtube.js'

export default function VideoCard({ videoData }) {
  if (!videoData) return null
  const { snippet, statistics, contentDetails } = videoData
  const duration = parseDuration(contentDetails?.duration)
  const thumb = snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url

  return (
    <div className="glass-card p-4 flex gap-4 animate-slide-up">
      {thumb && (
        <div className="relative flex-shrink-0 w-32 rounded-lg overflow-hidden">
          <img src={thumb} alt={snippet?.title} className="w-full h-full object-cover" style={{ aspectRatio: '16/9' }} />
          {duration > 0 && (
            <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
              {formatDuration(duration)}
            </span>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 leading-snug">{snippet?.title}</h3>
        <p className="text-xs text-slate-400 mt-1">{snippet?.channelTitle}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {snippet?.publishedAt && new Date(snippet.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="flex items-center gap-4 mt-3">
          {statistics?.viewCount && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Eye className="w-3.5 h-3.5" /> {formatNumber(statistics.viewCount)}
            </span>
          )}
          {statistics?.likeCount && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <ThumbsUp className="w-3.5 h-3.5" /> {formatNumber(statistics.likeCount)}
            </span>
          )}
          {statistics?.commentCount && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MessageCircle className="w-3.5 h-3.5" /> {formatNumber(statistics.commentCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
