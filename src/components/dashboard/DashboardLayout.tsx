import { ReactNode } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", active: false },
  { icon: Package, label: "Tag Orders", active: true },
  { icon: ShoppingCart, label: "Purchase Orders", active: false },
  { icon: Users, label: "Suppliers", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-dashboard-bg flex">
      {/* Sidebar */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-6 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">TagFlow</h1>
              <p className="text-xs text-sidebar-foreground/60">Garment Vendor</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${item.active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-[#3e0084] border-b border-border px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden text-white hover:bg-white/10">
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-white">Tag Orders</h2>
                <p className="text-sm text-white/80">Manage and track your tag orders</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              {/* <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
                <Input
                  placeholder="Search orders..."
                  className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder-white/60 focus-visible:ring-white/20 focus-visible:ring-offset-0"
                />
              </div> */}

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-destructive">
                  3
                </Badge>
              </Button>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium border border-white">
                  JD
                </div>
                <div className="text-sm">
                  <p className="font-medium text-white">John Doe</p>
                  <p className="text-white">Vendor</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}