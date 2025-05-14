"use client"

import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { UserProfile } from "@/lib/types"

// Example organization data (in a real app, this would come from your database)
const exampleOrg = {
  id: "1",
  name: "Quantum Research Institute",
  profileImage: "/placeholder.svg?key=0x6bq",
  description:
    "A leading organization dedicated to advancing quantum physics research and its applications in computing, cryptography, and materials science. We collaborate with researchers worldwide to push the boundaries of quantum mechanics.",
  tags: ["Physics", "Computer Science", "Mathematics"],
  members: [
    {
      id: "1",
      name: "Dr. Emma Chen",
      role: "admin",
      avatar: "/placeholder.svg?key=86co6",
      initials: "EC",
    },
    {
      id: "2",
      name: "Prof. James Wilson",
      role: "user",
      avatar: "/wise-professor.png",
      initials: "JW",
    },
    {
      id: "3",
      name: "Dr. Sophia Rodriguez",
      role: "user",
      avatar: "/placeholder.svg?key=8jxt3",
      initials: "SR",
    },
  ] as UserProfile[],
}

export default function OrganizationProfile() {
  const searchParams = useSearchParams()
  const nameFromParams = searchParams.get("name")

  // Use the name from URL params or fall back to example data
  const org = nameFromParams ? { ...exampleOrg, name: nameFromParams } : exampleOrg

  return (
    <div className="container max-w-3xl py-10 flex flex-col items-center">
      <div className="w-40 h-40 relative mb-6">
        <Image
          src={org.profileImage || "/placeholder.svg"}
          alt={org.name}
          fill
          className="rounded-full object-cover border-2 border-border"
        />
      </div>

      <h1 className="text-3xl font-bold mb-2 text-center">{org.name}</h1>

      <div className="flex justify-center gap-2 mb-6">
        {org.tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <Card className="w-full mb-8">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground leading-relaxed">{org.description}</p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4 text-center">Members</h2>
      <div className="w-full space-y-3">
        {org.members.map((member) => (
          <Card key={member.id} className="w-full">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src={member.avatar || "/placeholder.svg?height=50&width=50&query=user"}
                  alt={member.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {member.role === "admin" ? "Administrator" : "Member"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
