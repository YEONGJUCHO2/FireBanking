import { cn } from '@/lib/cn'

export function ProgressStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      {steps.map((step, index) => {
        const active = index === current
        const done = index < current
        return (
          <div key={step} className="flex items-center gap-2">
            <span className={cn('flex size-6 items-center justify-center rounded-full text-xs font-bold', active || done ? 'bg-fb-green text-white' : 'bg-fb-stone text-fb-muted')}>{index + 1}</span>
            <span className={cn('text-xs font-bold', active ? 'text-fb-green' : 'text-fb-muted')}>{step}</span>
          </div>
        )
      })}
    </div>
  )
}
