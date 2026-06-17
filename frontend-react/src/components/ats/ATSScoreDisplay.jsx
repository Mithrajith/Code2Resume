import { motion } from 'framer-motion';
import { FileSearch, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';
import CircularScore from '../ui/CircularScore';
import Badge from '../ui/Badge';

const scoreColor = (score) => {
  if (score <= 30) return '#EF4444';
  if (score <= 50) return '#F97316';
  if (score <= 70) return '#F59E0B';
  return '#22C55E';
};

const scoreLabel = (score) => {
  if (score <= 30) return 'Poor ATS Compatibility';
  if (score <= 50) return 'Needs Improvement';
  if (score <= 70) return 'Good ATS Compatibility';
  return 'Excellent ATS Compatibility';
};

const scoreBadgeColor = (score) => {
  if (score <= 30) return 'red';
  if (score <= 50) return 'amber';
  if (score <= 70) return 'amber';
  return 'green';
};

export default function ATSScoreDisplay({ score = 0, keywordsFound = 0, totalKeywords = 0, issues = 0, suggestions = 0 }) {
  const keywordPct = totalKeywords > 0 ? Math.round((keywordsFound / totalKeywords) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center"
    >
      <CircularScore score={score} size={200} color={scoreColor(score)} label="ATS Score" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4"
      >
        <Badge color={scoreBadgeColor(score)} size="md">
          {scoreLabel(score)}
        </Badge>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-6 mt-8 w-full max-w-md"
      >
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{keywordsFound}/{totalKeywords}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Keywords Found</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">{keywordPct}% coverage</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{issues}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Issues Found</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{suggestions}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Suggestions</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
