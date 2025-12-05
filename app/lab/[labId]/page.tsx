import { supabase } from "@/lib/supabase"
import LabView from "@/components/lab-view"
import PrivateLabAccessControl from "@/components/private-lab-access-control"

export default async function LabPage({ params }: { params: Promise<{ labId: string }> }) {
  // Await params before using
  const { labId } = await params;
  
  // Fetch lab data
  const { data: lab, error } = await supabase
    .from("labs")
    .select("*")
    .eq("labId", labId)
    .single();

  if (error || !lab) {
    // Show a 404 if not found
    return <div>Lab not found</div>
  }

  // Fetch categories
  const { data: categories } = await supabase
    .from("labCategories")
    .select("category")
    .eq("lab_id", labId);

  return (
    <PrivateLabAccessControl lab={lab} labId={labId}>
      <LabView lab={lab} categories={categories || []} />
    </PrivateLabAccessControl>
  )
}
