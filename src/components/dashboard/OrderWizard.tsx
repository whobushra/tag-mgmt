import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, ChevronLeft, Upload, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";

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
  { id: 1, title: "Upload Data", description: "Upload Excel file" },
  { id: 2, title: "Data Validation", description: "Configure SKU tags" },
  { id: 3, title: "Order Summary", description: "Review & confirm order" },
];

interface ExcelRow {
  MRP: string;
  Size: string;
  "Met Size": string;
  COLOR: string;
  "Style Code": string;
  "Variant Article Number": string;
  DESC: string;
  "YR MONTH": string;
  "po number": string;
  EAN: string;
  QTY: string;
}


const mockAddresses = [
  { id: 1, name: "Warehouse A", address: "123 Main St, New York, NY 10001" },
  { id: 2, name: "Warehouse B", address: "456 Oak Ave, Los Angeles, CA 90210" },
  { id: 3, name: "Store 1", address: "789 Pine Rd, Chicago, IL 60601" },
];

export function OrderWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [rowTagQuantities, setRowTagQuantities] = useState<Record<number, number>>({});
  const [rowOverheads, setRowOverheads] = useState<Record<number, number>>({});
  const [rowSplitRequired, setRowSplitRequired] = useState<Record<number, boolean>>({});
  const [shipToMultipleAddresses, setShipToMultipleAddresses] = useState(false);
  const [singleAddress, setSingleAddress] = useState(1);
  const [rowSingleAddresses, setRowSingleAddresses] = useState<Record<number, number>>({});
  const [rowAddressAllocations, setRowAddressAllocations] = useState<Record<number, Record<number, number>>>({});

  const selectAllRef = useRef<HTMLButtonElement>(null);

  // Handle indeterminate state for select all checkbox
  useEffect(() => {
    const allSelected = excelData.every((_, index) => selectedRows[index]);
    const someSelected = excelData.some((_, index) => selectedRows[index]);

    if (selectAllRef.current) {
      const checkbox = selectAllRef.current.querySelector('input[type="checkbox"]') as HTMLInputElement;
      if (checkbox) {
        checkbox.indeterminate = someSelected && !allSelected;
      }
    }
  }, [selectedRows, excelData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (!data) return;

        // Read Excel workbook
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0]; // First sheet
        const sheet = workbook.Sheets[sheetName];

        // Parse into JSON
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        console.log("Parsed Excel Data:", jsonData);

        setExcelData(jsonData);

        // Initialize default values for each row
        const defaultSelected: Record<number, boolean> = {};
        const defaultOverheads: Record<number, number> = {};
        jsonData.forEach((_, index) => {
          defaultSelected[index] = false;
          defaultOverheads[index] = 2; // Default 2% overhead
        });
        setSelectedRows(defaultSelected);
        setRowOverheads(defaultOverheads);
      };

      reader.readAsBinaryString(file);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      // Skip step 3 (address allocation) and go directly to step 4 (order summary)
      setCurrentStep(3);
    } else if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = excelData.every((_, index) => selectedRows[index]);
    const newSelectedRows: Record<number, boolean> = {};
    excelData.forEach((_, index) => {
      newSelectedRows[index] = !allSelected;
    });
    setSelectedRows(newSelectedRows);
  };

  const toggleRow = (rowIndex: number) => {
    setSelectedRows(prev => ({
      ...prev,
      [rowIndex]: !prev[rowIndex]
    }));
  };

  const updateRowTagQuantity = (rowIndex: number, quantity: number) => {
    setRowTagQuantities(prev => ({
      ...prev,
      [rowIndex]: quantity
    }));
  };

  const updateRowOverhead = (rowIndex: number, overhead: number) => {
    setRowOverheads(prev => ({
      ...prev,
      [rowIndex]: overhead
    }));
  };

  const toggleRowSplitRequired = (rowIndex: number) => {
    setRowSplitRequired(prev => ({
      ...prev,
      [rowIndex]: !prev[rowIndex]
    }));
  };

  const updateRowSingleAddress = (rowIndex: number, addressId: number) => {
    setRowSingleAddresses(prev => ({
      ...prev,
      [rowIndex]: addressId
    }));
  };

  const updateRowAddressAllocation = (rowIndex: number, addressId: number, quantity: number) => {
    setRowAddressAllocations(prev => ({
      ...prev,
      [rowIndex]: {
        ...prev[rowIndex],
        [addressId]: quantity
      }
    }));
  };

  const getRowAllocationTotal = (rowIndex: number) => {
    const allocations = rowAddressAllocations[rowIndex] || {};
    return Object.values(allocations).reduce((sum, qty) => sum + (qty || 0), 0);
  };

  const isRowAllocationValid = (rowIndex: number) => {
    if (!rowSplitRequired[rowIndex]) return true;
    const requiredTags = rowTagQuantities[rowIndex] || 0;
    const allocatedTotal = getRowAllocationTotal(rowIndex);
    return allocatedTotal === requiredTags;
  };

  const isStep2Valid = () => {
    const hasSelectedRows = excelData.some((_, index) => selectedRows[index]);
    return excelData.length > 0;
  };

  function excelSerialToMonthYear(serial: number) {
    if (!serial || isNaN(serial)) return "";
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    return dateInfo.toLocaleString("en-US", { month: "short", year: "numeric" });
  }

  // const excludedColumns = ["MRP", "Size", "Met Size", "Color", "Description", "Quantity", "__rowNum__"];
  const excludedColumns = ["mrp", "size", "met size", "color", "desc", "qty", "__rowNum__"];


  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Excel File</h3>
                <p className="text-muted-foreground mb-4">
                  Upload an Excel file containing product details and quantities
                </p>
                <div className="relative">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: .xlsx, .xls, .csv (Max size: 10MB)
                </p>
              </div>
            </div>

            {uploadedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Uploaded File</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">File Name</Label>
                      <p className="font-medium">{uploadedFile.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Rows Found</Label>
                      <p className="font-medium">{excelData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        const allRowsSelected = excelData.every((_, index) => selectedRows[index]);

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Data Validation</h3>
                <p className="text-muted-foreground">Select SKUs and configure tag quantities</p>
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="single-address">Default Shipping Address</Label>
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

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary hover:bg-primary">
                    <TableHead className="text-primary-foreground font-semibold">SKU Code</TableHead>
                    <TableHead className="text-primary-foreground font-semibold">Description</TableHead>
                    <TableHead className="text-primary-foreground font-semibold text-center">Ordered Quantity</TableHead>
                    <TableHead className="text-primary-foreground font-semibold text-center">Tags Required</TableHead>
                    <TableHead className="text-primary-foreground font-semibold text-center">Overhead %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelData.map((row, index) => {
                    const tagQty = rowTagQuantities[index] || parseInt(row.QTY) || 0;
                    const overhead = rowOverheads[index] || 2;

                    return (
                      <TableRow key={index} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{row["Variant Article Number"]}</TableCell>
                        <TableCell>{row.DESC}</TableCell>
                        <TableCell className="text-center">{row.QTY}</TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={tagQty}
                            onChange={(e) =>
                              updateRowTagQuantity(index, parseInt(e.target.value) || 0)
                            }
                            className="w-20 text-center"
                            min="1"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Select
                            value={overhead.toString()}
                            onValueChange={(value) => updateRowOverhead(index, parseInt(value))}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">0%</SelectItem>
                              <SelectItem value="1">1%</SelectItem>
                              <SelectItem value="2">2%</SelectItem>
                              <SelectItem value="3">3%</SelectItem>
                              <SelectItem value="4">4%</SelectItem>
                              <SelectItem value="5">5%</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {!isStep2Valid() && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Please upload an Excel file to continue.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        const selectedRowsList = excelData;
        const totalTags = selectedRowsList.reduce((sum, row, i) => {
          return sum + (rowTagQuantities[i] || parseInt(row.QTY) || 0);
        }, 0);
        const totalCost = selectedRowsList.reduce((sum, row, i) => {
          const qty = rowTagQuantities[i] || parseInt(row.QTY) || 0;
          const overhead = rowOverheads[i] || 2;
          const unitPrice = parseFloat(row.MRP) || 0;
          return sum + (qty * unitPrice * (1 + overhead / 100));
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
                    <span className="font-medium">{excelData[0]?.["po number"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Supplier:</span>
                    <span className="font-medium">Fashion Co.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Input Method:</span>
                    <span className="font-medium">Excel Upload</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Mode:</span>
                    <span className="font-medium">Single Address</span>
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
                    <span className="font-medium">{selectedRowsList.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tags:</span>
                    <span className="font-medium">{totalTags}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Cost:</span>
                    <span className="font-medium text-lg">₹{totalCost.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">
                      {mockAddresses.find(addr => addr.id === singleAddress)?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {mockAddresses.find(addr => addr.id === singleAddress)?.address}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Billing Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">Warehouse B</div>
                    <div className="text-sm text-muted-foreground">
                      wing B 55, 2nd Floor, Bhiwandi, Thane
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Product Details Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary hover:bg-primary">
                        <TableHead className="text-primary-foreground font-semibold">Sr. No</TableHead>
                        <TableHead className="text-primary-foreground font-semibold">SKU Code</TableHead>
                        <TableHead className="text-primary-foreground font-semibold">Description</TableHead>
                        <TableHead className="text-primary-foreground font-semibold text-center">Ordered Quantity</TableHead>
                        <TableHead className="text-primary-foreground font-semibold text-center">Tags Required</TableHead>
                        <TableHead className="text-primary-foreground font-semibold text-center">Overhead %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRowsList.map((row, index) => {
                        const tagQty = rowTagQuantities[index] || parseInt(row.QTY) || 0;
                        const overhead = rowOverheads[index] || 2;

                        return (
                          <TableRow key={index} className="hover:bg-muted/50">
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell className="font-medium">{row["Variant Article Number"]}</TableCell>
                            <TableCell>{row.DESC}</TableCell>
                            <TableCell className="text-center">{row.QTY}</TableCell>
                            <TableCell className="text-center">{tagQty}</TableCell>
                            <TableCell className="text-center">{overhead}%</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
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
          <div className="flex items-center justify-between w-full">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id === currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id < currentStep
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? "✓" : step.id}
                </div>
                <div className="ml-2 mr-4">
                  <p className={`text-sm font-medium ${step.id === currentStep ? "text-primary" : "text-muted-foreground"}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-px w-16 mx-2 ${step.id < currentStep ? "bg-green-500" : "bg-muted"}`} />
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
            (currentStep === 1 && !uploadedFile) ||
            (currentStep === 2 && !isStep2Valid()) ||
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
                </TableRow>
              </TableHeader>

              <TableBody>
                {excelData.map((row, index) => {
                  const isSelected = selectedRows[index];
                  const tagQty = rowTagQuantities[index] || row.QTY || 0; // default to excel qty
                  const overhead = rowOverheads[index] || 2;
                  const splitRequired = rowSplitRequired[index] || false;

                  return (
                    <TableRow key={index} className={isSelected ? "bg-accent/50" : ""}>
                      {/* <TableCell>
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleRow(index)}
            />
          </TableCell> */}

                      {/* Render only non-excluded columns */}
                      {Object.keys(row).map((col) => {
                        if (excludedColumns.includes(col.toLowerCase())) return null;

                        let value = row[col];

                        // Special formatting for YR MONTH
                        if (col === "YR MONTH" && typeof value === "number") {
                          value = excelSerialToMonthYear(value);
                        }

                        return <TableCell key={col}>{value}</TableCell>;
                      })}

                      {/* Custom: Tags Required (linked to QTY) */}
                      <TableCell>
                        <Input
                          type="number"
                          value={tagQty}
                          onChange={(e) =>
                            updateRowTagQuantity(index, parseInt(e.target.value) || 0)
                          }
                          className="w-24"
                          min="1"
                          // max={parseInt(row.QTY)}
                        // disabled={!isSelected}
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          type="number"
                          value={overhead}
                          onChange={(e) =>
                            updateRowOverhead(index, parseFloat(e.target.value) || 0)
                          }
                          className="w-20"
                          min="0"
                          max="5"
                          step="1"
                        // disabled={!isSelected}
                        />
                      </TableCell>

                      {/* <TableCell>
            <div className="flex items-center">
              <Button
                variant={splitRequired ? "default" : "outline"}
                size="sm"
                onClick={() => toggleRowSplitRequired(index)}
                disabled={!isSelected || !shipToMultipleAddresses}
              >
                {splitRequired ? "Yes" : "No"}
              </Button>
            </div>
          </TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>


            {!isStep2Valid() && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Please select at least one row to continue.
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

            {excelData.filter((_, index) => selectedRows[index]).map((row, originalIndex) => {
              const index = excelData.findIndex(r => r === row);
              const tagQty = rowTagQuantities[index] || 0;
              const splitRequired = rowSplitRequired[index];
              const allocations = rowAddressAllocations[index] || {};
              const allocatedTotal = getRowAllocationTotal(index);
              const isValid = isRowAllocationValid(index);

              if (!splitRequired) {
                return (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{row["Variant Article Number"]} - {row.DESC}</CardTitle>
                      <p className="text-sm text-muted-foreground">Quantity: {tagQty} tags</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <Label>Address:</Label>
                        <Select
                          value={(rowSingleAddresses[index] || 1).toString()}
                          onValueChange={(value) => updateRowSingleAddress(index, parseInt(value))}
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
                  key={index}
                  sku={{
                    code: row["Variant Article Number"],
                    description: row.DESC,
                    ordered: parseInt(row.QTY)
                  }}
                  tagQty={tagQty}
                  allocations={allocations}
                  allocatedTotal={allocatedTotal}
                  isValid={isValid}
                  onAllocate={(addressId, quantity) => {
                    updateRowAddressAllocation(index, addressId, (allocations[addressId] || 0) + quantity);
                  }}
                  onRemoveAllocation={(addressId) => {
                    updateRowAddressAllocation(index, addressId, 0);
                  }}
                />
              );
            })}
          </div>
        );

      case 4:
        const selectedRowsList = excelData.filter((_, index) => selectedRows[index]);
        const totalTags = selectedRowsList.reduce((sum, row, i) => {
          const originalIndex = excelData.findIndex(r => r === row);
          return sum + (rowTagQuantities[originalIndex] || 0);
        }, 0);
        const totalCost = selectedRowsList.reduce((sum, row, i) => {
          const originalIndex = excelData.findIndex(r => r === row);
          const qty = rowTagQuantities[originalIndex] || 0;
          const overhead = rowOverheads[originalIndex] || 2;
          const unitPrice = parseFloat(row.MRP) || 0;
          return sum + (qty * unitPrice * (1 + overhead / 100));
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
                    <span className="text-muted-foreground">File Name:</span>
                    <span className="font-medium">{uploadedFile?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Rows:</span>
                    <span className="font-medium">{excelData.length}</span>
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
                    <span className="text-muted-foreground">Selected Rows:</span>
                    <span className="font-medium">{selectedRowsList.length}</span>
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
                <CardTitle className="text-base">Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedRowsList.map((row, i) => {
                    const originalIndex = excelData.findIndex(r => r === row);
                    const tagQty = rowTagQuantities[originalIndex] || 0;
                    const overhead = rowOverheads[originalIndex] || 2;
                    const splitRequired = rowSplitRequired[originalIndex];
                    const unitPrice = parseFloat(row.MRP) || 0;

                    return (
                      <div key={originalIndex} className="p-4 bg-accent/20 rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{row["Variant Article Number"]}</span>
                            <span className="text-muted-foreground ml-2">{row.DESC}</span>
                          </div>
                          <div className="text-right">
                            <div>Qty: {tagQty} | Overhead: {overhead}%</div>
                            <div className="text-sm text-muted-foreground">
                              Unit: ₹{unitPrice} | Total: ₹{((tagQty * unitPrice) * (1 + overhead / 100)).toFixed(2)}
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
                                  const qty = rowAddressAllocations[originalIndex]?.[addr.id] || 0;
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
                                {mockAddresses.find(addr => addr.id === (rowSingleAddresses[originalIndex] || 1))?.name} - {tagQty} tags
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
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step.id === currentStep
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
            (currentStep === 1 && !uploadedFile) ||
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