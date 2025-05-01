import { supabase } from "@/lib/supabase"
import LabView from "@/components/lab-view"

export default async function LabPage({ params }: { params: { labId: string } }) {
  // Fetch lab data
  const { data: lab, error } = await supabase
    .from("labs")
    .select("*")
    .eq("labId", params.labId)
    .single();

  // Fetch categories
  const { data: categories } = await supabase
    .from("labCategories")
    .select("category")
    .eq("lab_id", params.labId);

  if (error || !lab) {
    // Show a 404 if not found
    return <div>Lab not found</div>
  }

  return (
    <LabView lab={lab} categories={categories || []} />
  )
}
