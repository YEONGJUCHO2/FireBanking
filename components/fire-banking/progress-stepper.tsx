import { cn } from '@/lib/cn'

export function ProgressStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      {steps.map((step, index) => {
        const active = index === current
        const done = index < current
        return (
          <div key={step} className="flex items-center gap-2">
            <span className={cn('flex size-6 items-center justify-center rounded-full text-xs font-bold', active || done ? 'bg-fb-trust text-white' : 'bg-fb-line text-fb-ink-2')}>{index + 1}</span>
            <span className={cn('text-xs font-bold', active ? 'text-fb-trust' : 'text-fb-ink-2')}>{step}</span>
          </div>
        )
      })}
    </div>
  )
}
