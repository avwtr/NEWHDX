import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, DollarSign, ArrowLeft, FileText } from "lucide-react"

interface GrantDetailPageProps {
  params: {
    id: string
  }
}

export default function GrantDetailPage({ params }: GrantDetailPageProps) {
  // In a real app, you would fetch this data from your database
  const grant = {
    id: params.id,
    name:
      params.id === "1"
        ? "Climate Research Initiative 2023"
        : params.id === "2"
          ? "Quantum Computing Innovation Grant"
          : "Neuroscience Research Fellowship",
    categories:
      params.id === "1"
        ? ["Environmental Science", "Earth Science"]
        : params.id === "2"
          ? ["Computer Science", "Physics"]
          : ["Neuroscience", "Medicine", "Biology"],
    amount: params.id === "1" ? 50000 : params.id === "2" ? 75000 : 35000,
    deadline: params.id === "1" ? "2023-12-31" : params.id === "2" ? "2023-11-15" : "2024-01-15",
    description:
      params.id === "1"
        ? `**Climate Research Initiative 2023**

This grant supports innovative research addressing climate change challenges. We're looking for projects that:

- Develop new technologies for carbon capture
- Create sustainable energy solutions
- Improve climate modeling and prediction
- Design adaptation strategies for vulnerable communities

## Eligibility
* Researchers affiliated with accredited institutions
* Early-career scientists are especially encouraged to apply
* International collaborations welcome

1. Applications must include preliminary data
2. Projects should have clear deliverables
3. Budget justification is required`
        : params.id === "2"
          ? `**Quantum Computing Innovation Grant**

Supporting breakthrough research in quantum computing applications. This grant focuses on:

- Quantum algorithm development
- Error correction techniques
- Quantum hardware innovations
- Practical applications in cryptography, optimization, and simulation

## Eligibility
* PhD-level researchers in computer science, physics, or related fields
* Both academic and industry researchers may apply
* Collaborative projects between institutions are encouraged`
          : `**Neuroscience Research Fellowship**

Fellowship for early-career researchers in neuroscience, focusing on:

- Neural circuit mapping
- Brain-computer interfaces
- Neurological disorder treatments
- Cognitive function studies

## Eligibility
* Postdoctoral researchers within 5 years of PhD completion
* Must be affiliated with a research institution
* Interdisciplinary approaches are encouraged`,
    questions:
      params.id === "1"
        ? [
            { id: "1", type: "shortAnswer", text: "Describe your research methodology and approach." },
            { id: "2", type: "shortAnswer", text: "How does your project address climate change challenges?" },
            {
              id: "3",
              type: "multipleChoice",
              text: "What is your primary research focus?",
              options: ["Mitigation", "Adaptation", "Both equally"],
            },
          ]
        : params.id === "2"
          ? [
              { id: "1", type: "shortAnswer", text: "Describe your experience with quantum computing research." },
              {
                id: "2",
                type: "shortAnswer",
                text: "What specific quantum computing challenge does your project address?",
              },
              {
                id: "3",
                type: "multipleChoice",
                text: "What quantum computing platform does your research target?",
                options: ["Superconducting qubits", "Trapped ions", "Photonic systems"],
              },
              { id: "4", type: "shortAnswer", text: "How will your research advance the field of quantum computing?" },
              {
                id: "5",
                type: "multipleChoice",
                text: "Is your approach primarily theoretical or experimental?",
                options: ["Theoretical", "Experimental", "Both equally"],
              },
            ]
          : [
              { id: "1", type: "shortAnswer", text: "Describe your neuroscience research background." },
              {
                id: "2",
                type: "multipleChoice",
                text: "What is your primary research area?",
                options: ["Clinical neuroscience", "Cognitive neuroscience", "Computational neuroscience"],
              },
              {
                id: "3",
                type: "shortAnswer",
                text: "How will your research contribute to understanding or treating neurological disorders?",
              },
              {
                id: "4",
                type: "multipleChoice",
                text: "What brain imaging techniques will you use?",
                options: ["fMRI", "EEG", "Other/Multiple"],
              },
            ],
  }

  // Function to render markdown-like formatting
  const renderDescription = (text: string) => {
    return text.split("\n\n").map((paragraph, i) => {
      // Handle headings
      if (paragraph.startsWith("## ")) {
        return (
          <h2 key={i} className="text-xl font-bold mt-4 mb-2">
            {paragraph.substring(3)}
          </h2>
        )
      }

      // Handle lists
      if (paragraph.includes("\n- ")) {
        const [listTitle, ...items] = paragraph.split("\n- ")
        return (
          <div key={i} className="my-3">
            <p className="mb-2">{listTitle}</p>
            <ul className="list-disc pl-5 space-y-1">
              {items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        )
      }

      // Handle numbered lists
      if (paragraph.includes("\n1. ")) {
        const [listTitle, ...items] = paragraph.split("\n")
        return (
          <div key={i} className="my-3">
            <p className="mb-2">{listTitle}</p>
            <ol className="list-decimal pl-5 space-y-1">
              {items.map((item, j) => (
                <li key={j}>{item.substring(3)}</li>
              ))}
            </ol>
          </div>
        )
      }

      // Handle bullet lists with *
      if (paragraph.includes("\n* ")) {
        const [listTitle, ...items] = paragraph.split("\n* ")
        return (
          <div key={i} className="my-3">
            <p className="mb-2">{listTitle}</p>
            <ul className="list-disc pl-5 space-y-1">
              {items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        )
      }

      // Handle bold and italic
      let formattedText = paragraph
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>")

      return <p key={i} className="my-3" dangerouslySetInnerHTML={{ __html: formattedText }} />
    })
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/grants">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Grants
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{grant.name}</CardTitle>
            <CardDescription>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span className="text-lg">${grant.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-1" />
                  <span>Deadline: {new Date(grant.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {grant.categories.map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">{renderDescription(grant.description)}</div>
          </CardContent>
          <CardFooter>
            <Link href={`/grants/${params.id}/apply`} className="w-full">
              <Button className="w-full">Apply for this Grant</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Application Questions
            </CardTitle>
            <CardDescription>Your application will need to answer the following questions:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {grant.questions.map((question, index) => (
                <div key={question.id} className="border-b pb-4 last:border-0">
                  <h3 className="font-medium mb-2">
                    Question {index + 1}: {question.text}
                  </h3>
                  {question.type === "multipleChoice" && question.options && (
                    <div className="ml-6 mt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">Options:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {question.options.map((option, i) => (
                          <li key={i}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {question.type === "shortAnswer" && (
                    <p className="text-sm text-muted-foreground ml-6 mt-2">Short answer response required</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
