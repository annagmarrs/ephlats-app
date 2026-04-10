'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  location: z.string().optional().default(''),
});

interface Props {
  initialLocation: string;
  onNext: (location: string) => void;
  onBack: () => void;
}

export function StepLocation({ initialLocation, onNext, onBack }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { location: initialLocation },
  });

  return (
    <div className="flex flex-col gap-6 py-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Where are you based?</h2>
        <p className="text-neutral-600 mt-1">Helps you reconnect with nearby Ephlats. <span className="text-neutral-400">(Optional)</span></p>
      </div>

      <form onSubmit={handleSubmit((d) => onNext(d.location))} className="flex flex-col gap-4">
        <Input
          label="City, State"
          placeholder="Boston, MA"
          autoComplete="address-level2"
          error={errors.location?.message}
          {...register('location')}
        />
        <div className="flex gap-3 mt-2">
          <Button type="button" variant="secondary" onClick={onBack} fullWidth>Back</Button>
          <Button type="submit" fullWidth>Continue</Button>
        </div>
      </form>
    </div>
  );
}
