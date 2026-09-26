"use client";
import { Skeleton } from "@/components/ui/Skeleton";
import "./DashboardSkeleton.css";

/**
 * DashboardSkeleton — the dashboard's silhouette.
 *
 * Mirrors the real page structure (hero stat, three compact stats,
 * two-column grid, table) so nothing jumps when the data arrives.
 */
export function DashboardSkeleton() {
  return (
    <div className="ta-skel-dash" aria-busy="true" aria-live="polite">
      {/* Hero stat */}
      <div className="ta-skel-dash-hero">
        <Skeleton width={100} height={12} radius={4} />
        <Skeleton
          width={160}
          height={44}
          radius={8}
          style={{ marginTop: 18 }}
        />
        <Skeleton
          width={220}
          height={13}
          style={{ marginTop: 14 }}
        />
      </div>

      {/* Three compact stats */}
      <div className="ta-skel-dash-stats">
        {[0, 1, 2].map((i) => (
          <div key={i} className="ta-skel-dash-stat">
            <Skeleton width={90} height={11} radius={4} />
            <Skeleton
              width={70}
              height={26}
              radius={6}
              style={{ marginTop: 14 }}
            />
            <Skeleton
              width={140}
              height={11}
              style={{ marginTop: 10 }}
            />
          </div>
        ))}
      </div>

      {/* Two-column middle */}
      <div className="ta-skel-dash-grid">
        {[0, 1].map((i) => (
          <div key={i} className="ta-skel-dash-card">
            <Skeleton width={120} height={16} radius={4} />
            <Skeleton
              width="100%"
              height={13}
              style={{ marginTop: 22 }}
            />
            <Skeleton
              width="100%"
              height={13}
              style={{ marginTop: 10 }}
            />
            <Skeleton
              width="72%"
              height={13}
              style={{ marginTop: 10 }}
            />
          </div>
        ))}
      </div>

      {/* Table at the bottom */}
      <div className="ta-skel-dash-table">
        <Skeleton width={140} height={16} radius={4} />
        <div className="ta-skel-dash-table-rows">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="ta-skel-dash-row">
              <Skeleton width={90} height={13} radius={4} />
              <Skeleton width={140} height={13} radius={4} />
              <Skeleton width={100} height={13} radius={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}