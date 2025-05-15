import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, PlusCircle, DollarSign, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function GrantsPage() {
  // Mock data - in a real app, this would come from your database
  const grants = [
    {
      id: "1",
      name: "Neuroscience Research Fellowship",
      categories: ["Neuroscience", "Medicine", "Biology"],
      amount: 35000,
      deadline: "2024-01-14",
      description: "Fellowship for early-career researchers in neuroscience.",
      questionCount: 4,
    },
    {
      id: "2",
      name: "Quantum Computing Innovation Grant",
      categories: ["Computer Science", "Physics"],
      amount: 75000,
      deadline: "2023-11-15",
      description: "Supporting breakthrough research in quantum computing applications.",
      questionCount: 5,
    },
    {
      id: "3",
      name: "Climate Research Initiative 2023",
      categories: ["Environmental Science", "Earth Science"],
      amount: 50000,
      deadline: "2023-12-31",
      description: "Research funding for climate change mitigation strategies.",
      questionCount: 3,
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Research Grants</h1>
          <p className="text-muted-foreground mt-1">Discover and apply for research funding opportunities</p>
        </div>
        <Link href="/grants/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Grant
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grants.map((grant) => (
          <Card key={grant.id} className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="line-clamp-2">{grant.name}</CardTitle>
              <CardDescription>
                <div className="flex items-center mt-1">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>${grant.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center mt-1">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>Deadline: {new Date(grant.deadline).toLocaleDateString()}</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{grant.description}</p>
              <div className="flex flex-wrap gap-2">
                {grant.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="mt-auto pt-4">
              <Link href="/grants/create/apply" className="w-full">
                <Button variant="outline" className="w-full">
                  <span>View & Apply</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
