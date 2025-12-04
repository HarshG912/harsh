import { Navigate, Outlet, useParams } from 'react-router-dom';

/**
 * Normalizes table numbers by removing leading zeros and redirecting to canonical URL.
 * This prevents users from bypassing table limits by using "01", "001" etc.
 */
export const TableNormalizer = () => {
  const { tenantId, tableNumber } = useParams<{ tenantId: string; tableNumber: string }>();

  if (!tableNumber) {
    return <Outlet />;
  }

  // Normalize table number: "01", "001", "1" all become "1"
  const normalizedTableNumber = String(parseInt(tableNumber, 10));

  // If the URL has leading zeros or non-numeric chars, redirect to normalized URL
  if (tableNumber !== normalizedTableNumber) {
    // Check if it's a valid number
    if (isNaN(parseInt(tableNumber, 10))) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Invalid Table Number</h1>
            <p className="text-muted-foreground">Please scan a valid QR code.</p>
          </div>
        </div>
      );
    }
    
    // Redirect to the canonical URL without leading zeros
    return <Navigate to={`/${tenantId}/table/${normalizedTableNumber}`} replace />;
  }

  return <Outlet />;
};
