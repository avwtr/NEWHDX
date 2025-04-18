import { notFound } from "next/navigation"
import LabView from "@/components/lab-view"
import { RoleSwitcher } from "@/components/role-switcher"

export default function LabPage({ params }: { params: { slug: string } }) {
  // Validate role parameter - we'll keep the validation but use the slug parameter
  if (!["admin", "user", "guest"].includes(params.slug)) {
    notFound()
  }

  return (
    <div>
      <LabView />
      <RoleSwitcher />
    </div>
  )
}
