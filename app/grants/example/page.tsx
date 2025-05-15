import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { CalendarIcon, FileText } from "lucide-react"

export default function ExampleGrantPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <Link href="/grants" className="text-sm text-muted-foreground hover:underline mb-4 inline-block">
        ← Back to Grants
      </Link>

      <Card className="bg-[#0a0e29] text-white border-none">
        <CardHeader className="pb-2">
          <h1 className="text-3xl font-bold tracking-tight uppercase">Neuroscience Research Fellowship</h1>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-xl mb-6">
            <span className="font-medium">$ $35,000</span>
            <span className="mx-3">•</span>
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Deadline: 1/14/2024
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <span className="bg-[#1a1f3d] px-4 py-2 rounded-md text-sm font-medium uppercase">Neuroscience</span>
            <span className="bg-[#1a1f3d] px-4 py-2 rounded-md text-sm font-medium uppercase">Medicine</span>
            <span className="bg-[#1a1f3d] px-4 py-2 rounded-md text-sm font-medium uppercase">Biology</span>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-bold">Neuroscience Research Fellowship</h2>
            <p>Fellowship for early-career researchers in neuroscience, focusing on:</p>
            <ul className="space-y-1 ml-6">
              <li className="flex items-start">
                <span className="mr-2">-</span>
                <span>Neural circuit mapping</span>
              </li>
            </ul>
            <ul className="space-y-1 ml-6">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Brain-computer interfaces</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Neurological disorder treatments</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Cognitive function studies</span>
              </li>
            </ul>
          </div>

          <div className="text-lg font-bold uppercase mb-4">
            Eligibility * Postdoctoral Researchers within 5 years of PhD completion * Must be affiliated with a research
            institution * Interdisciplinary approaches are encouraged
          </div>

          <Button className="w-full py-6 text-lg bg-[#a8f0d3] text-black hover:bg-[#8ad0b3]">
            Apply for this Grant
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center gap-2">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl font-bold">Application Questions</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">Your application will need to answer the following questions:</p>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Question 1: Describe your neuroscience research background.</h3>
            <p className="text-sm text-muted-foreground">Short answer response required</p>
          </div>

          <div className="border-t pt-4">
            <Link href="/grants/create">
              <Button variant="outline">Create Your Own Grant</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
