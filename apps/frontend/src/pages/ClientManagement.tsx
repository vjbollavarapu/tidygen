import { useState } from "react";
import { Plus, Search, Filter, Download, MapPin, Phone, Mail } from "lucide-react";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock client data
const clientData = [
  {
    id: 1,
    name: "ABC Corporation",
    type: "Commercial",
    contact: "John Smith",
    email: "john@abccorp.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, City",
    status: "Active",
    services: ["Deep Cleaning", "Regular Maintenance"],
    contractValue: "$2,400/month",
    lastService: "2024-01-15",
    nextService: "2024-01-22",
  },
  {
    id: 2,
    name: "Downtown Restaurant",
    type: "Commercial",
    contact: "Maria Garcia",
    email: "maria@restaurant.com",
    phone: "+1 (555) 234-5678",
    address: "456 Main St, Downtown",
    status: "Active",
    services: ["Kitchen Deep Clean", "Dining Area"],
    contractValue: "$1,800/month",
    lastService: "2024-01-14",
    nextService: "2024-01-21",
  },
  {
    id: 3,
    name: "Residential - Johnson Family",
    type: "Residential",
    contact: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 345-6789",
    address: "789 Oak Street, Suburbs",
    status: "Active",
    services: ["Weekly House Cleaning"],
    contractValue: "$480/month",
    lastService: "2024-01-16",
    nextService: "2024-01-23",
  },
  {
    id: 4,
    name: "Tech Startup Office",
    type: "Commercial",
    contact: "Mike Chen",
    email: "mike@techstartup.com",
    phone: "+1 (555) 456-7890",
    address: "321 Innovation Drive",
    status: "Pending",
    services: ["Office Cleaning", "Carpet Cleaning"],
    contractValue: "$1,200/month",
    lastService: null,
    nextService: "2024-01-25",
  },
];

const columns: Column[] = [
  {
    key: "name",
    label: "Client Name",
    sortable: true,
    render: (value, row) => (
      <div>
        <div className="font-medium">{value}</div>
        <div className="text-sm text-muted-foreground">{row.type}</div>
      </div>
    ),
  },
  {
    key: "contact",
    label: "Contact",
    render: (value, row) => (
      <div>
        <div className="font-medium text-sm">{value}</div>
        <div className="text-xs text-muted-foreground">{row.email}</div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge
        variant={value === "Active" ? "default" : value === "Pending" ? "secondary" : "destructive"}
      >
        {value}
      </Badge>
    ),
  },
  {
    key: "contractValue",
    label: "Contract Value",
    sortable: true,
  },
  {
    key: "nextService",
    label: "Next Service",
    sortable: true,
    render: (value) => (
      <div className="text-sm">
        {value ? new Date(value).toLocaleDateString() : "Not scheduled"}
      </div>
    ),
  },
];

export default function ClientManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleView = (client: any) => {
    console.log("View client:", client);
  };

  const handleEdit = (client: any) => {
    console.log("Edit client:", client);
  };

  const handleDelete = (client: any) => {
    console.log("Delete client:", client);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
          <p className="text-muted-foreground">
            Manage your cleaning service clients and contracts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-enterprise">
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client record for your cleaning service.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input id="clientName" placeholder="Enter client name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientType">Client Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Person</Label>
                    <Input id="contactName" placeholder="Primary contact name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="client@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Full service address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contractValue">Contract Value</Label>
                    <Input id="contractValue" placeholder="$1,200/month" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Create Client
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">247</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Phone className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Contracts</p>
              <p className="text-2xl font-bold">198</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Mail className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">37</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Client Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={clientData}
            columns={columns}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchable
            filterable
          />
        </CardContent>
      </Card>
    </div>
  );
}