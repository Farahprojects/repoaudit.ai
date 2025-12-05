import React, { useState, useEffect, useRef } from 'react';
import { Issue } from '../types';
import { AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp, Wand2, Copy, Check } from 'lucide-react';

declare const Prism: any;

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const [expanded, setExpanded] = useState(false);
  const [showFix, setShowFix] = useState(false);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (expanded && codeRef.current && typeof Prism !== 'undefined') {
      Prism.highlightElement(codeRef.current);
    }
  }, [expanded, showFix]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = showFix ? issue.fixedCode : issue.badCode;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityIcon = () => {
    switch (issue.severity) {
      case 'Critical': return <AlertOctagon className="w-5 h-5 text-critical" />;
      case 'Warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = () => {
    switch (issue.severity) {
      case 'Critical': return 'bg-red-50 text-critical border-red-100';
      case 'Warning': return 'bg-amber-50 text-warning border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 group">
      {/* Header */}
      <div 
        className="p-6 flex items-start gap-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`mt-1 p-2 rounded-xl ${getSeverityBadge()} border-none`}>
            {getSeverityIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-slate-900 font-bold text-lg group-hover:text-primary transition-colors">{issue.title}</h4>
            <span className={`text-xs px-3 py-1 rounded-full border ${getSeverityBadge()} font-bold uppercase tracking-wider`}>
              {issue.severity}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1 font-mono bg-slate-50 inline-block px-2 py-0.5 rounded-md border border-slate-100">
             {issue.filePath}:{issue.lineNumber}
          </p>
        </div>
        <button className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full border border-slate-100">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-6 pb-6 pt-0">
          <div className="pl-[4.5rem]">
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">{issue.description}</p>
            
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xl">
              {/* Toolbar */}
              <div className="flex border-b border-slate-800">
                <button 
                  onClick={() => setShowFix(false)}
                  className={`flex-1 py-3 text-xs font-bold transition-colors ${!showFix ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Current Code
                </button>
                <button 
                  onClick={() => setShowFix(true)}
                  className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-2 ${showFix ? 'bg-emerald-900/30 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Wand2 className="w-3 h-3" /> AI Fix
                </button>
              </div>

              {/* Code Block with Prism */}
              <div className="relative group/code">
                <button 
                  onClick={handleCopy}
                  className="absolute right-3 top-3 p-2 rounded-lg bg-slate-800 text-slate-400 opacity-0 group-hover/code:opacity-100 transition-opacity hover:text-white hover:bg-slate-700 z-10"
                  title="Copy"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
                
                <div className="p-6 text-sm overflow-x-auto">
                  <pre>
                    <code ref={codeRef} className="language-typescript">
                      {showFix ? issue.fixedCode : issue.badCode}
                    </code>
                  </pre>
                </div>
                
                 {/* Decorative Side Bar */}
                 <div className={`absolute left-0 top-10 bottom-0 w-1 ${showFix ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCard;