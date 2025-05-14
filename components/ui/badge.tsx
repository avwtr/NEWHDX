import type * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Biology
        "molecular-biology": "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
        "cell-biology": "bg-blue-600/10 text-blue-600 border-blue-600/20 hover:bg-blue-600/20",
        genetics: "bg-blue-700/10 text-blue-700 border-blue-700/20 hover:bg-blue-700/20",
        genomics: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20",
        proteomics: "bg-indigo-600/10 text-indigo-600 border-indigo-600/20 hover:bg-indigo-600/20",
        bioinformatics: "bg-indigo-700/10 text-indigo-700 border-indigo-700/20 hover:bg-indigo-700/20",
        microbiology: "bg-violet-500/10 text-violet-500 border-violet-500/20 hover:bg-violet-500/20",
        virology: "bg-violet-600/10 text-violet-600 border-violet-600/20 hover:bg-violet-600/20",
        immunology: "bg-violet-700/10 text-violet-700 border-violet-700/20 hover:bg-violet-700/20",
        neuroscience: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
        "developmental-biology": "bg-purple-600/10 text-purple-600 border-purple-600/20 hover:bg-purple-600/20",
        "evolutionary-biology": "bg-purple-700/10 text-purple-700 border-purple-700/20 hover:bg-purple-700/20",
        ecology: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20 hover:bg-fuchsia-500/20",
        "marine-biology": "bg-fuchsia-600/10 text-fuchsia-600 border-fuchsia-600/20 hover:bg-fuchsia-600/20",
        botany: "bg-fuchsia-700/10 text-fuchsia-700 border-fuchsia-700/20 hover:bg-fuchsia-700/20",
        zoology: "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20",

        // Chemistry
        "organic-chemistry": "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20",
        "inorganic-chemistry": "bg-rose-600/10 text-rose-600 border-rose-600/20 hover:bg-rose-600/20",
        "physical-chemistry": "bg-rose-700/10 text-rose-700 border-rose-700/20 hover:bg-rose-700/20",
        "analytical-chemistry": "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
        biochemistry: "bg-red-600/10 text-red-600 border-red-600/20 hover:bg-red-600/20",
        "medicinal-chemistry": "bg-red-700/10 text-red-700 border-red-700/20 hover:bg-red-700/20",
        "polymer-chemistry": "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20",
        "materials-chemistry": "bg-orange-600/10 text-orange-600 border-orange-600/20 hover:bg-orange-600/20",
        "computational-chemistry": "bg-orange-700/10 text-orange-700 border-orange-700/20 hover:bg-orange-700/20",
        "environmental-chemistry": "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",

        // Physics
        "quantum-physics": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20",
        "particle-physics": "bg-yellow-600/10 text-yellow-600 border-yellow-600/20 hover:bg-yellow-600/20",
        "nuclear-physics": "bg-yellow-700/10 text-yellow-700 border-yellow-700/20 hover:bg-yellow-700/20",
        astrophysics: "bg-lime-500/10 text-lime-500 border-lime-500/20 hover:bg-lime-500/20",
        cosmology: "bg-lime-600/10 text-lime-600 border-lime-600/20 hover:bg-lime-600/20",
        "condensed-matter-physics": "bg-lime-700/10 text-lime-700 border-lime-700/20 hover:bg-lime-700/20",
        optics: "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
        thermodynamics: "bg-green-600/10 text-green-600 border-green-600/20 hover:bg-green-600/20",
        "fluid-dynamics": "bg-green-700/10 text-green-700 border-green-700/20 hover:bg-green-700/20",
        "plasma-physics": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
        biophysics: "bg-emerald-600/10 text-emerald-600 border-emerald-600/20 hover:bg-emerald-600/20",

        // Earth Sciences
        geology: "bg-teal-500/10 text-teal-500 border-teal-500/20 hover:bg-teal-500/20",
        geophysics: "bg-teal-600/10 text-teal-600 border-teal-600/20 hover:bg-teal-600/20",
        geochemistry: "bg-teal-700/10 text-teal-700 border-teal-700/20 hover:bg-teal-700/20",
        meteorology: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20 hover:bg-cyan-500/20",
        climatology: "bg-cyan-600/10 text-cyan-600 border-cyan-600/20 hover:bg-cyan-600/20",
        oceanography: "bg-cyan-700/10 text-cyan-700 border-cyan-700/20 hover:bg-cyan-700/20",
        hydrology: "bg-sky-500/10 text-sky-500 border-sky-500/20 hover:bg-sky-500/20",
        seismology: "bg-sky-600/10 text-sky-600 border-sky-600/20 hover:bg-sky-600/20",
        volcanology: "bg-sky-700/10 text-sky-700 border-sky-700/20 hover:bg-sky-700/20",
        paleontology: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",

        // Medicine & Health Sciences
        anatomy: "bg-blue-600/10 text-blue-600 border-blue-600/20 hover:bg-blue-600/20",
        physiology: "bg-blue-700/10 text-blue-700 border-blue-700/20 hover:bg-blue-700/20",
        pathology: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20",
        pharmacology: "bg-indigo-600/10 text-indigo-600 border-indigo-600/20 hover:bg-indigo-600/20",
        toxicology: "bg-indigo-700/10 text-indigo-700 border-indigo-700/20 hover:bg-indigo-700/20",
        epidemiology: "bg-violet-500/10 text-violet-500 border-violet-500/20 hover:bg-violet-500/20",
        "public-health": "bg-violet-600/10 text-violet-600 border-violet-600/20 hover:bg-violet-600/20",
        cardiology: "bg-violet-700/10 text-violet-700 border-violet-700/20 hover:bg-violet-700/20",
        neurology: "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
        oncology: "bg-purple-600/10 text-purple-600 border-purple-600/20 hover:bg-purple-600/20",
        pediatrics: "bg-purple-700/10 text-purple-700 border-purple-700/20 hover:bg-purple-700/20",
        geriatrics: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20 hover:bg-fuchsia-500/20",
        psychiatry: "bg-fuchsia-600/10 text-fuchsia-600 border-fuchsia-600/20 hover:bg-fuchsia-600/20",

        // Engineering & Technology
        "biomedical-engineering": "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20",
        "chemical-engineering": "bg-pink-600/10 text-pink-600 border-pink-600/20 hover:bg-pink-600/20",
        "civil-engineering": "bg-pink-700/10 text-pink-700 border-pink-700/20 hover:bg-pink-700/20",
        "electrical-engineering": "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20",
        "mechanical-engineering": "bg-rose-600/10 text-rose-600 border-rose-600/20 hover:bg-rose-600/20",
        "computer-science": "bg-rose-700/10 text-rose-700 border-rose-700/20 hover:bg-rose-700/20",
        "artificial-intelligence": "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
        "machine-learning": "bg-red-600/10 text-red-600 border-red-600/20 hover:bg-red-600/20",
        robotics: "bg-red-700/10 text-red-700 border-red-700/20 hover:bg-red-700/20",
        nanotechnology: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20",
        "materials-science": "bg-orange-600/10 text-orange-600 border-orange-600/20 hover:bg-orange-600/20",

        // Interdisciplinary Fields
        biotechnology: "bg-orange-700/10 text-orange-700 border-orange-700/20 hover:bg-orange-700/20",
        "systems-biology": "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20",
        "synthetic-biology": "bg-amber-600/10 text-amber-600 border-amber-600/20 hover:bg-amber-600/20",
        "computational-biology": "bg-amber-700/10 text-amber-700 border-amber-700/20 hover:bg-amber-700/20",
        "quantum-computing": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20",
        "renewable-energy": "bg-yellow-600/10 text-yellow-600 border-yellow-600/20 hover:bg-yellow-600/20",
        "sustainable-development": "bg-yellow-700/10 text-yellow-700 border-yellow-700/20 hover:bg-yellow-700/20",
        "climate-science": "bg-lime-500/10 text-lime-500 border-lime-500/20 hover:bg-lime-500/20",
        "data-science": "bg-lime-600/10 text-lime-600 border-lime-600/20 hover:bg-lime-600/20",
        "cognitive-science": "bg-lime-700/10 text-lime-700 border-lime-700/20 hover:bg-lime-700/20",
        astrobiology: "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
