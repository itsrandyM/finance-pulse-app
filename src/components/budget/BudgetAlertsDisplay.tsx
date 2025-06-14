
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface BudgetAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  itemId: string;
  percentage: number;
}

interface BudgetAlertsDisplayProps {
  alerts: BudgetAlert[];
  onDismissAlert: (alertId: string) => void;
  className?: string;
}

const BudgetAlertsDisplay: React.FC<BudgetAlertsDisplayProps> = ({
  alerts,
  onDismissAlert,
  className = ''
}) => {
  if (alerts.length === 0) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger':
        return AlertTriangle;
      case 'warning':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'default';
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.type === 'danger');
  const warningAlerts = alerts.filter(alert => alert.type === 'warning');
  const infoAlerts = alerts.filter(alert => alert.type === 'info');

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Budget Alerts</CardTitle>
          <div className="flex gap-2">
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {criticalAlerts.length} Critical
              </Badge>
            )}
            {warningAlerts.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {warningAlerts.length} Warning
              </Badge>
            )}
            {infoAlerts.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {infoAlerts.length} Info
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => {
          const Icon = getAlertIcon(alert.type);
          
          return (
            <Alert key={alert.id} variant={getAlertVariant(alert.type) as any}>
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.title}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onDismissAlert(alert.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </AlertTitle>
                <AlertDescription>
                  {alert.message}
                </AlertDescription>
              </div>
            </Alert>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default BudgetAlertsDisplay;
