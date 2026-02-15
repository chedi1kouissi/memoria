import { clusterCards } from '../data/mockData';

export default function ActiveClusters() {
  return (
    <section>
      <header className="flex justify-between items-center mb-6">
        <h3 className="font-sans text-[11px] font-light tracking-[0.2em] text-text-muted uppercase">
          Active Clusters
        </h3>
        <span className="font-sans text-[10px] text-forest/60 hover:text-forest cursor-pointer underline underline-offset-4">
          Browse
        </span>
      </header>

      <div className="space-y-4">
        {clusterCards.map((card) => (
          <div
            key={card.id}
            className={`p-5 rounded-xs border border-border transition-all duration-500 cursor-pointer ${
              card.priority
                ? 'bg-white/50 hover:bg-white'
                : 'bg-transparent hover:bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                {card.priority && (
                  <span className="font-sans text-[9px] text-text-muted mb-1 uppercase tracking-tighter">
                    {card.priority}
                  </span>
                )}
                <h4 className="text-lg text-text-main leading-none italic">{card.title}</h4>
              </div>
              <span
                className={`font-sans text-[10px] font-light ${
                  card.priority ? 'text-forest' : 'text-text-muted'
                }`}
              >
                {card.progress}%
              </span>
            </div>

            {card.priority && (
              <>
                <div className="h-px w-full bg-border overflow-hidden">
                  <div
                    className="h-full bg-forest transition-all duration-700"
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
                <div className="mt-4 flex -space-x-1 items-center">
                  {card.avatars?.map((avatar, i) => (
                    <img
                      key={i}
                      alt="Avatar"
                      className="w-5 h-5 rounded-full grayscale border border-white"
                      src={avatar}
                    />
                  ))}
                  {card.timeAgo && (
                    <span className="font-sans text-[9px] text-text-muted ml-3">
                      {card.timeAgo}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
