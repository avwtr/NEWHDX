import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"

export default function MembershipPage() {
  return (
    <div className="container max-w-6xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">HDX Software Membership</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the membership tier that best fits your research needs and unlock powerful features to accelerate your
          scientific discoveries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Tier */}
        <Card className="flex flex-col border-muted">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl">Free</CardTitle>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $0
              <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
            </div>
            <CardDescription className="mt-4">
              Basic access to the HDX platform for individual researchers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              <FeatureItem included>Create up to 3 labs</FeatureItem>
              <FeatureItem included>Basic data storage (5GB)</FeatureItem>
              <FeatureItem included>Standard computation resources</FeatureItem>
              <FeatureItem included>Community support</FeatureItem>
              <FeatureItem>Advanced analytics</FeatureItem>
              <FeatureItem>Priority support</FeatureItem>
              <FeatureItem>Custom lab templates</FeatureItem>
              <FeatureItem>Collaboration tools</FeatureItem>
              <FeatureItem>API access</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Tier */}
        <Card className="flex flex-col border-primary relative">
          <div className="absolute top-0 right-0 left-0 h-1 bg-primary rounded-t-lg"></div>
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl">Pro</CardTitle>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $20
              <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
            </div>
            <CardDescription className="mt-4">
              Enhanced features for serious researchers and small teams
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              <FeatureItem included>Create up to 10 labs</FeatureItem>
              <FeatureItem included>Extended data storage (50GB)</FeatureItem>
              <FeatureItem included>Enhanced computation resources</FeatureItem>
              <FeatureItem included>Community support</FeatureItem>
              <FeatureItem included>Advanced analytics</FeatureItem>
              <FeatureItem included>Priority support</FeatureItem>
              <FeatureItem included>Custom lab templates</FeatureItem>
              <FeatureItem>Collaboration tools</FeatureItem>
              <FeatureItem>API access</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Upgrade to Pro</Button>
          </CardFooter>
        </Card>

        {/* Enterprise Tier */}
        <Card className="flex flex-col border-muted">
          <CardHeader className="pb-8">
            <CardTitle className="text-2xl">Enterprise</CardTitle>
            <div className="mt-4 flex items-baseline text-5xl font-extrabold">
              $99
              <span className="ml-1 text-xl font-medium text-muted-foreground">/month</span>
            </div>
            <CardDescription className="mt-4">Complete solution for research teams and organizations</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="space-y-3">
              <FeatureItem included>Unlimited labs</FeatureItem>
              <FeatureItem included>Premium data storage (500GB)</FeatureItem>
              <FeatureItem included>Priority computation resources</FeatureItem>
              <FeatureItem included>Community support</FeatureItem>
              <FeatureItem included>Advanced analytics</FeatureItem>
              <FeatureItem included>24/7 dedicated support</FeatureItem>
              <FeatureItem included>Custom lab templates</FeatureItem>
              <FeatureItem included>Advanced collaboration tools</FeatureItem>
              <FeatureItem included>Full API access</FeatureItem>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Upgrade to Enterprise
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 bg-secondary rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Membership Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard
            title="Enhanced Computation"
            description="Access to more powerful computation resources for complex simulations and data analysis."
          />
          <BenefitCard
            title="Priority Support"
            description="Get faster responses from our technical team when you need assistance."
          />
          <BenefitCard
            title="Advanced Analytics"
            description="Gain deeper insights into your research with advanced visualization and analysis tools."
          />
          <BenefitCard
            title="Collaboration Features"
            description="Work seamlessly with colleagues using our advanced collaboration tools."
          />
          <BenefitCard
            title="Custom Templates"
            description="Create and save custom lab templates to streamline your research workflow."
          />
          <BenefitCard
            title="API Access"
            description="Integrate HDX with your existing tools and workflows through our comprehensive API."
          />
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Questions About Membership?</h2>
        <p className="text-muted-foreground mb-6">
          Our team is ready to help you choose the right plan for your research needs.
        </p>
        <Button variant="outline" size="lg">
          Contact Support
        </Button>
      </div>
    </div>
  )
}

function FeatureItem({ children, included = false }) {
  return (
    <li className="flex items-start">
      <span className="flex-shrink-0 h-5 w-5 text-muted-foreground">
        {included ? <Check className="h-5 w-5 text-primary" /> : <X className="h-5 w-5" />}
      </span>
      <span className={`ml-3 text-sm ${included ? "text-foreground" : "text-muted-foreground"}`}>{children}</span>
    </li>
  )
}

function BenefitCard({ title, description }) {
  return (
    <div className="bg-background rounded-lg p-6 border border-border">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
