
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, ChevronLeft, Upload, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
            <div className="space-y-2">
              <Label htmlFor={`select-address-${sku.code}`}>Select Address</Label>
              <Select
                value={selectedAddress}
                onValueChange={setSelectedAddress}
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
  { id: 3, title: "Order Summary", description: "Final review" },
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
    const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState<"shipping" | "billing" | null>(null);
  const [shippingAddress, setShippingAddress] = useState("A");
  const [billingAddress, setBillingAddress] = useState("A");
  const [selectedAddressForPopup, setSelectedAddressForPopup] = useState("A");

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
    return excelData.length > 0;
  };

  const isStep3Valid = () => {
    if (!shipToMultipleAddresses) return true;

    return excelData.every((_, index) => {
      if (!selectedRows[index]) return true;
      if (!rowSplitRequired[index]) return true;
      return isRowAllocationValid(index);
    });
  };

  function excelSerialToMonthYear(serial: number) {
    if (!serial || isNaN(serial)) return "";
    const utcDays = Math.floor(serial - 25569);
    const utcValue = utcDays * 86400;
    const dateInfo = new Date(utcValue * 1000);
    return dateInfo.toLocaleString("en-US", { month: "short", year: "numeric" });
  }

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
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Configure Tag Details</h3>
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

            <Table>
              <TableHeader>
                <TableRow className="bg-primary text-primary-foreground">
                  {/* Auto-generate headers from keys except excluded ones */}
                  {excelData.length > 0 &&
                    Object.keys(excelData[0]).map((col) =>
                      !excludedColumns.includes(col.toLowerCase()) && (
                        <TableHead className="text-primary-foreground" key={col}>{col}</TableHead>
                      )
                    )}

                  <TableHead className="text-primary-foreground">Tags Required</TableHead>
                  <TableHead className="text-primary-foreground">Overage %</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {excelData.map((row, index) => {
                  const tagQty = rowTagQuantities[index] || row.QTY || 0;
                  const overhead = rowOverheads[index] || 2;

                  return (
                    <TableRow key={index}>
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

                      <TableCell>
                        <Input
                          type="number"
                          value={tagQty}
                          onChange={(e) =>
                            updateRowTagQuantity(index, parseInt(e.target.value) || 0)
                          }
                          className="w-24"
                          min="1"
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
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        );

    case 3:
  const selectedRowsList = excelData.filter((_, index) => selectedRows[index]);
  const totalTags = excelData.reduce((sum, row, i) => {
    return sum + (rowTagQuantities[i] || 0);
  }, 0);
  const totalCost = excelData.reduce((sum, row, i) => {
    const qty = rowTagQuantities[i] || 0;
    const overhead = rowOverheads[i] || 2;
    const unitPrice = parseFloat(row.MRP) || 0;
    return sum + (qty * unitPrice * (1 + overhead / 100));
  }, 0);

  // mock addresses for popup
  const mockAddressesForPopUp = [
    { id: "A", name: "ACME", address: "Bl.155, 3rd Floor, Andheri, Mumbai, 400001." },
    { id: "B", name: "Warehouse B", address: "Wing B 55, 2nd Floor, Bhiwandi, Thane" },
    { id: "C", name: "Warehouse C", address: "1st Floor, Ghodbandar, Thane" },
    { id: "D", name: "Warehouse D", address: "2nd Floor, Panvel" },
  ];

  const handleOpen = (type: "shipping" | "billing") => {
    setEditingType(type);
    setSelectedAddressForPopup(type === "shipping" ? shippingAddress : billingAddress);
    setOpenDialog(true);
  };

  const handleUpdate = () => {
    if (editingType === "shipping") {
      setShippingAddress(selectedAddressForPopup);
    } else if (editingType === "billing") {
      setBillingAddress(selectedAddressForPopup);
    }
    setOpenDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* ---------------- Vendor / Order Details ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-muted-foreground">Vendor Code</p>
            <p className="font-medium">100</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vendor Name</p>
            <p className="font-medium">John Smith</p>
          </div>
          <div>
            <p className="text-muted-foreground">Tag Quantity</p>
            <p className="font-medium">{totalTags}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Total Article</p>
            <p className="font-medium">{excelData.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected Delivery Date</p>
            <p className="font-medium">26 September 2025</p>
          </div>
        </CardContent>
      </Card>

      {/* ---------------- Delivery & Billing Details ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery & Billing Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div>
            <p className="text-muted-foreground flex items-center gap-2">
              Shipping Address
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => handleOpen("shipping")}
              >
                ✏️
              </Button>
            </p>
            <p className="font-medium">
              {mockAddressesForPopUp.find(a => a.id === shippingAddress)?.name},{" "}
              {mockAddressesForPopUp.find(a => a.id === shippingAddress)?.address}
            </p>
          </div>

          {/* Billing Address */}
          <div>
            <p className="text-muted-foreground flex items-center gap-2">
              Billing Address
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => handleOpen("billing")}
              >
                ✏️
              </Button>
            </p>
            <p className="font-medium">
              {mockAddressesForPopUp.find(a => a.id === billingAddress)?.name},{" "}
              {mockAddressesForPopUp.find(a => a.id === billingAddress)?.address}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ---------------- Product Table ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-primary text-primary-foreground">
                <TableHead className="text-primary-foreground">Sr. No</TableHead>
                <TableHead className="text-primary-foreground">SKU Code</TableHead>
                <TableHead className="text-primary-foreground">Description</TableHead>
                <TableHead className="text-primary-foreground">Ordered Quantity</TableHead>
                <TableHead className="text-primary-foreground">Tags Required</TableHead>
                <TableHead className="text-primary-foreground">Overhead %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {excelData.map((row, i) => {
                const tagQty =  rowTagQuantities[i] || 0;
                const overhead = rowOverheads[i] || 2;

                return (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell className="font-medium">
                      {row["Variant Article Number"] || `TO-2024-00${i + 1}`}
                    </TableCell>
                    <TableCell>{row.DESC}</TableCell>
                    <TableCell>{row.QTY}</TableCell>
                    <TableCell>{tagQty}</TableCell>
                    <TableCell>{overhead}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ---------------- Popup ---------------- */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType === "shipping" ? "Select Shipping Address" : "Select Billing Address"}
            </DialogTitle>
          </DialogHeader>

          <RadioGroup value={selectedAddressForPopup} onValueChange={setSelectedAddressForPopup}>
            {mockAddressesForPopUp.map(addr => (
              <div key={addr.id} className="flex items-center space-x-2">
                <RadioGroupItem value={addr.id} id={addr.id} />
                <Label htmlFor={addr.id}>
                  {addr.name}, {addr.address}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <DialogFooter>
            <Button onClick={handleUpdate}>Update Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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