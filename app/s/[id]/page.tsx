import { getSession } from "@/lib/db";
import { SavedReport } from "@/components/SavedReport";

export const dynamic = "force-dynamic";

export default async function SavedReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession(id);
  return <SavedReport report={session?.report ?? null} />;
}
