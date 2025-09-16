import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Download, 
  Truck, 
  Filter, 
  Search,
  Calendar,
  MapPin,
  Package,
  ChevronDown,
  X,
  Check,
  ArrowUpDown,
  ChevronUp,
  ChevronDown as ChevronDownIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusBadge, OrderStatus } from "./StatusBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface Order {
  id: string;
  poNumber: string;
  createdOn: string;
  status: OrderStatus;
  shipments: number;
  totalTags: number;
  supplier: string;
  addresses: string[];
  timeline: Array<{
    status: string;
    date: string;
    description: string;
  }>;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: "TO-2024-001",
    poNumber: "PO-2024-001",
    createdOn: "2024-01-15",
    status: "delivered",
    shipments: 2,
    totalTags: 240,
    supplier: "Fashion Co.",
    addresses: ["Warehouse A", "Store 1"],
    timeline: [
      { status: "Order Created", date: "2024-01-15", description: "Tag order submitted" },
      { status: "In Production", date: "2024-01-16", description: "Tags being manufactured" },
      { status: "Shipped", date: "2024-01-18", description: "Packages dispatched" },
      { status: "Delivered", date: "2024-01-20", description: "All shipments delivered" },
    ]
  },
  {
    id: "TO-2024-002",
    poNumber: "PO-2024-002",
    createdOn: "2024-01-18",
    status: "shipped",
    shipments: 1,
    totalTags: 180,
    supplier: "Textile Ltd.",
    addresses: ["Warehouse B"],
    timeline: [
      { status: "Order Created", date: "2024-01-18", description: "Tag order submitted" },
      { status: "In Production", date: "2024-01-19", description: "Tags being manufactured" },
      { status: "Shipped", date: "2024-01-22", description: "Package dispatched" },
    ]
  },
  {
    id: "TO-2024-003",
    poNumber: "PO-2024-003",
    createdOn: "2024-01-20",
    status: "production",
    shipments: 3,
    totalTags: 320,
    supplier: "Garment Pro",
    addresses: ["Warehouse A", "Warehouse B", "Store 1"],
    timeline: [
      { status: "Order Created", date: "2024-01-20", description: "Tag order submitted" },
      { status: "In Production", date: "2024-01-21", description: "Tags being manufactured" },
    ]
  },
  {
    id: "TO-2024-004",
    poNumber: "PO-2024-004",
    createdOn: "2024-01-22",
    status: "pending",
    shipments: 1,
    totalTags: 150,
    supplier: "Fashion Co.",
    addresses: ["Store 1"],
    timeline: [
      { status: "Order Created", date: "2024-01-22", description: "Tag order submitted" },
    ]
  },
];

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "In Production", value: "production" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
];

interface ColumnFilter {
  id: string;
  value: string;
}

type SortDirection = 'asc' | 'desc' | null;

type SortConfig = {
  key: keyof Order | null;
  direction: SortDirection;
};

