import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { currentUser } = useApp();
  return <Navigate to={currentUser ? "/dashboard" : "/login"} />;
}
