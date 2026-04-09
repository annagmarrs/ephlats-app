'use client';

import { useState, useMemo } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { usePeople } from '@/hooks/usePeople';
import { useAuth } from '@/contexts/AuthContext';
import { TopHeader } from '@/components/layout/TopHeader';
import { AttendeeCard } from '@/components/people/AttendeeCard';
import { EraFilter } from '@/components/people/EraFilter';
import { Input } from '@/components/ui/Input';
import { PersonCardSkeleton } from '@/components/ui/SkeletonLoader';
import type { Era } from '@/lib/types';

type ViewMode = 'grid' | 'list';

export default function PeoplePage() {
  const { users, preloaded, loading } = usePeople();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [eraFilter, setEraFilter] = useState<Era | 'All'>('All');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Build combined display list
  const displayList = useMemo(() => {
    // Get IDs of preloaded entries that are claimed
    const claimedPreloadedIds = new Set(
      users.map((u) => u.preloadedAttendeeId).filter(Boolean)
    );

    // Signed-up users
    const signedUpItems = users.map((u) => ({
      type: 'user' as const,
      id: u.uid,
      name: u.name,
      era: u.era,
      location: u.location,
      graduationYear: u.graduationYear,
      profilePhotoUrl: u.profilePhotoUrl,
      joined: true,
    }));

    // Unmatched preloaded
    const preloadedItems = preloaded
      .filter((p) => !claimedPreloadedIds.has(p.id) && !p.matched)
      .map((p) => ({
        type: 'preloaded' as const,
        id: p.id,
        name: p.name,
        era: p.era,
        location: '',
        graduationYear: p.graduationYear,
        profilePhotoUrl: null,
        joined: false,
      }));

    // Sort: joined first alphabetically, then preloaded alphabetically
    const joined = signedUpItems.sort((a, b) => a.name.localeCompare(b.name));
    const notJoined = preloadedItems.sort((a, b) => a.name.localeCompare(b.name));
    return [...joined, ...notJoined];
  }, [users, preloaded]);

  const filtered = useMemo(() => {
    return displayList.filter((item) => {
      const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchesEra = eraFilter === 'All' || item.era === eraFilter;
      return matchesSearch && matchesEra;
    });
  }, [displayList, search, eraFilter]);

  return (
    <>
      <TopHeader
        title="People"
        rightElement={
          <button
            onClick={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))}
            className="p-2 rounded-xl hover:bg-neutral-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle view"
          >
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
          </button>
        }
      />
      <div className="p-4 space-y-3">
        <Input
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <EraFilter selected={eraFilter} onChange={setEraFilter} />

        {loading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-2' : 'space-y-2'}>
            {[1, 2, 3, 4, 5, 6].map((i) => <PersonCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-neutral-400">
            <p>No people found.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-2">
            {filtered.map((item) => (
              <AttendeeCard
                key={`${item.type}-${item.id}`}
                item={item}
                viewMode="grid"
                isCurrentUser={item.type === 'user' && item.id === currentUser?.uid}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <AttendeeCard
                key={`${item.type}-${item.id}`}
                item={item}
                viewMode="list"
                isCurrentUser={item.type === 'user' && item.id === currentUser?.uid}
              />
            ))}
          </div>
        )}

        <p className="text-xs text-neutral-400 text-center pb-2">
          {filtered.length} {filtered.length === 1 ? 'person' : 'people'}
        </p>
      </div>
    </>
  );
}
