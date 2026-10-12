import { FullPageLoader } from "@/components/loading";

export default function Loading() {
  return (
    <div style={{ background: "#F4F6FB" }} className="min-h-screen">
      <FullPageLoader status="Opening your workspace" />
    </div>
  );
}
