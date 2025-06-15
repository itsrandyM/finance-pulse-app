
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/ui/piechart";
import { BudgetItem } from "@/contexts/BudgetContext";
import { PieChart as PieChartIcon, Plus, Target } from "lucide-react";

const COLORS = [
  "#3b82f6",
  "#0ea5e9",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#F2FCE2", // green
  "#FEF7CD", // yellow
  "#FEC6A1", // orange
  "#E5DEFF", // soft purple
  "#FFDEE2", // pink
  "#FDE1D3", // peach
  "#D3E4FD", // blue
  "#F1F0FB"  // gray
];

const tagColorMap: Record<string, string> = {
  Bills: "#FEC6A1",
  Savings: "#F2FCE2",
  Groceries: "#D3E4FD",
  Transport: "#FEF7CD",
  Shopping: "#FFDEE2",
  Dining: "#E5DEFF"
};

interface VisualSummaryCardProps {
  budgetItems: BudgetItem[];
  formatCurrency: (value: number) => string;
}

const EmptyStateIllustration = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="relative">
      {/* Animated circles */}
      <div className="w-32 h-32 relative">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
        <div className="absolute inset-2 rounded-full border-4 border-green-100 animate-pulse delay-100"></div>
        <div className="absolute inset-4 rounded-full border-4 border-orange-100 animate-pulse delay-200"></div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-bounce">
            <PieChartIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full animate-ping"></div>
      <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-ping delay-300"></div>
      <div className="absolute top-1/2 -left-4 w-2 h-2 bg-orange-400 rounded-full animate-ping delay-500"></div>
    </div>
    
    <div className="text-center space-y-2">
      <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 justify-center">
        <Target className="w-5 h-5" />
        Ready to Visualize Your Budget
      </h3>
      <p className="text-gray-500 text-sm max-w-sm">
        Your beautiful budget breakdown will appear here once you create some budget categories.
      </p>
      
      <Link 
        to="/budget" 
        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        <Plus className="w-4 h-4" />
        Create Your First Budget Item
      </Link>
    </div>
  </div>
);

const VisualSummaryCard: React.FC<VisualSummaryCardProps> = ({ budgetItems, formatCurrency }) => {
  // Early return for empty state
  if (budgetItems.length === 0) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Visual Allocation Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyStateIllustration />
        </CardContent>
      </Card>
    );
  }

  // Combine subitems as separate visualization if they have a tag
  const data = [
    ...budgetItems.map((item, i) => ({
      name: item.name,
      value: item.amount,
      tag: item.tag,
      color: (item.tag && tagColorMap[item.tag]) || COLORS[i % COLORS.length]
    })),
    ...budgetItems.flatMap((item, i) =>
      item.subItems.map((sub, j) => ({
        name: `[${item.name}] ${sub.name}`,
        value: sub.amount,
        tag: sub.tag,
        color: (sub.tag && tagColorMap[sub.tag]) || COLORS[(i + j + 5) % COLORS.length],
      }))
    )
  ];

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-xl">Visual Allocation Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-square max-w-xs mx-auto">
          <PieChart
            data={data}
            index="name"
            categories={['value']}
            valueFormatter={(value) => formatCurrency(Number(value))}
            colors={data.map(d => d.color ?? COLORS[0])}
            className="h-full"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-6 justify-center">
          {data.map((d, idx) => (
            <span key={d.name} className="flex items-center gap-1 text-xs bg-white rounded px-2 py-1 border" style={{ borderColor: d.color, color: d.color }}>
              <span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: d.color }} />
              {d.name} {!!d.tag && (<span className="font-bold">· {d.tag}</span>)}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisualSummaryCard;
