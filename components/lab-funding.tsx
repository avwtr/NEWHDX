import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditMembershipDialog } from "@/components/edit-membership-dialog"

export function LabFunding() {
  // Make sure this is defined in your component
  const isAdmin = true // Replace with your actual admin role check

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Lab Membership */}
      <Card className="col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">LAB M</CardTitle>
          <CardDescription>$25/month</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <ul className="space-y-1 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Access to member-only updates</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Name in acknowledgments</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Early access to publications</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Quarterly virtual lab meetings</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5" />
              <span>Access to raw datasets</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter className="pt-2">
          {isAdmin ? (
            <EditMembershipDialog
              initialPrice={25}
              initialBenefits={[
                { id: "1", text: "Access to member-only updates" },
                { id: "2", text: "Name in acknowledgments" },
                { id: "3", text: "Early access to publications" },
                { id: "4", text: "Quarterly virtual lab meetings" },
                { id: "5", text: "Access to raw datasets" },
              ]}
            />
          ) : (
            <Button className="w-full">BECOME A MEMBER</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