export function OrdersTable() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [openPopover, setOpenPopover] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  // Get unique values for each column for filtering
  const columnValues = useMemo(() => {
    const values: Record<string, Set<string>> = {
      status: new Set(),
      shipments: new Set(),
    };

    mockOrders.forEach(order => {
      values.status.add(order.status);
      values.shipments.add(order.shipments.toString());
    });

    return values;
  }, []);

  const togglePopover = (columnId: string) => {
    setOpenPopover(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleFilterChange = (columnId: string, value: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      if (value === "") {
        delete newFilters[columnId];
      } else {
        newFilters[columnId] = value;
      }
      return newFilters;
    });
  };

  const clearFilter = (columnId: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnId];
      return newFilters;
    });
  };

  const requestSort = (key: keyof Order) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Order) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />;
    if (sortConfig.direction === 'asc') return <ChevronUp className="ml-1 h-4 w-4" />;
    if (sortConfig.direction === 'desc') return <ChevronDownIcon className="ml-1 h-4 w-4" />;
    return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />;
  };

  const filteredAndSortedOrders = useMemo(() => {
    // Filtering
    const filtered = mockOrders.filter(order => {
      try {
        // Global search filter
        const matchesSearch = searchTerm === "" || 
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.supplier.toLowerCase().includes(searchTerm.toLowerCase());

        // Column filters
        const matchesColumnFilters = Object.entries(columnFilters).every(([key, value]) => {
          if (!value) return true;
          
          switch (key) {
            case 'status':
              return order.status === value;
            case 'shipments':
              return order.shipments.toString() === value;
            default:
              return true;
          }
        });

        // Status filter from the top filter bar
        const matchesStatusFilter = activeFilter === "all" || order.status === activeFilter;

        return matchesSearch && matchesStatusFilter && matchesColumnFilters;
      } catch (error) {
        console.error('Error filtering order:', order, error);
        return false;
      }
    });

    // Sorting
    if (!sortConfig.key || !sortConfig.direction) return filtered;

    return [...filtered].sort((a, b) => {
      try {
        let aValue = a[sortConfig.key as keyof Order];
        let bValue = b[sortConfig.key as keyof Order];

        // Handle different data types
        if (sortConfig.key === 'createdOn') {
          // Special handling for dates
          const dateA = new Date(aValue as string).getTime();
          const dateB = new Date(bValue as string).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          // String comparison
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          // Number comparison
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Default comparison
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      } catch (error) {
        console.error('Error sorting orders:', error);
        return 0;
      }
    });
  }, [mockOrders, searchTerm, columnFilters, activeFilter, sortConfig]);

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "⏳";
      case "production": return "🏭";
      case "shipped": return "🚚";
      case "delivered": return "✅";
      default: return "📦";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Tag Orders</CardTitle>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          {/* Filters */}
          {/* <div className="flex items-center gap-2 mt-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  variant={activeFilter === option.value ? "default" : "outline"}
                  size="sm"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div> */}
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('id')}
                    className="font-medium p-0 hover:bg-transparent"
                  >
                    Order ID
                    {getSortIcon('id')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('poNumber')}
                    className="font-medium p-0 hover:bg-transparent"
                  >
                    PO Number
                    {getSortIcon('poNumber')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('createdOn')}
                    className="font-medium p-0 hover:bg-transparent"
                  >
                    Created On
                    {getSortIcon('createdOn')}
                  </Button>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('status')}
                      className="font-medium p-0 hover:bg-transparent"
                    >
                      Status
                      {getSortIcon('status')}
                    </Button>
                    <Popover open={openPopover.status} onOpenChange={() => togglePopover('status')}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                          <Filter className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Filter status..." />
                          <CommandEmpty>No status found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem 
                              value=""
                              onSelect={() => handleFilterChange('status', '')}
                            >
                              <div className="flex items-center w-full">
                                <div className={`mr-2 h-4 w-4 ${!columnFilters['status'] ? 'opacity-100' : 'opacity-0'}`}>
                                  <Check className="h-4 w-4" />
                                </div>
                                <span>All Status</span>
                              </div>
                            </CommandItem>
                            {Array.from(columnValues.status).map((status) => (
                              <CommandItem
                                key={status}
                                value={status}
                                onSelect={() => handleFilterChange('status', status)}
                              >
                                <div className="flex items-center w-full">
                                  <div className={`mr-2 h-4 w-4 ${columnFilters['status'] === status ? 'opacity-100' : 'opacity-0'}`}>
                                    <Check className="h-4 w-4" />
                                  </div>
                                  <StatusBadge status={status as OrderStatus} className="capitalize" />
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {columnFilters['status'] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFilter('status');
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      onClick={() => requestSort('shipments')}
                      className="font-medium p-0 hover:bg-transparent"
                    >
                      Shipments
                      {getSortIcon('shipments')}
                    </Button>
                    <Popover open={openPopover.shipments} onOpenChange={() => togglePopover('shipments')}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                          <Filter className="h-3.5 w-3.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-32 p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Filter shipments..." />
                          <CommandEmpty>No shipments found.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem 
                              value=""
                              onSelect={() => handleFilterChange('shipments', '')}
                            >
                              <div className="flex items-center w-full">
                                <div className={`mr-2 h-4 w-4 ${!columnFilters['shipments'] ? 'opacity-100' : 'opacity-0'}`}>
                                  <Check className="h-4 w-4" />
                                </div>
                                <span>All Shipments</span>
                              </div>
                            </CommandItem>
                            {Array.from(columnValues.shipments).sort().map((count) => (
                              <CommandItem
                                key={count}
                                value={count}
                                onSelect={() => handleFilterChange('shipments', count)}
                              >
                                <div className="flex items-center w-full">
                                  <div className={`mr-2 h-4 w-4 ${columnFilters['shipments'] === count ? 'opacity-100' : 'opacity-0'}`}>
                                    <Check className="h-4 w-4" />
                                  </div>
                                  <Badge variant="secondary">{count}</Badge>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {columnFilters['shipments'] && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFilter('shipments');
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => requestSort('totalTags')}
                    className="font-medium p-0 hover:bg-transparent"
                  >
                    Total Tags
                    {getSortIcon('totalTags')}
                  </Button>
                </TableHead>
                <TableHead>
                  <div className="font-medium">Actions</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.poNumber}</TableCell>
                  <TableCell>{new Date(order.createdOn).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.shipments}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{order.totalTags}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Order Details - {order.id}</DialogTitle>
                          </DialogHeader>
                          
                          {selectedOrder && (
                            <div className="space-y-6">
                              {/* Order Summary */}
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Order ID:</span>
                                        <span className="font-medium">{selectedOrder.id}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">PO Number:</span>
                                        <span className="font-medium">{selectedOrder.poNumber}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Supplier:</span>
                                        <span className="font-medium">{selectedOrder.supplier}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Tags:</span>
                                        <span className="font-medium">{selectedOrder.totalTags}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="space-y-3">
                                      <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Status:</span>
                                        <StatusBadge status={selectedOrder.status} />
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipments:</span>
                                        <Badge variant="secondary">{selectedOrder.shipments}</Badge>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Created:</span>
                                        <span className="font-medium">
                                          {new Date(selectedOrder.createdOn).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Shipping Addresses */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Shipping Addresses
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    {selectedOrder.addresses.map((address, index) => (
                                      <div key={index} className="flex items-center gap-2 py-2 border-b last:border-b-0">
                                        <Package className="w-4 h-4 text-muted-foreground" />
                                        <span>{address}</span>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Status Timeline */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Status Timeline
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {selectedOrder.timeline.map((event, index) => (
                                      <div key={index} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="flex-1">
                                          <div className="flex justify-between items-center">
                                            <span className="font-medium">{event.status}</span>
                                            <span className="text-sm text-muted-foreground">{event.date}</span>
                                          </div>
                                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>

                      <Button variant="ghost" size="sm">
                        <Truck className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredAndSortedOrders.length} of {mockOrders.length} orders
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}