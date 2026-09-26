"use client";
import { Skeleton } from "@/components/ui/Skeleton";
import "./AccountsSkeleton.css";

export function AccountsSkeleton() {
  return (
    <div className="ta-skel-accounts" aria-busy="true" aria-live="polite">
      {/* Toolbar: search + count */}
      <div className="ta-skel-accounts-toolbar">
        <Skeleton width={320} height={42} radius={12} />
        <Skeleton width={140} height={16} radius={4} />
      </div>

      {/* Table */}
      <div className="ta-skel-accounts-table">
        {/* Header row */}
        <div className="ta-skel-accounts-head">
          <Skeleton width={100} height={11} radius={3} />
          <Skeleton width={60} height={11} radius={3} />
          <Skeleton width={80} height={11} radius={3} />
          <Skeleton width={80} height={11} radius={3} />
          <Skeleton width={100} height={11} radius={3} />
        </div>

        {/* Rows */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="ta-skel-accounts-row">
            <div className="ta-skel-accounts-cell-user">
              <Skeleton circle height={32} />
              <div className="ta-skel-accounts-cell-user-copy">
                <Skeleton width={180} height={13} radius={4} />
                <Skeleton
                  width={120}
                  height={11}
                  radius={4}
                  style={{ marginTop: 6 }}
                />
              </div>
            </div>
            <Skeleton width={60} height={22} radius={999} />
            <Skeleton width={70} height={22} radius={999} />
            <Skeleton width={120} height={13} radius={4} />
            <div className="ta-skel-accounts-cell-actions">
              <Skeleton width={60} height={30} radius={8} />
              <Skeleton width={70} height={30} radius={8} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}