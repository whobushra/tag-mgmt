import { Button } from "@/components/ui/button";
import { Plus, Package, Clock, Wrench, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OrdersTable } from "@/components/dashboard/OrdersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  // Mock data - in a real app, this would come from an API
  const kpiData = [
    { 
      title: "Total Orders", 
      value: "124", 
      icon: Package, 
      trend: "+12% from last month",
      bgColor: "bg-primary/10"
    },
    { 
      title: "Pending", 
      value: "24", 
      icon: Clock, 
      trend: "3 waiting for approval",
      bgColor: "bg-yellow-500/10"
    },
    { 
      title: "In Production", 
      value: "56", 
      icon: Wrench, 
      trend: "12 completing today",
      bgColor: "bg-blue-500/10"
    },
    { 
      title: "Delivered", 
      value: "44", 
      icon: CheckCircle, 
      trend: "+8% from last month",
      bgColor: "bg-green-500/10"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`h-10 w-10 rounded-full ${kpi.bgColor} flex items-center justify-center`}>
                  <kpi.icon className="h-5 w-5 text-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Button onClick={() => navigate('/create-order')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
        </div>
        <OrdersTable />
      </div>
    </DashboardLayout>
  );
};

export default Index;
