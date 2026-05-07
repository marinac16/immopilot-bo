"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type User } from "@/lib/schemas/user.schema";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const crmLabels: Record<string, string> = {
  notion: "Notion",
  sheets: "Google Sheets",
};

export const userColumns: ColumnDef<User>[] = [
  {
    id: "name",
    header: "Nom",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium text-navy">
          {`${row.original.firstname ?? ""} ${row.original.lastname}`.trim() || "—"}
        </p>
        <p className="text-xs text-muted">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "crmType",
    header: "CRM",
    cell: ({ row }) =>
      row.original.crmType ? (
        <span className="text-sm text-navy">{crmLabels[row.original.crmType] ?? row.original.crmType}</span>
      ) : (
        <span className="text-muted text-sm">—</span>
      ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/immopilot-bo/users/${row.original.id}`}>Voir →</Link>
        </Button>
      </div>
    ),
  },
];
