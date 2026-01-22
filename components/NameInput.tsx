
import React from 'react';

interface NameInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  icon: string;
}

const NameInput: React.FC<NameInputProps> = ({ label, value, onChange, placeholder, icon }) => {
  const lineCount = value.split('\n').filter(line => line.trim()).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <i className={icon + " text-indigo-500"}></i>
          {label}
        </label>
        <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
          {lineCount} tên
        </span>
      </div>
      <textarea
        className="flex-1 p-4 text-sm font-mono focus:outline-none resize-none bg-transparent"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};

export default NameInput;
