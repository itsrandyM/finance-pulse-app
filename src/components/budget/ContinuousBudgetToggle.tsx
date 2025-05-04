
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { useBudget } from '@/contexts/BudgetContext';

interface ContinuousBudgetToggleProps {
  itemId: string;
  isContinuous?: boolean;
  className?: string;
}

const ContinuousBudgetToggle: React.FC<ContinuousBudgetToggleProps> = ({ 
  itemId,
  isContinuous = false,
  className = ''
}) => {
  const { markItemAsContinuous } = useBudget();
  
  const handleToggle = (checked: boolean) => {
    markItemAsContinuous(itemId, checked);
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Switch 
        id={`continuous-${itemId}`} 
        checked={isContinuous || false}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor={`continuous-${itemId}`} className="text-sm text-muted-foreground">
        Continue to next period
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>If enabled, this budget item will be automatically carried over to the next budget period with its progress intact.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ContinuousBudgetToggle;
