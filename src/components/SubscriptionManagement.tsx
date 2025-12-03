import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Download, CreditCard, Calendar, Building2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { PLANS, PlanType } from "@/types/plans";

interface SubscriptionPayment {
  id: string;
  user_id: string | null;
  tenant_id: string | null;
  plan: string;
  amount: number;
  setup_fee: number | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: string;
  payment_type: string;
  business_name: string | null;
  restaurant_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string | null;
  completed_at: string | null;
}

interface TenantSubscription {
  id: string;
  tenant_name: string;
  restaurant_name: string;
  contact_email: string;
  plan: string;
  plan_start_date: string | null;
  plan_end_date: string | null;
  is_active: boolean;
  created_at: string | null;
}

export function SubscriptionManagement() {
  const [payments, setPayments] = useState<SubscriptionPayment[]>([]);
  const [tenants, setTenants] = useState<TenantSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payments" | "subscriptions">("subscriptions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch subscription payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("subscription_payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Fetch tenants with subscription info
      const { data: tenantsData, error: tenantsError } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (tenantsError) throw tenantsError;
      setTenants(tenantsData || []);
    } catch (error) {
      console.error("Error fetching subscription data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500/20 text-red-700 border-red-500/30">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const planConfig = PLANS[plan as PlanType];
    const colors: Record<string, string> = {
      standard: "bg-slate-500/20 text-slate-700 border-slate-500/30",
      pro: "bg-blue-500/20 text-blue-700 border-blue-500/30",
      premium: "bg-purple-500/20 text-purple-700 border-purple-500/30",
      enterprise: "bg-amber-500/20 text-amber-700 border-amber-500/30",
    };
    return (
      <Badge className={colors[plan] || "bg-gray-500/20 text-gray-700"}>
        {planConfig?.name || plan}
      </Badge>
    );
  };

  const getSubscriptionStatus = (tenant: TenantSubscription) => {
    if (!tenant.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    
    if (!tenant.plan_end_date) {
      return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Active</Badge>;
    }

    const daysRemaining = differenceInDays(new Date(tenant.plan_end_date), new Date());
    
    if (daysRemaining < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (daysRemaining <= 3) {
      return <Badge className="bg-orange-500/20 text-orange-700 border-orange-500/30">Expiring Soon</Badge>;
    }
    return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Active</Badge>;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      (payment.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       payment.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       payment.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       payment.razorpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesPlan = planFilter === "all" || payment.plan === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = 
      tenant.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.contact_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = planFilter === "all" || tenant.plan === planFilter;
    
    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        matchesStatus = tenant.is_active && (!tenant.plan_end_date || differenceInDays(new Date(tenant.plan_end_date), new Date()) >= 0);
      } else if (statusFilter === "expired") {
        matchesStatus = tenant.plan_end_date ? differenceInDays(new Date(tenant.plan_end_date), new Date()) < 0 : false;
      } else if (statusFilter === "inactive") {
        matchesStatus = !tenant.is_active;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Calculate summary stats
  const totalRevenue = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + p.amount + (p.setup_fee || 0), 0);
  
  const activeSubscriptions = tenants.filter(t => 
    t.is_active && (!t.plan_end_date || differenceInDays(new Date(t.plan_end_date), new Date()) >= 0)
  ).length;
  
  const expiringSoon = tenants.filter(t => {
    if (!t.plan_end_date) return false;
    const days = differenceInDays(new Date(t.plan_end_date), new Date());
    return days >= 0 && days <= 7;
  }).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {payments.filter(p => p.status === "completed").length} payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Out of {tenants.length} total tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{expiringSoon}</div>
            <p className="text-xs text-muted-foreground">Within next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payments.filter(p => p.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Subscription Management</CardTitle>
              <CardDescription>View and manage all subscriptions and payments</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeTab === "subscriptions" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("subscriptions")}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Subscriptions
              </Button>
              <Button
                variant={activeTab === "payments" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("payments")}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Payments
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {activeTab === "payments" ? (
                  <>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tables */}
          {activeTab === "subscriptions" ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days Left</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTenants.map((tenant) => {
                      const daysLeft = tenant.plan_end_date 
                        ? differenceInDays(new Date(tenant.plan_end_date), new Date())
                        : null;
                      
                      return (
                        <TableRow key={tenant.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{tenant.tenant_name}</p>
                              <p className="text-xs text-muted-foreground">{tenant.contact_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{tenant.restaurant_name}</TableCell>
                          <TableCell>{getPlanBadge(tenant.plan)}</TableCell>
                          <TableCell>{getSubscriptionStatus(tenant)}</TableCell>
                          <TableCell>
                            {tenant.plan_start_date 
                              ? format(new Date(tenant.plan_start_date), "MMM dd, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {tenant.plan_end_date 
                              ? format(new Date(tenant.plan_end_date), "MMM dd, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {daysLeft !== null ? (
                              <span className={
                                daysLeft < 0 ? "text-red-500 font-medium" :
                                daysLeft <= 3 ? "text-orange-500 font-medium" :
                                daysLeft <= 7 ? "text-yellow-500 font-medium" :
                                "text-green-500 font-medium"
                              }>
                                {daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago` : `${daysLeft} days`}
                              </span>
                            ) : "-"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.business_name || payment.restaurant_name || "-"}</p>
                            <p className="text-xs text-muted-foreground">{payment.contact_email || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(payment.plan)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">₹{(payment.amount + (payment.setup_fee || 0)).toLocaleString()}</p>
                            {payment.setup_fee && payment.setup_fee > 0 && (
                              <p className="text-xs text-muted-foreground">
                                (₹{payment.amount} + ₹{payment.setup_fee} setup)
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payment.payment_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <span className="text-xs font-mono">
                            {payment.razorpay_payment_id || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {payment.created_at 
                            ? format(new Date(payment.created_at), "MMM dd, yyyy HH:mm")
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
