"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type User } from "@/lib/schemas/user.schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: "firstname",
    header: "Prénom",
  },
  {
    accessorKey: "lastname",
    header: "Nom",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "ACTIVE" ? "success" : "default"}>
        {row.original.status ?? "—"}
      </Badge>
    ),
  },
  {
    accessorKey: "crmType",
    header: "CRM",
    cell: ({ row }) => row.original.crmType ?? <span className="text-muted">—</span>,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/immopilot-bo/users/${row.original.id}`}>Voir</Link>
      </Button>
    ),
  },
];
