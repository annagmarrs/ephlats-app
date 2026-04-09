'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
});

export function StepName({ initialName, onNext }: { initialName: string; onNext: (name: string) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName },
  });

  return (
    <div className="flex flex-col gap-6 py-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">What's your name?</h2>
        <p className="text-neutral-600 mt-1">This is how you'll appear to other Ephlats.</p>
      </div>

      <form onSubmit={handleSubmit((d) => onNext(d.name))} className="flex flex-col gap-4">
        <Input
          label="Full Name"
          autoComplete="name"
          placeholder="Jane Smith"
          error={errors.name?.message}
          {...register('name')}
        />
        <Button type="submit" fullWidth size="lg">
          Continue
        </Button>
      </form>
    </div>
  );
}
