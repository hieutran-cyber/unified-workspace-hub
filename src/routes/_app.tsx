import { createFileRoute } from "@tanstack/react-router";
import { WorkspaceLayout } from "@/components/WorkspaceLayout";

export const Route = createFileRoute("/_app")({
  component: WorkspaceLayout,
});
