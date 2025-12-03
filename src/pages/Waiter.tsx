import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, FileText, RefreshCw, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/contexts/TenantContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types/menu";
import { DashboardHeader } from "@/components/DashboardHeader";

export default function Waiter() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const { data: tables, refetch: refetchTables } = useQuery({
    queryKey: ["restaurant-tables", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurant_tables")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("table_number");

      if (error) throw error;
      return data;
    },
  });

  const { data: orders, refetch: refetchOrders } = useQuery({
    queryKey: ["waiter-orders", tenantId],
    queryFn: async () => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("tenant_id", tenantId)
        .or(`status.in.(pending,accepted,preparing,cooking,ready),and(status.in.(completed,rejected),last_updated_at.gte.${tenMinutesAgo})`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  // Real-time subscription for order updates
  useEffect(() => {
    if (!tenantId) return;

    const channel = supabase
      .channel(`waiter-orders-${tenantId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `tenant_id=eq.${tenantId}`
        },
        () => {
          refetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, refetchOrders]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
      return;
    }
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const handleRefresh = () => {
    refetchTables();
    refetchOrders();
    toast.success("Refreshed");
  };

  const getTableOrders = (tableNumber: number) => {
    return orders?.filter((order) => order.table_id === String(tableNumber)) || [];
  };

  const hasLiveOrders = (tableNumber: number) => {
    return getTableOrders(tableNumber).length > 0;
  };

  const selectedTableOrders = selectedTable ? getTableOrders(selectedTable) : [];

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        title={tenant?.restaurant_name || "Restaurant"}
        subtitle="Waiter Dashboard"
        logo={
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <ClipboardList className="h-6 w-6" />
          </div>
        }
        actions={
          <Button
            variant="secondary"
            size="icon"
            onClick={handleRefresh}
            className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm h-9 w-9 sm:h-10 sm:w-10"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
        onLogout={handleLogout}
      />

      <div className="pt-14 sm:pt-16 md:pt-20">
        <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Tables Overview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click on a table to view orders. Green indicates live orders.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {tables?.map((table) => {
                const isLive = hasLiveOrders(table.table_number);
                return (
                  <Button
                    key={table.id}
                    variant="outline"
                    className={`h-24 flex flex-col items-center justify-center relative ${
                      isLive ? "bg-green-500/10 border-green-500 hover:bg-green-500/20" : "bg-muted/50"
                    }`}
                    onClick={() => setSelectedTable(table.table_number)}
                  >
                    <div className="text-lg font-bold">Table {table.table_number}</div>
                    {isLive && (
                      <Badge variant="default" className="absolute top-2 right-2 bg-green-500">
                        {getTableOrders(table.table_number).length}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </main>
      </div>

      <Dialog open={selectedTable !== null} onOpenChange={() => setSelectedTable(null)}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <DialogTitle className="text-base sm:text-lg">Table {selectedTable} - Orders</DialogTitle>
              <Button
                onClick={() => {
                  navigate(`/${tenantId}/table/${selectedTable}`);
                  setSelectedTable(null);
                }}
                size="sm"
                className="w-full sm:w-auto"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTableOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active orders for this table</div>
            ) : (
              selectedTableOrders.map((order) => {
                const items = JSON.parse(order.items_json);
                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Order #{order.order_id}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="capitalize">
                            {order.status}
                          </Badge>
                          <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                            {order.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.Item}
                            </span>
                            <span>₹{(item.Price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2 font-semibold flex justify-between">
                          <span>Total</span>
                          <span>₹{order.total}</span>
                        </div>
                        {order.notes && <div className="text-sm text-muted-foreground mt-2">Note: {order.notes}</div>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
