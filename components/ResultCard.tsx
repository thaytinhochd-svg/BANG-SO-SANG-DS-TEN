
import React from 'react';

interface ResultCardProps {
  title: string;
  names: string[];
  type: 'missing' | 'extra' | 'matched';
  onCopy: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ names, onCopy }) => {
  return (
    <div className="p-4 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin">
        {names.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 opacity-30">
             <i className="fa-solid fa-ghost text-2xl mb-2"></i>
             <p className="text-[10px] font-bold uppercase">Trống</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {names.map((name, i) => (
              <li key={i} className="text-sm py-1.5 px-3 rounded-lg hover:bg-slate-50 text-slate-600 font-medium transition-colors border border-transparent hover:border-slate-100 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="truncate">{name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {names.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase">
            Total: {names.length}
          </span>
          <button 
            onClick={onCopy}
            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase flex items-center gap-1.5"
          >
            <i className="fa-regular fa-copy"></i>
            Sao chép
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
