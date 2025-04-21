
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/ui/piechart";
import { BudgetItem } from "@/contexts/BudgetContext";

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

const VisualSummaryCard: React.FC<VisualSummaryCardProps> = ({ budgetItems, formatCurrency }) => {
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
