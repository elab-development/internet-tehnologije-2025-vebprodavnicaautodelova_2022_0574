import { useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { FiRefreshCw } from 'react-icons/fi';
import { useAdminStatsStore } from '../../stores/adminStatsStore';

function money(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '-';
  return `$${num.toFixed(2)}`;
}

function num(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function Card({ title, value, sub }) {
  return (
    <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
      <div className='text-xs uppercase tracking-wide text-neutral-500'>
        {title}
      </div>
      <div className='mt-1 text-2xl font-extrabold text-white'>{value}</div>
      {sub ? <div className='mt-1 text-sm text-neutral-400'>{sub}</div> : null}
    </div>
  );
}

function ChartBox({ title, subtitle, children }) {
  return (
    <div className='rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-base font-semibold text-white'>{title}</h3>
          {subtitle ? (
            <p className='mt-1 text-sm text-neutral-400'>{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className='mt-4 h-72'>{children}</div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className='rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 shadow-lg'>
      <div className='font-semibold text-white'>{label}</div>
      <div className='mt-1 grid gap-1'>
        {payload.map((p) => (
          <div
            key={p.dataKey}
            className='flex items-center justify-between gap-6'
          >
            <span className='text-neutral-400'>{p.name}</span>
            <span className='font-semibold text-white'>
              {typeof p.value === 'number' ? p.value : String(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const { kpis, charts, isLoading, error, clearError, fetchAdminStats } =
    useAdminStatsStore();

  useEffect(() => {
    fetchAdminStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ordersByStatus = useMemo(() => {
    const arr = charts?.ordersByStatus || [];
    return Array.isArray(arr) ? arr : [];
  }, [charts]);

  const revenueByMonth = useMemo(() => {
    const arr = charts?.revenueByMonth || [];
    return Array.isArray(arr) ? arr : [];
  }, [charts]);

  const topProducts = useMemo(() => {
    const arr = charts?.topProductsByQty || [];
    return Array.isArray(arr) ? arr : [];
  }, [charts]);

  const ratingDist = useMemo(() => {
    const arr = charts?.ratingDistribution || [];
    return Array.isArray(arr) ? arr : [];
  }, [charts]);

  // KPI values (fallbacks)
  const totalUsers = kpis?.users?.total ?? 0;
  const activeProducts = kpis?.products?.active ?? 0;
  const totalOrders = kpis?.orders?.total ?? 0;
  const avgRating = kpis?.reviews?.avgRating;

  const revenueNonCancelled = kpis?.revenue?.nonCancelledTotal ?? 0;
  const revenueDelivered = kpis?.revenue?.deliveredTotal ?? 0;

  return (
    <div className='grid gap-6'>
      <div className='min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-4 sm:p-5'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-white'>Overview</h2>
            <p className='mt-1 text-sm text-neutral-400'>
              Key metrics and performance charts.
            </p>
          </div>

          <button
            onClick={() => {
              clearError();
              fetchAdminStats();
            }}
            disabled={isLoading}
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:bg-neutral-800 disabled:opacity-60'
            type='button'
          >
            <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className='mt-4 rounded-xl border border-red-700/40 bg-red-950/40 p-4 text-sm text-red-200'>
            {error}
          </div>
        ) : null}

        {/* KPI cards */}
        <div className='mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          <Card title='Total users' value={totalUsers} sub='All roles' />
          <Card
            title='Active products'
            value={activeProducts}
            sub='In catalog'
          />
          <Card title='Total orders' value={totalOrders} sub='All statuses' />
          <Card
            title='Avg rating'
            value={avgRating == null ? '-' : String(avgRating)}
            sub='Tech reviews'
          />
        </div>

        {/* Revenue quick cards */}
        <div className='mt-3 grid gap-3 sm:grid-cols-2'>
          <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
            <div className='text-xs uppercase tracking-wide text-neutral-500'>
              Revenue (non-cancelled)
            </div>
            <div className='mt-1 text-xl font-extrabold text-white'>
              {money(revenueNonCancelled)}
            </div>
            <div className='mt-1 text-sm text-neutral-400'>
              Includes pending/processing/shipped/delivered
            </div>
          </div>

          <div className='rounded-xl border border-neutral-800 bg-neutral-950 p-4'>
            <div className='text-xs uppercase tracking-wide text-neutral-500'>
              Revenue (delivered)
            </div>
            <div className='mt-1 text-xl font-extrabold text-white'>
              {money(revenueDelivered)}
            </div>
            <div className='mt-1 text-sm text-neutral-400'>
              Completed orders only
            </div>
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <ChartBox
          title='Orders by status'
          subtitle='Distribution across order lifecycle'
        >
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={ordersByStatus}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(255,255,255,0.06)'
              />
              <XAxis dataKey='status' stroke='rgba(255,255,255,0.45)' />
              <YAxis stroke='rgba(255,255,255,0.45)' />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='count'
                name='Orders'
                fill='#ef4444'
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox
          title='Revenue by month'
          subtitle='Last 12 months (non-cancelled)'
        >
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={revenueByMonth}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(255,255,255,0.06)'
              />
              <XAxis dataKey='month' stroke='rgba(255,255,255,0.45)' />
              <YAxis
                stroke='rgba(255,255,255,0.45)'
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                content={<CustomTooltip />}
                formatter={(v, _n, _p) => [money(v), 'Revenue']}
              />
              <Line
                type='monotone'
                dataKey='revenue'
                name='Revenue'
                stroke='#ef4444'
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox
          title='Top products (last 30 days)'
          subtitle='By total quantity sold (non-cancelled)'
        >
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={topProducts}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(255,255,255,0.06)'
              />
              <XAxis
                dataKey='name'
                stroke='rgba(255,255,255,0.45)'
                interval={0}
                tickFormatter={(v) =>
                  String(v).length > 10 ? `${String(v).slice(0, 10)}…` : v
                }
              />
              <YAxis stroke='rgba(255,255,255,0.45)' />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='quantity'
                name='Qty'
                fill='#ef4444'
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox
          title='Rating distribution'
          subtitle='How mechanics rate products (1–5)'
        >
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={ratingDist}>
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='rgba(255,255,255,0.06)'
              />
              <XAxis dataKey='rating' stroke='rgba(255,255,255,0.45)' />
              <YAxis stroke='rgba(255,255,255,0.45)' />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='count'
                name='Reviews'
                fill='#ef4444'
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>
      </div>
    </div>
  );
}
