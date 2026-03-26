import type { TrainingDay } from '@/lib/calculations';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeeklyCalendarView = ({ trainingDays, onDayClick }: { trainingDays: TrainingDay[]; onDayClick?: (index: number) => void }) => {
  const schedule = dayNames.map((name, i) => {
    const match = trainingDays[i];
    return { name, training: !!match, focus: match?.focus || 'Rest' };
  });

  return (
    <div className="grid grid-cols-7 gap-1.5 mb-4">
      {schedule.map((day, i) => (
        <button
          key={day.name}
          onClick={() => day.training && onDayClick?.(i)}
          className={`rounded-lg p-2 text-center transition-all duration-200 ${
            day.training
              ? 'bg-primary/15 border border-primary/30 hover:bg-primary/25 cursor-pointer'
              : 'bg-secondary/30 border border-border/30 cursor-default'
          }`}
        >
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">{day.name}</p>
          <p className={`text-[9px] mt-0.5 font-medium leading-tight ${day.training ? 'text-primary' : 'text-muted-foreground/60'}`}>
            {day.training ? day.focus.split(' ').slice(0, 2).join(' ') : 'Rest'}
          </p>
        </button>
      ))}
    </div>
  );
};

export default WeeklyCalendarView;
