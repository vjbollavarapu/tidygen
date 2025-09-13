/**
 * Invoice details modal component for viewing comprehensive invoice information
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/hooks/useApi";
import { financeService, Invoice, Payment } from "@/services/financeService";
import { Loader2, FileText, DollarSign, Calendar, User, Mail, MapPin, CreditCard, Download, Send } from "lucide-react";

interface InvoiceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: Invoice | null;
}

export function InvoiceDetailsModal({ open, onOpenChange, invoice }: InvoiceDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch payments when invoice changes
  const { data: payments, loading: paymentsLoading } = useApi<Payment[]>(
    () => invoice ? financeService.getPayments({ invoice: invoice.id }) : Promise.resolve({ data: [] }),
    { enabled: !!invoice }
  );

  // Reset tab when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab("overview");
    }
  }, [open]);

  if (!invoice) return null;

  const isLoading = paymentsLoading;
  const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const remainingAmount = invoice.total_amount - totalPaid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice {invoice.invoice_number}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Invoice Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Invoice #:</span>
                    <span className="text-sm">{invoice.invoice_number}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Issue Date:</span>
                    <span className="text-sm">{new Date(invoice.issue_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Due Date:</span>
                    <span className="text-sm">{new Date(invoice.due_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'sent' ? 'secondary' :
                      invoice.status === 'overdue' ? 'destructive' :
                      invoice.status === 'cancelled' ? 'outline' : 'secondary'
                    }>
                      {invoice.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Currency:</span>
                    <span className="text-sm">{invoice.currency}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Client:</span>
                    <span className="text-sm">{invoice.client_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{invoice.client_email}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {invoice.client_address}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">${invoice.subtotal.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Subtotal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${invoice.tax_amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Tax</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${invoice.total_amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Total Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${totalPaid.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Amount Paid</div>
                  </div>
                </div>
                
                {remainingAmount > 0 && (
                  <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-warning" />
                      <span className="font-medium text-warning">Remaining Balance: ${remainingAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms and Notes */}
            {(invoice.terms_conditions || invoice.payment_terms || invoice.notes) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terms & Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {invoice.payment_terms && (
                    <div>
                      <span className="text-sm font-medium">Payment Terms:</span>
                      <p className="text-sm text-muted-foreground">{invoice.payment_terms}</p>
                    </div>
                  )}
                  
                  {invoice.terms_conditions && (
                    <div>
                      <span className="text-sm font-medium">Terms & Conditions:</span>
                      <p className="text-sm text-muted-foreground">{invoice.terms_conditions}</p>
                    </div>
                  )}
                  
                  {invoice.notes && (
                    <div>
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                {invoice.items && invoice.items.length > 0 ? (
                  <div className="space-y-3">
                    {invoice.items.map((item, index) => (
                      <div key={item.id || index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{item.description}</h4>
                          <span className="font-medium">${item.total_price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Quantity: {item.quantity}</span>
                          <span>Unit Price: ${item.unit_price.toFixed(2)}</span>
                          {item.service_type && <span>Type: {item.service_type}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">${payment.amount.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              payment.status === 'completed' ? 'default' :
                              payment.status === 'pending' ? 'secondary' :
                              payment.status === 'failed' ? 'destructive' : 'outline'
                            }>
                              {payment.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Method: {payment.payment_method.replace('_', ' ')}</span>
                          {payment.reference_number && <span>Ref: {payment.reference_number}</span>}
                        </div>
                        {payment.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{payment.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No payments found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {invoice.status === 'draft' && (
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
