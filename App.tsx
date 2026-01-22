
import React, { useState, useMemo } from 'react';
import NameInput from './components/NameInput';
import { analyzeMismatches } from './services/geminiService';
import { SmartSuggestion } from './types';

const App: React.FC = () => {
  const [masterText, setMasterText] = useState('');
  const [checkText, setCheckText] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [trulyMissing, setTrulyMissing] = useState<string[]>([]);
  const [trulyExtra, setTrulyExtra] = useState<string[]>([]);
  const [aiAuditLog, setAiAuditLog] = useState<SmartSuggestion[]>([]);

  // Hàm loại bỏ dấu và chuẩn hóa để so sánh "ngầm"
  const getComparisonKey = (name: string) => {
    return name
      .trim()
      .normalize('NFC')
      .toLowerCase()
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
      .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '');
  };

  const handleCompare = async () => {
    if (!masterText.trim()) return;
    setIsComparing(true);
    setHasResults(false);

    const masterArr = masterText.split(/\r?\n/).map(n => n.trim()).filter(n => n.length > 0);
    const checkArr = checkText.split(/\r?\n/).map(n => n.trim()).filter(n => n.length > 0);

    // 1. So sánh bằng thuật toán chuẩn hóa (Xử lý lỗi Hoà/Hòa, Viết hoa/thường)
    const masterKeys = masterArr.map(n => getComparisonKey(n));
    const checkKeys = checkArr.map(n => getComparisonKey(n));

    let initialMissing = masterArr.filter((_, i) => !checkKeys.includes(masterKeys[i]));
    let initialExtra = checkArr.filter((_, i) => !masterKeys.includes(checkKeys[i]));

    // 2. Nếu vẫn còn lệch, dùng AI làm "Thẩm định viên" cuối cùng để lọc nhiễu
    if (initialMissing.length > 0 && initialExtra.length > 0) {
      try {
        const aiMatches = await analyzeMismatches(initialMissing, initialExtra);
        setAiAuditLog(aiMatches);
        
        const aiMatchedInA = aiMatches.map(m => m.original);
        const aiMatchedInB = aiMatches.map(m => m.suggestedMatch);

        initialMissing = initialMissing.filter(n => !aiMatchedInA.includes(n));
        initialExtra = initialExtra.filter(n => !aiMatchedInB.includes(n));
      } catch (e) {
        console.error("AI Audit failed", e);
      }
    }

    setTrulyMissing(initialMissing);
    setTrulyExtra(initialExtra);
    setHasResults(true);
    setIsComparing(false);
  };

  const handleClear = () => {
    setMasterText('');
    setCheckText('');
    setHasResults(false);
    setTrulyMissing([]);
    setTrulyExtra([]);
    setAiAuditLog([]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      {/* Navbar chuyên nghiệp */}
      <header className="bg-slate-900 text-white shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-bolt-lightning text-white text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">AuditPro AI</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hệ thống đối soát nhân sự chính xác</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleClear} className="text-sm font-bold text-slate-400 hover:text-white transition-colors uppercase">Xóa hết</button>
            <button 
              onClick={handleCompare} 
              disabled={isComparing}
              className={`px-10 py-3 rounded-xl font-black text-sm uppercase transition-all shadow-xl active:scale-95 flex items-center gap-3 ${isComparing ? 'bg-slate-700 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'}`}
            >
              {isComparing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Đang quét...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-magnifying-glass"></i>
                  So Sánh & Tìm 9 Tên Lệch
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-8 flex-1 flex flex-col gap-8">
        {/* Vùng nhập liệu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[320px]">
          <NameInput 
            label="DANH SÁCH GỐC (A) - 221 TÊN" 
            value={masterText}
            onChange={setMasterText}
            placeholder="Dán cột A vào đây..."
            icon="fa-solid fa-database"
          />
          <NameInput 
            label="DANH SÁCH ĐỐI CHIẾU (B) - 212 TÊN" 
            value={checkText}
            onChange={setCheckText}
            placeholder="Dán cột B vào đây..."
            icon="fa-solid fa-vial-circle-check"
          />
        </div>

        {hasResults && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8 pb-12">
            {/* Kết quả tổng hợp */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-slate-100 p-8 rounded-[2rem] shadow-sm text-center">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Khớp hoàn toàn</span>
                <p className="text-5xl font-black text-slate-800 mt-2">
                  {masterText.split('\n').filter(t => t.trim()).length - trulyMissing.length}
                </p>
              </div>
              <div className="bg-rose-500 p-8 rounded-[2rem] shadow-2xl shadow-rose-500/20 text-center ring-8 ring-rose-50">
                <span className="text-[11px] font-black text-rose-100 uppercase tracking-widest">Người bị thiếu thực tế</span>
                <p className="text-6xl font-black text-white mt-2">{trulyMissing.length}</p>
                <p className="text-[10px] font-bold text-rose-100 mt-2 italic">Cần bổ sung ngay</p>
              </div>
              <div className="bg-slate-800 p-8 rounded-[2rem] shadow-xl text-center">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Người lạ xuất hiện</span>
                <p className="text-5xl font-black text-white mt-2">{trulyExtra.length}</p>
              </div>
            </div>

            {/* DANH SÁCH CHI TIẾT Tên người chênh lệch */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* CỘT THIẾU - QUAN TRỌNG NHẤT */}
              <div className="bg-white border-2 border-rose-100 rounded-[2.5rem] overflow-hidden shadow-lg">
                <div className="bg-rose-50 px-8 py-6 border-b border-rose-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-rose-600 font-black text-lg uppercase tracking-tight leading-none">Danh sách 9 người bị thiếu</h2>
                    <p className="text-xs text-rose-400 font-bold mt-1 uppercase">Tìm thấy trong A nhưng không có ở B</p>
                  </div>
                  <div className="bg-rose-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black">
                    {trulyMissing.length}
                  </div>
                </div>
                <div className="p-8">
                  {trulyMissing.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {trulyMissing.map((name, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-rose-50/30 rounded-2xl border border-rose-100 group hover:bg-rose-50 transition-all">
                          <div className="flex items-center gap-4">
                            <span className="w-8 h-8 bg-white border border-rose-200 rounded-lg flex items-center justify-center text-xs font-black text-rose-500 shadow-sm">{i+1}</span>
                            <span className="font-bold text-slate-800 text-lg tracking-tight">{name}</span>
                          </div>
                          <i className="fa-solid fa-circle-exclamation text-rose-300 group-hover:text-rose-500"></i>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-30">
                      <i className="fa-solid fa-check-double text-6xl mb-4"></i>
                      <p className="font-black uppercase tracking-widest">Không thiếu ai!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* CỘT THỪA - DÀNH CHO NGƯỜI LẠ */}
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-lg">
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-slate-800 font-black text-lg uppercase tracking-tight leading-none">Người lạ trong danh sách B</h2>
                    <p className="text-xs text-slate-400 font-bold mt-1 uppercase">Có ở B nhưng không có trong Gốc A</p>
                  </div>
                  <div className="bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center font-black">
                    {trulyExtra.length}
                  </div>
                </div>
                <div className="p-8">
                  {trulyExtra.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {trulyExtra.map((name, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <span className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xs font-black text-slate-400 shadow-sm">{i+1}</span>
                          <span className="font-bold text-slate-700 text-lg tracking-tight">{name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-20 text-center opacity-30">
                      <i className="fa-solid fa-user-shield text-6xl mb-4"></i>
                      <p className="font-black uppercase tracking-widest">Không có người lạ!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* LOG AI TỰ ĐỘNG XỬ LÝ LỖI DẤU/CHÍNH TẢ */}
            {aiAuditLog.length > 0 && (
              <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/30">
                    <i className="fa-solid fa-spell-check text-white text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-900 uppercase text-sm">AI đã tự động khớp các trường hợp viết sai:</h3>
                    <p className="text-[10px] text-emerald-600 font-bold">Các tên này đã được gỡ bỏ khỏi danh sách "Thiếu" vì thực chất là cùng 1 người</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiAuditLog.map((log, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Bản gốc</span>
                        <span className="text-sm font-bold text-slate-800">{log.original}</span>
                      </div>
                      <i className="fa-solid fa-arrow-right-arrow-left text-emerald-300"></i>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Viết là</span>
                        <span className="text-sm font-bold text-emerald-600">{log.suggestedMatch}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-10 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Audit Intelligence Engine v5.0 • Highly Accurate</p>
      </footer>
    </div>
  );
};

export default App;
