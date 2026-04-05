'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getSuggestions, parseTime } from '@/lib/suggestions'
import type { MediaWithInterests, SuggestionEntry, ReasonTag } from '@/lib/suggestions'
import type { Tables } from '@/types/database'

type Member = Tables<'family_members'>

// ---- Setup step ----

function SetupStep({
  members,
  presentIds,
  onToggle,
  timeInput,
  onTimeChange,
  onGo,
}: {
  members: Member[]
  presentIds: Set<string>
  onToggle: (id: string) => void
  timeInput: string
  onTimeChange: (v: string) => void
  onGo: () => void
}) {
  const parsedMinutes = parseTime(timeInput)
  const canGo = presentIds.size > 0 && parsedMinutes !== null

  return (
    <div className="px-4 space-y-6">
      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Who&apos;s here tonight?</h2>
        <div className="space-y-2">
          {members.map((m) => {
            const checked = presentIds.has(m.id)
            return (
              <button
                key={m.id}
                onClick={() => onToggle(m.id)}
                data-testid={`attendee-toggle-${m.id}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors min-h-11 ${
                  checked
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-xl">{checked ? '✓' : '○'}</span>
                <span className="font-medium">{m.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">How much time?</h2>
        <input
          type="text"
          value={timeInput}
          onChange={(e) => onTimeChange(e.target.value)}
          placeholder="e.g. 2h, 90min, 1h30"
          data-testid="time-input"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-11"
        />
        {timeInput && parsedMinutes === null && (
          <p className="text-xs text-red-500 mt-1">Try formats like "2h", "90min", "1h30"</p>
        )}
        {parsedMinutes !== null && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{parsedMinutes} minutes</p>
        )}
      </section>

      <button
        onClick={onGo}
        disabled={!canGo}
        data-testid="go-button"
        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold text-base min-h-11 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
      >
        Find something to watch →
      </button>
    </div>
  )
}

// ---- Result card ----

function ReasonBadge({ tag, members }: { tag: ReasonTag; members: Member[] }) {
  const name = (id: string) => members.find((m) => m.id === id)?.name ?? id
  if (tag.kind === 'away_wants') return <span className="text-[11px] bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">{name(tag.memberId)} is away and wants to see this</span>
  if (tag.kind === 'already_watched') return <span className="text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{name(tag.memberId)} has already seen this</span>
  if (tag.kind === 'too_long') return <span className="text-[11px] bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full">Too long by {tag.overageMinutes} min</span>
  return null
}

function SuggestionCard({
  entry,
  presentIds,
  members,
  showReasons,
}: {
  entry: SuggestionEntry
  presentIds: Set<string>
  members: Member[]
  showReasons: boolean
}) {
  const { media, interests, episodesFit, reasons } = entry
  const presentMembers = members.filter((m) => presentIds.has(m.id))

  const getInterest = (memberId: string) => interests.find((i) => i.family_member_id === memberId)

  return (
    <div className="flex gap-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {media.poster_url ? (
        <div className="relative w-16 shrink-0">
          <Image src={media.poster_url} alt={media.title} fill className="object-cover" sizes="64px" />
        </div>
      ) : (
        <div className="w-16 shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">🎬</div>
      )}

      <div className="flex-1 py-3 pr-3 space-y-1.5 min-w-0">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight flex-1">{media.title}</span>
          <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${media.type === 'movie' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'}`}>
            {media.type === 'movie' ? 'Movie' : 'Series'}
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {media.type === 'movie'
            ? `${media.duration_minutes ?? '?'} min`
            : episodesFit !== undefined && episodesFit > 0
            ? `${episodesFit} ep${episodesFit > 1 ? 's' : ''} tonight · ${media.duration_minutes ?? 30} min/ep`
            : `${media.duration_minutes ?? 30} min/ep`}
          {media.platform ? ` · ${media.platform}` : ''}
        </p>

        {/* Interest breakdown for present members */}
        <div className="flex flex-wrap gap-1">
          {presentMembers.map((m) => {
            const interest = getInterest(m.id)?.interest ?? 'neutral'
            const emoji = interest === 'yes' ? '✓' : interest === 'no' ? '✗' : '—'
            const color = interest === 'yes' ? 'text-green-600' : interest === 'no' ? 'text-red-500' : 'text-gray-400'
            return (
              <span key={m.id} className={`text-[11px] ${color}`}>
                {m.name} {emoji}
              </span>
            )
          })}
        </div>

        {showReasons && reasons && reasons.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {reasons.map((tag, i) => (
              <ReasonBadge key={i} tag={tag} members={members} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---- Results step ----

function ResultsStep({
  result,
  presentIds,
  members,
  onBack,
}: {
  result: ReturnType<typeof getSuggestions>
  presentIds: Set<string>
  members: Member[]
  onBack: () => void
}) {
  const { listA, listB, listC1, listC2 } = result
  const hasPrimary = listA.length > 0 || listB.length > 0
  const hasFallback = listC1.length > 0 || listC2.length > 0

  return (
    <div className="px-4 space-y-6">
      <button onClick={onBack} className="text-indigo-600 text-sm font-medium min-h-11 flex items-center">
        ← Change setup
      </button>

      {hasPrimary ? (
        <>
          {listA.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3" data-testid="list-a-heading">
                Perfect matches
              </h2>
              <div className="space-y-2" data-testid="list-a">
                {listA.map((entry) => (
                  <Link key={entry.media.id} href={`/media/${entry.media.id}`}>
                    <SuggestionCard entry={entry} presentIds={presentIds} members={members} showReasons={false} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {listB.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Good, but…
              </h2>
              <div className="space-y-2" data-testid="list-b">
                {listB.map((entry) => (
                  <Link key={entry.media.id} href={`/media/${entry.media.id}`}>
                    <SuggestionCard entry={entry} presentIds={presentIds} members={members} showReasons={true} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      ) : hasFallback ? (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic" data-testid="no-primary-message">
            No perfect match tonight — here are some alternatives.
          </p>

          {listC1.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Could watch over 2 evenings
              </h2>
              <div className="space-y-2" data-testid="list-c1">
                {listC1.map((entry) => (
                  <Link key={entry.media.id} href={`/media/${entry.media.id}`}>
                    <SuggestionCard entry={entry} presentIds={presentIds} members={members} showReasons={false} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {listC2.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Not everyone is on board
              </h2>
              <div className="space-y-2" data-testid="list-c2">
                {listC2.map((entry) => (
                  <Link key={entry.media.id} href={`/media/${entry.media.id}`}>
                    <SuggestionCard entry={entry} presentIds={presentIds} members={members} showReasons={true} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="text-center py-12 space-y-2" data-testid="empty-results">
          <p className="text-gray-400 dark:text-gray-500 text-sm">Nothing in the catalogue yet.</p>
          <Link href="/add" className="text-indigo-600 text-sm font-medium">Add something →</Link>
        </div>
      )}
    </div>
  )
}

// ---- Main page ----

export default function MovieNightPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [catalogue, setCatalogue] = useState<MediaWithInterests[]>([])
  const [presentIds, setPresentIds] = useState<Set<string>>(new Set())
  const [timeInput, setTimeInput] = useState('')
  const [step, setStep] = useState<'setup' | 'results'>('setup')
  const [result, setResult] = useState<ReturnType<typeof getSuggestions> | null>(null)

  useEffect(() => {
    async function load() {
      const [{ data: mems }, { data: mediaRows }] = await Promise.all([
        supabase.from('family_members').select('*').order('created_at'),
        supabase.from('media').select('*, interests(*)'),
      ])
      setMembers(mems ?? [])
      type MediaRow = Tables<'media'> & { interests: Tables<'interests'>[] }
      setCatalogue(
        ((mediaRows ?? []) as MediaRow[]).map(({ interests, ...media }) => ({
          media,
          interests: interests ?? [],
        })),
      )
    }
    load()
  }, [])

  function toggleMember(id: string) {
    setPresentIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleGo() {
    const minutes = parseTime(timeInput)
    if (!minutes) return
    const presentArr = Array.from(presentIds)
    const absentArr = members.map((m) => m.id).filter((id) => !presentIds.has(id))
    setResult(getSuggestions(catalogue, presentArr, absentArr, minutes))
    setStep('results')
  }

  return (
    <div className="max-w-lg mx-auto pb-12">
      <div className="px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-indigo-600 text-sm font-medium min-h-11 flex items-center">← Back</Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Movie Night</h1>
      </div>

      {step === 'setup' && (
        <SetupStep
          members={members}
          presentIds={presentIds}
          onToggle={toggleMember}
          timeInput={timeInput}
          onTimeChange={setTimeInput}
          onGo={handleGo}
        />
      )}

      {step === 'results' && result && (
        <ResultsStep
          result={result}
          presentIds={presentIds}
          members={members}
          onBack={() => setStep('setup')}
        />
      )}
    </div>
  )
}
