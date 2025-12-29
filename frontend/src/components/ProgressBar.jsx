/**
 * ProgressBar - Visual progress indicator
 */
const ProgressBar = ({ current, total, label = '' }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const isComplete = current === total && total > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-200 text-sm">
          {label && `${label}: `}{current}/{total}
        </span>
        {isComplete && (
          <span className="text-green-400 text-xs font-medium">Complete!</span>
        )}
      </div>
      <div className="h-2 bg-dark rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
