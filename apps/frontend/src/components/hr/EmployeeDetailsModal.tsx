/**
 * Employee details modal component for viewing comprehensive employee information
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { hrService, Employee, Attendance, Payroll, PerformanceReview, LeaveRequest } from "@/services/hrService";
import { Loader2, User, Mail, Phone, MapPin, Calendar, DollarSign, Clock, Star, FileText, Edit } from "lucide-react";

interface EmployeeDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
}

export function EmployeeDetailsModal({ open, onOpenChange, employee }: EmployeeDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch related data when employee changes
  const { data: attendanceResponse, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', employee?.id],
    queryFn: () => employee ? hrService.getAttendance({ employee: employee.id, page_size: 10 }) : Promise.resolve({ data: [] }),
    enabled: !!employee
  });

  const { data: payrollResponse, isLoading: payrollLoading } = useQuery({
    queryKey: ['payroll', employee?.id],
    queryFn: () => employee ? hrService.getPayroll({ employee: employee.id, page_size: 10 }) : Promise.resolve({ data: [] }),
    enabled: !!employee
  });

  const { data: performanceReviewsResponse, isLoading: reviewsLoading } = useQuery({
    queryKey: ['performanceReviews', employee?.id],
    queryFn: () => employee ? hrService.getPerformanceReviews({ employee: employee.id, page_size: 10 }) : Promise.resolve({ data: [] }),
    enabled: !!employee
  });

  const { data: leaveRequestsResponse, isLoading: leaveLoading } = useQuery({
    queryKey: ['leaveRequests', employee?.id],
    queryFn: () => employee ? hrService.getLeaveRequests({ employee: employee.id, page_size: 10 }) : Promise.resolve({ data: [] }),
    enabled: !!employee
  });

  const attendance = attendanceResponse?.data;
  const payroll = payrollResponse?.data;
  const performanceReviews = performanceReviewsResponse?.data;
  const leaveRequests = leaveRequestsResponse?.data;

  // Reset tab when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab("overview");
    }
  }, [open]);

  if (!employee) return null;

  const isLoading = attendanceLoading || payrollLoading || reviewsLoading || leaveLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {employee.first_name} {employee.last_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="leave">Leave History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Employee ID:</span>
                    <span className="text-sm">{employee.employee_id}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {employee.address}<br />
                      {employee.city}, {employee.state} {employee.zip_code}<br />
                      {employee.country}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date of Birth:</span>
                    <span className="text-sm">{new Date(employee.date_of_birth).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Employment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Position:</span>
                    <span className="text-sm">{employee.position}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Department:</span>
                    <span className="text-sm">{employee.department}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Employment Type:</span>
                    <Badge variant="outline">
                      {employee.employment_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={
                      employee.status === 'active' ? 'default' :
                      employee.status === 'on_leave' ? 'secondary' :
                      employee.status === 'terminated' ? 'destructive' : 'outline'
                    }>
                      {employee.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Hire Date:</span>
                    <span className="text-sm">{new Date(employee.hire_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Annual Salary:</span>
                    <span className="text-sm">${employee.salary.toLocaleString()}</span>
                  </div>
                  
                  {employee.hourly_rate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Hourly Rate:</span>
                      <span className="text-sm">${employee.hourly_rate.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {employee.manager_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Manager:</span>
                      <span className="text-sm">{employee.manager_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <span className="text-sm font-medium">Name:</span>
                    <p className="text-sm">{employee.emergency_contact_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Phone:</span>
                    <p className="text-sm">{employee.emergency_contact_phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Relationship:</span>
                    <p className="text-sm">{employee.emergency_contact_relationship}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills and Certifications */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.skills && employee.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {employee.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills listed</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {employee.certifications && employee.certifications.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {employee.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No certifications listed</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            {employee.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{employee.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : attendance && attendance.length > 0 ? (
                  <div className="space-y-3">
                    {attendance.map((record) => (
                      <div key={record.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{new Date(record.date).toLocaleDateString()}</span>
                          <Badge variant={
                            record.status === 'present' ? 'default' :
                            record.status === 'late' ? 'secondary' :
                            record.status === 'absent' ? 'destructive' : 'outline'
                          }>
                            {record.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {record.check_in_time && <span>In: {record.check_in_time}</span>}
                          {record.check_out_time && <span>Out: {record.check_out_time}</span>}
                          {record.total_hours && <span>Hours: {record.total_hours}</span>}
                        </div>
                        {record.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{record.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No attendance records found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payroll History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : payroll && payroll.length > 0 ? (
                  <div className="space-y-3">
                    {payroll.map((record) => (
                      <div key={record.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {new Date(record.pay_period_start).toLocaleDateString()} - {new Date(record.pay_period_end).toLocaleDateString()}
                          </span>
                          <Badge variant={
                            record.status === 'paid' ? 'default' :
                            record.status === 'approved' ? 'secondary' :
                            record.status === 'draft' ? 'outline' : 'destructive'
                          }>
                            {record.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Gross:</span>
                            <p className="font-medium">${record.gross_salary.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Deductions:</span>
                            <p className="font-medium">${record.deductions.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Net:</span>
                            <p className="font-medium">${record.net_salary.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No payroll records found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : performanceReviews && performanceReviews.length > 0 ? (
                  <div className="space-y-3">
                    {performanceReviews.map((review) => (
                      <div key={review.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {new Date(review.review_period_start).toLocaleDateString()} - {new Date(review.review_period_end).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{review.overall_rating}/5</span>
                            </div>
                            <Badge variant={
                              review.status === 'completed' ? 'default' :
                              review.status === 'approved' ? 'secondary' :
                              review.status === 'submitted' ? 'outline' : 'secondary'
                            }>
                              {review.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Goals: {review.goals_achieved}/{review.goals_total} achieved
                        </div>
                        {review.comments && (
                          <p className="text-sm">{review.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No performance reviews found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Leave History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : leaveRequests && leaveRequests.length > 0 ? (
                  <div className="space-y-3">
                    {leaveRequests.map((request) => (
                      <div key={request.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-medium">{request.leave_type.replace('_', ' ')}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'pending' ? 'secondary' :
                            request.status === 'rejected' ? 'destructive' : 'outline'
                          }>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {request.total_days} days - {request.reason}
                        </div>
                        {request.comments && (
                          <p className="text-sm">{request.comments}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No leave requests found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Employee
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
