interface OrderAnalytics {
  statusDistribution: Array<{ status: string; count: number }>;
}

interface PaymentAnalytics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  statusBreakdown?: Array<{ status: string; count: number }>;
}

export function OrdersTab({
  data,
  payments,
}: {
  data: OrderAnalytics;
  payments: PaymentAnalytics;
}) {
  if (!data) {
    return <div className="text-center text-gray-600">No order data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Order Status Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Order Status Distribution</h3>
        <div className="space-y-3">
          {data.statusDistribution.map((status) => (
            <div key={status.status} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{status.status}</span>
              <span className="text-sm text-gray-600">{status.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Analytics */}
      {payments && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Payment Performance</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {payments.totalPayments.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="mt-1 text-3xl font-bold text-green-600">
                {payments.successfulPayments.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="mt-1 text-3xl font-bold text-red-600">
                {payments.failedPayments.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="mt-1 text-3xl font-bold text-blue-600">
                {payments.successRate.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          {payments.statusBreakdown && payments.statusBreakdown.length > 0 && (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-gray-700">Status Breakdown</h4>
              <div className="space-y-2">
                {payments.statusBreakdown.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.status}</span>
                    <span className="text-sm text-gray-600">{item.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
