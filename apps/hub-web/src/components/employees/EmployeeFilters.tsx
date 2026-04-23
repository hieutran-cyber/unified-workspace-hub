"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import { Select } from "@/components/shared/Select";

export function EmployeeFilters() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or ID..."
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
      <div className="flex items-center gap-2">
         <Select 
            options={[
              { value: "all", label: "All Groups" },
              { value: "office", label: "Office Division" },
              { value: "hotel", label: "Hotel / Field Operations" }
            ]}
            className="w-48"
            placeholder="Department Group"
            onChange={() => {}}
         />
         <Select 
            value={status}
            onChange={(val) => setStatus(val)}
            options={["All Status", "Active", "On Leave", "Resigned"]}
            className="w-48"
         />
      </div>
    </div>
  );
}
