import { StatCard } from '@/components/ui/stat-card';
import {
  TableContainer,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { formatCurrency, formatNumber } from '@/lib/format';

interface UserAnalytics {
  roleDistribution: Array<{ role: string; count: number }>;
  averageLTV: number;
  averageOrdersPerUser: number;
}

interface CohortData {
  cohort: string;
  totalUsers: number;
  activeUsers: number;
  retentionRate: number;
}

interface UserBehavior {
  repeatPurchaseRate: number;
  averagePurchaseFrequency: number;
}

export function UsersTab({
  data,
  cohorts,
  behavior,
}: {
  data: UserAnalytics;
  cohorts: CohortData[];
  behavior: UserBehavior;
}) {
  if (!data) {
    return <div className="text-center text-gray-600">No user data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Role Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">User Role Distribution</h3>
        <div className="space-y-3">
          {data.roleDistribution.map((role) => (
            <div key={role.role} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{role.role}</span>
              <span className="text-sm text-gray-600">{role.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Behavior Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Average LTV"
          value={formatCurrency(data.averageLTV)}
          subtitle="Per customer"
        />

        <StatCard
          title="Avg Orders/User"
          value={data.averageOrdersPerUser.toFixed(1)}
          subtitle="Orders per user"
        />

        {behavior && (
          <>
            <StatCard
              title="Repeat Purchase Rate"
              value={`${behavior.repeatPurchaseRate.toFixed(1)}%`}
              subtitle="Customers who buy again"
            />

            <StatCard
              title="Avg Purchase Frequency"
              value={behavior.averagePurchaseFrequency.toFixed(1)}
              subtitle="Days between purchases"
            />
          </>
        )}
      </div>

      {/* Cohort Retention Analysis */}
      {cohorts && cohorts.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-2 text-lg font-bold text-gray-900">User Retention by Cohort</h3>
          <p className="mb-4 text-sm text-gray-600">Retention rate of users by signup month</p>
          <TableContainer className="border-0">
            <table className="w-full text-sm">
              <TableHeader className="border-b border-gray-200 bg-transparent">
                <tr>
                  <TableHeaderCell className="pb-2 font-semibold">Cohort</TableHeaderCell>
                  <TableHeaderCell align="right" className="pb-2 font-semibold">
                    Users
                  </TableHeaderCell>
                  <TableHeaderCell align="right" className="pb-2 font-semibold">
                    Active
                  </TableHeaderCell>
                  <TableHeaderCell align="right" className="pb-2 font-semibold">
                    Retention
                  </TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {cohorts.slice(0, 12).map((cohort) => (
                  <TableRow key={cohort.cohort} className="border-b border-gray-100 last:border-0">
                    <TableCell className="py-2 font-medium text-gray-900">
                      {cohort.cohort}
                    </TableCell>
                    <TableCell align="right" className="py-2 text-gray-600">
                      {formatNumber(cohort.totalUsers)}
                    </TableCell>
                    <TableCell align="right" className="py-2 text-gray-600">
                      {formatNumber(cohort.activeUsers)}
                    </TableCell>
                    <TableCell align="right" className="py-2">
                      <span
                        className={`font-semibold ${
                          cohort.retentionRate >= 50
                            ? 'text-green-600'
                            : cohort.retentionRate >= 25
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {cohort.retentionRate.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </TableContainer>
        </div>
      )}
    </div>
  );
}
