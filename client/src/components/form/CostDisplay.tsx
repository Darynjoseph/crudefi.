interface CostDisplayProps {
  totalCost: number;
}

const CostDisplay = ({ totalCost }: CostDisplayProps) => {
  if (totalCost <= 0) return null;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-primary">Total Cost:</span>
        <span className="text-lg font-bold text-primary">KES {totalCost.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default CostDisplay;