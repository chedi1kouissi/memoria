import { ingestEntries } from '../data/mockData';

export default function RecentIngest() {
  return (
    <section>
      <h3 className="font-sans text-[11px] font-light tracking-[0.2em] text-text-muted uppercase mb-8">
        Recent Ingest
      </h3>

      <div className="relative space-y-8 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-border">
        {ingestEntries.map((entry) => (
          <div key={entry.id} className="pl-6 relative">
            <div
              className={`absolute left-[-2px] top-1.5 w-1 h-1 rounded-full ${
                entry.isActive ? 'bg-forest' : 'bg-border'
              }`}
            />

            <span className="font-sans text-[9px] text-text-muted uppercase mb-1 block tracking-widest">
              {entry.time}
            </span>
            <p className="text-base text-text-main leading-tight italic">
              {entry.title}
            </p>

            {entry.type && (
              <div className="flex gap-2 mt-2">
                <span className="font-sans text-[8px] px-1.5 py-0.5 border border-border text-text-muted rounded-full">
                  {entry.type}
                </span>
              </div>
            )}

            {entry.imageUrl && (
              <div className="mt-3 rounded-xs overflow-hidden border border-border h-24 w-full grayscale hover:grayscale-0 transition-all duration-700">
                <img
                  alt="Data chart screenshot"
                  className="object-cover w-full h-full opacity-80"
                  src={entry.imageUrl}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
