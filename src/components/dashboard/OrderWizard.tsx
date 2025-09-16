import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, ChevronLeft, Upload, Search, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface AllocationFormProps {
  sku: {
    code: string;
    description: string;
    ordered: number;
  };
  tagQty: number;
  allocations: Record<number, number>;
  allocatedTotal: number;
  isValid: boolean;
  onAllocate: (addressId: number, quantity: number) => void;
  onRemoveAllocation: (addressId: number) => void;
}

const AllocationForm: React.FC<AllocationFormProps> = ({
  sku,
  tagQty,
  allocations,
  allocatedTotal,
  isValid,
  onAllocate,
  onRemoveAllocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [quantity, setQuantity] = useState('');

  // Filter addresses based on search query
  const filteredAddresses = mockAddresses.filter(addr => 
    addr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    addr.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding allocation
  const handleAddAllocation = () => {
    if (!selectedAddress || !quantity) return;
    const addressId = parseInt(selectedAddress);
    const qty = parseInt(quantity);
    if (isNaN(addressId) || isNaN(qty) || qty <= 0) return;
    
    onAllocate(addressId, qty);
    setQuantity('');
    setSearchQuery('');
    setSelectedAddress('');
  };

  return (
    <Card key={sku.code} className="overflow-hidden">
      <CardHeader className="bg-muted/20 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{sku.code}</CardTitle>
            <p className="text-sm text-muted-foreground">{sku.description}</p>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <div>
                <span className="font-medium">Ordered:</span> {sku.ordered} pcs
              </div>
              <div>
                <span className="font-medium">Tags Required:</span> {tagQty}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              Allocated: <span className={isValid ? "text-green-600" : "text-destructive"}>
                {allocatedTotal}/{tagQty} tags
              </span>
            </div>
            {!isValid && (
              <Badge variant="destructive" className="mt-1">Invalid allocation</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4 items-end">
            {/* <div className="space-y-2">
              <Label htmlFor={`address-search-${sku.code}`}>Search Address</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={`address-search-${sku.code}`}
                  placeholder="Search by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div> */}
            
            <div className="space-y-2">
              <Label htmlFor={`select-address-${sku.code}`}>Select Address</Label>
              <Select 
                value={selectedAddress} 
                onValueChange={setSelectedAddress}
                // disabled={searchQuery}
              >
                <SelectTrigger id={`select-address-${sku.code}`}>
                  <SelectValue placeholder={searchQuery ? "Select an address" : "Search for an address"} />
                </SelectTrigger>
                <SelectContent>
                  {mockAddresses.length > 0 ? (
                    mockAddresses.map((addr) => (
                      <SelectItem key={addr.id} value={addr.id.toString()}>
                        <div className="space-y-1">
                          <div className="font-medium">{addr.name}</div>
                          <div className="text-xs text-muted-foreground">{addr.address}</div>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      {searchQuery ? 'No addresses found' : 'Search for an address'}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`quantity-${sku.code}`}>Quantity</Label>
              <Input
                id={`quantity-${sku.code}`}
                type="number"
                min="1"
                max={tagQty - allocatedTotal}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                disabled={!selectedAddress}
              />
            </div>
            
            <Button 
              onClick={handleAddAllocation}
              disabled={!selectedAddress || !quantity || (parseInt(quantity) || 0) <= 0}
              className="w-full md:w-auto"
            >
              Add
            </Button>
          </div>
          
          {/* Allocations Table */}
          {Object.keys(allocations).length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(allocations).map(([addrId, qty]) => {
                    const address = mockAddresses.find(a => a.id === parseInt(addrId));
                    if (!address) return null;
                    
                    return (
                      <TableRow key={addrId}>
                        <TableCell className="font-medium">{address.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {address.address}
                        </TableCell>
                        <TableCell className="text-right">{qty}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onRemoveAllocation(parseInt(addrId))}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Total Allocated */}
          <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
            <span className="font-medium">Total Allocated</span>
            <div className="flex items-center gap-2">
              <span className={allocatedTotal === tagQty ? "text-green-600 font-semibold" : "text-foreground font-semibold"}>
                {allocatedTotal} / {tagQty} tags
              </span>
              {allocatedTotal !== tagQty && (
                <span className="text-sm text-muted-foreground">
                  ({tagQty - allocatedTotal} remaining)
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  { id: 1, title: "Select PO", description: "Choose Purchase Order" },
  { id: 2, title: "Tag Details", description: "Configure SKU tags" },
  { id: 3, title: "Address Allocation", description: "Allocate to addresses" },
  { id: 4, title: "Review & Confirm", description: "Final review" },
];

// Mock data
const mockPOs = [
  { id: "PO-2024-001", supplier: "Fashion Co.", date: "2024-01-15", value: "$12,500" },
  { id: "PO-2024-002", supplier: "Textile Ltd.", date: "2024-01-18", value: "$8,900" },
  { id: "PO-2024-003", supplier: "Garment Pro", date: "2024-01-20", value: "$15,200" },
];

const mockSKUs = [
  { code: "SKU-001", description: "Cotton T-Shirt Blue M", ordered: 100, unitPrice: 12.50 },
  { code: "SKU-002", description: "Cotton T-Shirt Blue L", ordered: 80, unitPrice: 12.50 },
  { code: "SKU-003", description: "Cotton T-Shirt Red M", ordered: 60, unitPrice: 12.50 },
];

const mockAddresses = [
  { id: 1, name: "Warehouse A", address: "123 Main St, New York, NY 10001" },
  { id: 2, name: "Warehouse B", address: "456 Oak Ave, Los Angeles, CA 90210" },
  { id: 3, name: "Store 1", address: "789 Pine Rd, Chicago, IL 60601" },
];

export function OrderWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputMethod, setInputMethod] = useState("search"); // "search" or "upload"
  const [selectedPO, setSelectedPO] = useState("");
  const [poSearchQuery, setPOSearchQuery] = useState("");
  const [selectedSKUs, setSelectedSKUs] = useState<Record<string, boolean>>({});
  const [skuQuantities, setSKUQuantities] = useState<Record<string, number>>({});
  const [skuOverheads, setSKUOverheads] = useState<Record<string, number>>({});
  const [skuSplitRequired, setSKUSplitRequired] = useState<Record<string, boolean>>({});
  const [shipToMultipleAddresses, setShipToMultipleAddresses] = useState(false);
  const [singleAddress, setSingleAddress] = useState(1);
  const [skuSingleAddresses, setSKUSingleAddresses] = useState<Record<string, number>>({});
  const [skuAddressAllocations, setSKUAddressAllocations] = useState<Record<string, Record<number, number>>>({});
  
  const selectAllRef = useRef<HTMLButtonElement>(null);

  // Handle indeterminate state for select all checkbox
  useEffect(() => {
    const allSelected = mockSKUs.every(sku => selectedSKUs[sku.code]);
    const someSelected = mockSKUs.some(sku => selectedSKUs[sku.code]);
    
    if (selectAllRef.current) {
      const checkbox = selectAllRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) {
        checkbox.indeterminate = someSelected && !allSelected;
      }
    }
  }, [selectedSKUs]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = mockSKUs.every(sku => selectedSKUs[sku.code]);
    const newSelectedSKUs: Record<string, boolean> = {};
    mockSKUs.forEach(sku => {
      newSelectedSKUs[sku.code] = !allSelected;
    });
    setSelectedSKUs(newSelectedSKUs);
  };

  const toggleSKU = (skuCode: string) => {
    setSelectedSKUs(prev => ({
      ...prev,
      [skuCode]: !prev[skuCode]
    }));
  };

  const updateSKUQuantity = (skuCode: string, quantity: number) => {
    setSKUQuantities(prev => ({
      ...prev,
      [skuCode]: quantity
    }));
  };

  const updateSKUOverhead = (skuCode: string, overhead: number) => {
    setSKUOverheads(prev => ({
      ...prev,
      [skuCode]: overhead
    }));
  };

  const toggleSKUSplitRequired = (skuCode: string) => {
    setSKUSplitRequired(prev => ({
      ...prev,
      [skuCode]: !prev[skuCode]
    }));
  };

  const updateSKUSingleAddress = (skuCode: string, addressId: number) => {
    setSKUSingleAddresses(prev => ({
      ...prev,
      [skuCode]: addressId
    }));
  };

  const updateSKUAddressAllocation = (skuCode: string, addressId: number, quantity: number) => {
    setSKUAddressAllocations(prev => ({
      ...prev,
      [skuCode]: {
        ...prev[skuCode],
        [addressId]: quantity
      }
    }));
  };

  const getSKUAllocationTotal = (skuCode: string) => {
    const allocations = skuAddressAllocations[skuCode] || {};
    return Object.values(allocations).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  const isSKUAllocationValid = (skuCode: string) => {
    if (!skuSplitRequired[skuCode]) return true;
    const requiredTags = skuQuantities[skuCode] || 0;
    const allocatedTotal = getSKUAllocationTotal(skuCode);
    return allocatedTotal === requiredTags;
  };

  const filteredPOs = mockPOs.filter(po => 
    po.id.toLowerCase().includes(poSearchQuery.toLowerCase()) ||
    po.supplier.toLowerCase().includes(poSearchQuery.toLowerCase())
  );

  const isStep2Valid = () => {
    const hasSelectedSKUs = mockSKUs.some(sku => selectedSKUs[sku.code]);
    return hasSelectedSKUs;
  };

  const isStep3Valid = () => {
    if (!shipToMultipleAddresses) return true;
    
    return mockSKUs.every(sku => {
      if (!selectedSKUs[sku.code]) return true;
      if (!skuSplitRequired[sku.code]) return true;
      return isSKUAllocationValid(sku.code);
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <Tabs value={inputMethod} onValueChange={setInputMethod} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search PO Number
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Excel File
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-4">
                <div>
                  <Label htmlFor="po-search">Search Purchase Order</Label>
                  <Input
                    id="po-search"
                    placeholder="Enter PO number or supplier name..."
                    value={poSearchQuery}
                    onChange={(e) => setPOSearchQuery(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {poSearchQuery && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Search Results</Label>
                    <div className="border rounded-lg max-h-48 overflow-y-auto">
                      {filteredPOs.map((po) => (
                        <div
                          key={po.id}
                          className={`p-3 cursor-pointer hover:bg-accent border-b last:border-b-0 ${
                            selectedPO === po.id ? "bg-primary/10 border-primary" : ""
                          }`}
                          onClick={() => setSelectedPO(po.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{po.id}</span>
                              <span className="text-muted-foreground ml-2">{po.supplier}</span>
                            </div>
                            <span className="text-sm font-medium">{po.value}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{po.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload an Excel file containing PO details and SKU information
                  </p>
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supported formats: .xlsx, .xls (Max size: 10MB)
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {selectedPO && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Selected Purchase Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">PO Number</Label>
                      <p className="font-medium">{selectedPO}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Supplier</Label>
                      <p className="font-medium">{mockPOs.find(po => po.id === selectedPO)?.supplier}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Total Value</Label>
                      <p className="font-medium">{mockPOs.find(po => po.id === selectedPO)?.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        const allSKUsSelected = mockSKUs.every(sku => selectedSKUs[sku.code]);

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Configure Tag Details</h3>
                <p className="text-muted-foreground">Select SKUs and configure tag quantities</p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ship-multiple"
                  checked={shipToMultipleAddresses}
                  onCheckedChange={(checked) => setShipToMultipleAddresses(!!checked)}
                />
                <Label htmlFor="ship-multiple">Ship to Multiple Addresses</Label>
              </div>
            </div>

            {!shipToMultipleAddresses && (
              <div className="mb-4">
                <Label htmlFor="single-address">Shipping Address</Label>
                <Select value={singleAddress.toString()} onValueChange={(value) => setSingleAddress(parseInt(value))}>
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Select shipping address" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAddresses.map((addr) => (
                      <SelectItem key={addr.id} value={addr.id.toString()}>
                        {addr.name} - {addr.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      ref={selectAllRef}
                      checked={allSKUsSelected}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>SKU Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Ordered Quantity</TableHead>
                  <TableHead>Tags Required</TableHead>
                  <TableHead>Overhead %</TableHead>
                  <TableHead>Split Required?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSKUs.map((sku) => {
                  const isSelected = selectedSKUs[sku.code];
                  const tagQty = skuQuantities[sku.code] || 0;
                  const overhead = skuOverheads[sku.code] || 2;
                  const splitRequired = skuSplitRequired[sku.code] || false;

                  return (
                    <TableRow key={sku.code} className={isSelected ? "bg-accent/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSKU(sku.code)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{sku.code}</TableCell>
                      <TableCell>{sku.description}</TableCell>
                      <TableCell>{sku.ordered}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={tagQty}
                          onChange={(e) => updateSKUQuantity(sku.code, parseInt(e.target.value) || 0)}
                          className="w-24"
                          min="1"
                          max={sku.ordered}
                          disabled={!isSelected}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={overhead}
                          onChange={(e) => updateSKUOverhead(sku.code, parseFloat(e.target.value) || 0)}
                          className="w-20"
                          min="1"
                          max="5"
                          step="0.1"
                          disabled={!isSelected}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button
                            variant={splitRequired ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleSKUSplitRequired(sku.code)}
                            disabled={!isSelected || !shipToMultipleAddresses}
                          >
                            {splitRequired ? "Yes" : "No"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {!isStep2Valid() && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Please select at least one SKU to continue.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        if (!shipToMultipleAddresses) {
          // Skip address allocation if single address
          setCurrentStep(4);
          return null;
        }

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Address Allocation</h3>
              <p className="text-muted-foreground">Allocate quantities to shipping addresses</p>
            </div>

            {mockSKUs.filter(sku => selectedSKUs[sku.code]).map((sku) => {
              const tagQty = skuQuantities[sku.code] || 0;
              const splitRequired = skuSplitRequired[sku.code];
              const allocations = skuAddressAllocations[sku.code] || {};
              const allocatedTotal = getSKUAllocationTotal(sku.code);
              const isValid = isSKUAllocationValid(sku.code);

              if (!splitRequired) {
                return (
                  <Card key={sku.code}>
                    <CardHeader>
                      <CardTitle className="text-base">{sku.code} - {sku.description}</CardTitle>
                      <p className="text-sm text-muted-foreground">Quantity: {tagQty} tags</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Label>Address:</Label>
                        <Select 
                          value={(skuSingleAddresses[sku.code] || 1).toString()} 
                          onValueChange={(value) => updateSKUSingleAddress(sku.code, parseInt(value))}
                        >
                          <SelectTrigger className="w-80">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {mockAddresses.map((addr) => (
                              <SelectItem key={addr.id} value={addr.id.toString()}>
                                {addr.name} - {addr.address}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <AllocationForm
                  key={sku.code}
                  sku={sku}
                  tagQty={tagQty}
                  allocations={allocations}
                  allocatedTotal={allocatedTotal}
                  isValid={isValid}
                  onAllocate={(addressId, quantity) => {
                    updateSKUAddressAllocation(sku.code, addressId, (allocations[addressId] || 0) + quantity);
                  }}
                  onRemoveAllocation={(addressId) => {
                    updateSKUAddressAllocation(sku.code, addressId, 0);
                  }}
                />
              );
            })}
          </div>
        );

      case 4:
        const selectedSKUsList = mockSKUs.filter(sku => selectedSKUs[sku.code]);
        const totalTags = selectedSKUsList.reduce((sum, sku) => sum + (skuQuantities[sku.code] || 0), 0);
        const totalCost = selectedSKUsList.reduce((sum, sku) => {
          const qty = skuQuantities[sku.code] || 0;
          const overhead = skuOverheads[sku.code] || 2;
          return sum + (qty * sku.unitPrice * (1 + overhead / 100));
        }, 0);

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
              <p className="text-muted-foreground">Review your tag order before submitting</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Purchase Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PO Number:</span>
                    <span className="font-medium">{selectedPO}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="font-medium">{mockPOs.find(po => po.id === selectedPO)?.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Input Method:</span>
                    <span className="font-medium capitalize">{inputMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Mode:</span>
                    <span className="font-medium">{shipToMultipleAddresses ? "Multiple Addresses" : "Single Address"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Order Totals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Selected SKUs:</span>
                    <span className="font-medium">{selectedSKUsList.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tags:</span>
                    <span className="font-medium">{totalTags}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-medium text-lg">${totalCost.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">SKU Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedSKUsList.map((sku) => {
                    const tagQty = skuQuantities[sku.code] || 0;
                    const overhead = skuOverheads[sku.code] || 2;
                    const splitRequired = skuSplitRequired[sku.code];

                    return (
                      <div key={sku.code} className="p-4 bg-accent/20 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{sku.code}</span>
                            <span className="text-muted-foreground ml-2">{sku.description}</span>
                          </div>
                          <div className="text-right">
                            <div>Qty: {tagQty} | Overhead: {overhead}%</div>
                            <div className="text-sm text-muted-foreground">
                              Unit: ${sku.unitPrice} | Total: ${((tagQty * sku.unitPrice) * (1 + overhead/100)).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Address allocation display */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Shipping:</Label>
                          {shipToMultipleAddresses ? (
                            splitRequired ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {mockAddresses.map((addr) => {
                                  const qty = skuAddressAllocations[sku.code]?.[addr.id] || 0;
                                  if (qty === 0) return null;
                                  return (
                                    <div key={addr.id} className="text-sm bg-background p-2 rounded">
                                      <div className="font-medium">{addr.name}</div>
                                      <div className="text-muted-foreground">Qty: {qty}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-sm">
                                {mockAddresses.find(addr => addr.id === (skuSingleAddresses[sku.code] || 1))?.name} - {tagQty} tags
                              </div>
                            )
                          ) : (
                            <div className="text-sm">
                              {mockAddresses.find(addr => addr.id === singleAddress)?.name} - {tagQty} tags
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          {/* <CardTitle className="text-xl">Create New Tag Order</CardTitle> */}
          <div className="flex items-center justify-between w-full">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id < currentStep
                      ? "bg-status-delivered text-status-delivered-bg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <div className="ml-2 mr-4">
                  <p className={`text-sm font-medium ${step.id === currentStep ? "text-primary" : "text-muted-foreground"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {renderStepContent()}
      </CardContent>

      <div className="flex justify-between p-6 border-t border-border">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={
            (currentStep === 1 && !selectedPO) ||
            (currentStep === 2 && !isStep2Valid()) ||
            (currentStep === 3 && !isStep3Valid()) ||
            currentStep === steps.length
          }
          className={currentStep === steps.length ? "bg-gradient-primary" : ""}
        >
          {currentStep === steps.length ? "Submit Order" : "Next"}
          {currentStep < steps.length && <ChevronRight className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </Card>
  );
}