import React, { useEffect, useState } from 'react';
import { CheckCircle, Zap, AlertTriangle, Lock, ArrowRight, Mail } from 'lucide-react';
import { AuditStats } from '../types';
import { parseGitHubUrl, fetchRepoStats } from '../services/githubService';

interface PreflightModalProps {
  repoUrl: string;
  onConfirm: (tier: 'lite' | 'deep' | 'ultra', stats: AuditStats) => void;
  onCancel: () => void;
}

type ModalStep = 'analysis' | 'selection' | 'auth';

const PreflightModal: React.FC<PreflightModalProps> = ({ repoUrl, onConfirm, onCancel }) => {
  const [step, setStep] = useState<ModalStep>('analysis');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [selectedTier, setSelectedTier] = useState<'lite' | 'deep' | 'ultra'>('lite');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      const repoInfo = parseGitHubUrl(repoUrl);
      
      if (!repoInfo) {
        setError("Invalid GitHub URL format");
        setLoading(false);
        return;
      }

      try {
        const data = await fetchRepoStats(repoInfo.owner, repoInfo.repo);
        setStats(data);
        setStep('selection');
      } catch (err) {
        setError("Could not access repository. It might be private.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [repoUrl]);

  const handleTierSelect = (tier: 'lite' | 'deep' | 'ultra') => {
    if (tier === 'lite') {
      onConfirm(tier, stats!);
    } else {
      setSelectedTier(tier);
      setStep('auth');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onConfirm(selectedTier, stats!);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-xl">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin mb-6"></div>
            <p className="text-slate-900 font-bold text-lg">Scanning Structure...</p>
            <p className="text-slate-500 text-sm">Fetching manifest files</p>
        </div>
      </div>
    );
  }

  if (error) {
     return (
       <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h3>
            <p className="text-slate-500 mb-8">{error}</p>
            <button 
              onClick={onCancel}
              className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-colors shadow-lg"
            >
              Try Another Repo
            </button>
          </div>
       </div>
     );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/10 backdrop-blur-lg p-4 animate-in fade-in zoom-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl shadow-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-50 p-6 md:p-8 flex justify-between items-center border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="text-success w-5 h-5 fill-success/10" />
              Scan Complete
            </h2>
            <p className="text-slate-500 text-sm mt-1">{repoUrl}</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
            &times;
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-white">
          <div className="p-8 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Files</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.files}</p>
          </div>
          <div className="p-8 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Complexity</p>
            <p className="text-3xl font-bold text-slate-900">{stats?.tokens}</p>
          </div>
          <div className="p-8 text-center">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Language</p>
            <p className="text-3xl font-bold text-primary">{stats?.language}</p>
            <p className="text-xs text-slate-400 mt-1">{stats?.languagePercent}%</p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 md:p-10 flex-1 overflow-y-auto bg-white">
          
          {step === 'selection' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-slate-900 text-center mb-10 text-xl font-semibold">Select Audit Depth</h3>
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Lite Tier */}
                <div className="border border-slate-200 rounded-3xl p-6 hover:border-slate-300 transition-all flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full mb-4">FREE</span>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Quick Scan</h4>
                  <p className="text-sm text-slate-500 mb-8 flex-1">Basic manifest check for known CVEs.</p>
                  <button 
                    onClick={() => handleTierSelect('lite')}
                    className="w-full py-3 border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 font-medium transition-colors"
                  >
                    Run Lite
                  </button>
                </div>

                {/* Deep Tier */}
                <div className="border-2 border-primary bg-white rounded-3xl p-6 relative shadow-xl shadow-primary/10 flex flex-col items-center text-center scale-105 z-10">
                  <div className="absolute -top-3 bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    RECOMMENDED
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2 mt-2">Senior Audit</h4>
                  <p className="text-sm text-slate-500 mb-8 flex-1">Deep analysis of logic, architecture, and performance.</p>
                  <button 
                    onClick={() => handleTierSelect('deep')}
                    className="w-full py-3 bg-primary text-white font-bold rounded-full hover:bg-blue-600 transition-colors shadow-lg shadow-primary/25"
                  >
                    Run Deep Audit
                  </button>
                </div>

                {/* Ultra Tier */}
                <div className="border border-slate-200 rounded-3xl p-6 hover:border-purple-200 transition-all flex flex-col items-center text-center group">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-4 group-hover:bg-purple-100 transition-colors">PRO</span>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">CTO Grade</h4>
                  <p className="text-sm text-slate-500 mb-8 flex-1">Cross-file logic analysis with fix PRs.</p>
                  <button 
                    onClick={() => handleTierSelect('ultra')}
                    className="w-full py-3 border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 font-medium transition-colors"
                  >
                    Run Ultra
                  </button>
                </div>

              </div>
            </div>
          )}

          {step === 'auth' && (
            <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-300 text-center">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Lock className="w-8 h-8 text-primary" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-3">Unlock Report</h3>
               <p className="text-slate-500 mb-8">
                 We need your email to securely deliver the 
                 <span className="text-slate-900 font-bold"> {selectedTier === 'deep' ? 'Senior' : 'CTO'} Audit</span> results.
               </p>

               <form onSubmit={handleAuthSubmit} className="space-y-4">
                 <div className="relative">
                   <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                   <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="work@company.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-12 pr-6 text-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                   />
                 </div>
                 
                 <button 
                   type="submit" 
                   className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                 >
                   Start Agents <ArrowRight className="w-4 h-4" />
                 </button>
               </form>

               <button 
                 onClick={() => setStep('selection')}
                 className="mt-6 text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors"
               >
                 Back to plans
               </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default PreflightModal;