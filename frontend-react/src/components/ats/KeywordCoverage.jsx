import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X } from 'lucide-react';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function KeywordCoverage({ keywords = [] }) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = keywords.filter(k => {
    const matchesText = k.keyword.toLowerCase().includes(filter.toLowerCase());
    if (statusFilter === 'found') return matchesText && k.found;
    if (statusFilter === 'missing') return matchesText && !k.found;
    return matchesText;
  });

  const foundCount = keywords.filter(k => k.found).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Keyword Coverage</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{foundCount}/{keywords.length} keywords found</p>
        </div>
        <div className="flex gap-1">
          {['all', 'found', 'missing'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors capitalize ${
                statusFilter === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search keywords..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filtered.map((kw, i) => (
          <motion.div
            key={kw.keyword}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <Badge
              color={kw.found ? 'green' : 'red'}
              size="sm"
              className="gap-1.5 cursor-default"
            >
              {kw.found ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {kw.keyword}
              {kw.severity && (
                <span className={`ml-1 text-[10px] font-bold uppercase`}>
                  {kw.severity}
                </span>
              )}
            </Badge>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No keywords match your filter.</p>
      )}
    </div>
  );
}
