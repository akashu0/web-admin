import { Spinner } from "@/components/ui/spinner";

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <Spinner className="size-6 text-primary" />
    </div>
  );
}
