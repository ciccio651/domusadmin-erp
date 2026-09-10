import { useState } from 'react';
import type { ChecklistItem } from '@/types';
import { CheckSquare } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  items: ChecklistItem[];
  onChange?: (items: ChecklistItem[]) => void;
  readOnly?: boolean;
}

export function ProcedureChecklist({ items, onChange, readOnly = false }: Props) {
  const [list, setList] = useState<ChecklistItem[]>(items);

  const toggle = (id: string) => {
    const updated = list.map(it => it.id === id ? { ...it, completato: !it.completato } : it);
    setList(updated);
    onChange?.(updated);
  };

  const done = list.filter(i => i.completato).length;
  const pct = list.length ? Math.round((done / list.length) * 100) : 0;

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{done}/{list.length} completati</span>
        <span className={clsx('text-xs font-semibold', pct === 100 ? 'text-legal-green' : 'text-gray-600')}>{pct}%</span>
      </div>
      <div className="h-1 bg-gray-100 rounded-full mb-4 overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-300', pct === 100 ? 'bg-legal-green' : 'bg-legal-gold')}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="space-y-2.5">
        {list.map((item, i) => (
          <label
            key={item.id}
            data-testid={`checklist-item-${i}`}
            className={clsx('flex items-start gap-2.5 text-sm', readOnly ? 'cursor-default' : 'cursor-pointer')}
          >
            {readOnly ? (
              <CheckSquare className={clsx('w-4 h-4 mt-0.5 shrink-0', item.completato ? 'text-legal-green' : 'text-gray-300')} />
            ) : (
              <input
                type="checkbox"
                checked={item.completato}
                onChange={() => toggle(item.id)}
                className="mt-0.5 w-3.5 h-3.5 rounded border-gray-300 accent-navy-900 shrink-0"
              />
            )}
            <div className="flex-1">
              <span className={clsx(item.completato ? 'line-through text-gray-400' : 'text-gray-700')}>
                {item.label}
              </span>
              {item.obbligatorio && !item.completato && (
                <span className="ml-1.5 badge badge-red text-[10px]">Obbligatorio</span>
              )}
              {item.note && <p className="text-[11px] text-gray-400 mt-0.5">{item.note}</p>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
