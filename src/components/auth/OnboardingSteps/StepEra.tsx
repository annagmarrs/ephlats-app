'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { ERA_OPTIONS, graduationYearToEra } from '@/lib/types';
import type { Era } from '@/lib/types';

const schema = z.object({
  graduationYear: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().int().min(1960, 'Year must be 1960 or later').optional()
  ),
  era: z.enum(['60s', '70s', '80s', '90s', '00s', '10s', '20s', 'Current Group', 'Guest'] as const),
});

interface Props {
  initialYear: number | null;
  initialEra: Era;
  onNext: (year: number | null, era: Era) => void;
  onBack: () => void;
}

export function StepEra({ initialYear, initialEra, onNext, onBack }: Props) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { graduationYear: initialYear || ('' as unknown as number), era: initialEra },
  });

  const yearValue = watch('graduationYear');

  useEffect(() => {
    const y = Number(yearValue);
    if (y >= 1960 && y <= 2026) {
      setValue('era', graduationYearToEra(y));
    }
  }, [yearValue, setValue]);

  return (
    <div className="flex flex-col gap-6 py-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">What's your era?</h2>
        <p className="text-neutral-600 mt-1">We'll auto-suggest your era from your graduation year.</p>
      </div>

      <form onSubmit={handleSubmit((d) => onNext(d.graduationYear ?? null, d.era as Era))} className="flex flex-col gap-4">
        <Input
          label="Graduation Year"
          type="number"
          placeholder="e.g. 1998"
          inputMode="numeric"
          min={1960}
          max={2026}
          error={errors.graduationYear?.message}
          {...register('graduationYear')}
        />
        <Select
          label="Era"
          error={errors.era?.message}
          options={ERA_OPTIONS.map((e) => ({ value: e, label: (e === 'Current Group' || e === 'Guest') ? e : `${e} Ephlat` }))}
          {...register('era')}
        />
        <div className="flex gap-3 mt-2">
          <Button type="button" variant="secondary" onClick={onBack} fullWidth>Back</Button>
          <Button type="submit" fullWidth>Continue</Button>
        </div>
      </form>
    </div>
  );
}
