// TODO: Redirect /profile to /profile/[username] for the logged-in user in the future.

"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserLabsSection } from "@/components/profile/user-labs-section"
import { UserActivityLogs } from "@/components/profile/user-activity-logs"
import { UserCollections } from "@/components/profile/user-collections"
import { UserPublications } from "@/components/profile/user-publications"
import { UserProfileSettings } from "@/components/profile/user-profile-settings"
import { Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useParams, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import Image from "next/image"

// Add a type for the profile object
interface Profile {
  user_id: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  research_interests?: string[];
  contributions_count?: number;
  labs_count?: number;
  following_count?: number;
  profilePic?: string;
}

// Add scienceCategoryColors and helpers from explore/page.tsx
const scienceCategoryColors: Record<string, { bg: string; text: string }> = {
  neuroscience: { bg: "bg-[#9D4EDD]", text: "text-white" },
  ai: { bg: "bg-[#3A86FF]", text: "text-white" },
  biology: { bg: "bg-[#38B000]", text: "text-white" },
  chemistry: { bg: "bg-[#FF5400]", text: "text-white" },
  physics: { bg: "bg-[#FFD60A]", text: "text-black" },
  medicine: { bg: "bg-[#FF0054]", text: "text-white" },
  psychology: { bg: "bg-[#FB5607]", text: "text-white" },
  engineering: { bg: "bg-[#4361EE]", text: "text-white" },
  mathematics: { bg: "bg-[#7209B7]", text: "text-white" },
  environmental: { bg: "bg-[#2DC653]", text: "text-white" },
  astronomy: { bg: "bg-[#3F37C9]", text: "text-white" },
  geology: { bg: "bg-[#AA6C25]", text: "text-white" },
  "brain-mapping": { bg: "bg-[#9D4EDD]", text: "text-white" },
  "cognitive-science": { bg: "bg-[#FB5607]", text: "text-white" },
  "quantum-mechanics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "particle-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  genomics: { bg: "bg-[#38B000]", text: "text-white" },
  bioinformatics: { bg: "bg-[#38B000]", text: "text-white" },
  ethics: { bg: "bg-[#FB5607]", text: "text-white" },
  "computer-science": { bg: "bg-[#3A86FF]", text: "text-white" },
  "climate-science": { bg: "bg-[#2DC653]", text: "text-white" },
  "data-analysis": { bg: "bg-[#7209B7]", text: "text-white" },
  biochemistry: { bg: "bg-[#FF5400]", text: "text-white" },
  astrophysics: { bg: "bg-[#3F37C9]", text: "text-white" },
  cosmology: { bg: "bg-[#3F37C9]", text: "text-white" },
  "clinical-research": { bg: "bg-[#FF0054]", text: "text-white" },
  biotechnology: { bg: "bg-[#38B000]", text: "text-white" },
  "medical-imaging": { bg: "bg-[#FF0054]", text: "text-white" },
  meteorology: { bg: "bg-[#2DC653]", text: "text-white" },
  "machine-learning": { bg: "bg-[#3A86FF]", text: "text-white" },
  optimization: { bg: "bg-[#7209B7]", text: "text-white" },
  "data-processing": { bg: "bg-[#7209B7]", text: "text-white" },
  "data-visualization": { bg: "bg-[#7209B7]", text: "text-white" },
  methodology: { bg: "bg-[#6C757D]", text: "text-white" },
  computing: { bg: "bg-[#3A86FF]", text: "text-white" },
  evaluation: { bg: "bg-[#6C757D]", text: "text-white" },
  innovation: { bg: "bg-[#6C757D]", text: "text-white" },
  "research-funding": { bg: "bg-[#6C757D]", text: "text-white" },
  governance: { bg: "bg-[#6C757D]", text: "text-white" },
  mitigation: { bg: "bg-[#2DC653]", text: "text-white" },
  "diversity-studies": { bg: "bg-[#6C757D]", text: "text-white" },
  "public-perception": { bg: "bg-[#FB5607]", text: "text-white" },
  "citizen-science": { bg: "bg-[#6C757D]", text: "text-white" },
  "bias-studies": { bg: "bg-[#3A86FF]", text: "text-white" },
  "cell-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "genetics": { bg: "bg-[#38B000]", text: "text-white" },
  "proteomics": { bg: "bg-[#38B000]", text: "text-white" },
  "microbiology": { bg: "bg-[#38B000]", text: "text-white" },
  "virology": { bg: "bg-[#38B000]", text: "text-white" },
  "immunology": { bg: "bg-[#38B000]", text: "text-white" },
  "developmental-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "evolutionary-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "ecology": { bg: "bg-[#2DC653]", text: "text-white" },
  "marine-biology": { bg: "bg-[#2DC653]", text: "text-white" },
  "botany": { bg: "bg-[#2DC653]", text: "text-white" },
  "zoology": { bg: "bg-[#2DC653]", text: "text-white" },
  "organic-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "inorganic-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "physical-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "analytical-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "medicinal-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "polymer-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "materials-chemistry": { bg: "bg-[#FF5400]", text: "text-white" },
  "computational-chemistry": { bg: "bg-[#3A86FF]", text: "text-white" },
  "environmental-chemistry": { bg: "bg-[#2DC653]", text: "text-white" },
  "quantum-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "nuclear-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "condensed-matter-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  optics: { bg: "bg-[#FFD60A]", text: "text-black" },
  thermodynamics: { bg: "bg-[#FFD60A]", text: "text-black" },
  "fluid-dynamics": { bg: "bg-[#FFD60A]", text: "text-black" },
  "plasma-physics": { bg: "bg-[#FFD60A]", text: "text-black" },
  biophysics: { bg: "bg-[#38B000]", text: "text-white" },
  geophysics: { bg: "bg-[#AA6C25]", text: "text-white" },
  geochemistry: { bg: "bg-[#AA6C25]", text: "text-white" },
  climatology: { bg: "bg-[#2DC653]", text: "text-white" },
  oceanography: { bg: "bg-[#2DC653]", text: "text-white" },
  hydrology: { bg: "bg-[#2DC653]", text: "text-white" },
  seismology: { bg: "bg-[#AA6C25]", text: "text-white" },
  volcanology: { bg: "bg-[#AA6C25]", text: "text-white" },
  paleontology: { bg: "bg-[#AA6C25]", text: "text-white" },
  anatomy: { bg: "bg-[#FF0054]", text: "text-white" },
  physiology: { bg: "bg-[#FF0054]", text: "text-white" },
  pathology: { bg: "bg-[#FF0054]", text: "text-white" },
  pharmacology: { bg: "bg-[#FF0054]", text: "text-white" },
  toxicology: { bg: "bg-[#FF0054]", text: "text-white" },
  epidemiology: { bg: "bg-[#FF0054]", text: "text-white" },
  "public-health": { bg: "bg-[#FF0054]", text: "text-white" },
  cardiology: { bg: "bg-[#FF0054]", text: "text-white" },
  neurology: { bg: "bg-[#9D4EDD]", text: "text-white" },
  oncology: { bg: "bg-[#FF0054]", text: "text-white" },
  pediatrics: { bg: "bg-[#FF0054]", text: "text-white" },
  geriatrics: { bg: "bg-[#FF0054]", text: "text-white" },
  psychiatry: { bg: "bg-[#FB5607]", text: "text-white" },
  "biomedical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "chemical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "civil-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "electrical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "mechanical-engineering": { bg: "bg-[#4361EE]", text: "text-white" },
  "artificial-intelligence": { bg: "bg-[#3A86FF]", text: "text-white" },
  robotics: { bg: "bg-[#3A86FF]", text: "text-white" },
  nanotechnology: { bg: "bg-[#3A86FF]", text: "text-white" },
  "materials-science": { bg: "bg-[#FF5400]", text: "text-white" },
  "systems-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "synthetic-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "computational-biology": { bg: "bg-[#38B000]", text: "text-white" },
  "quantum-computing": { bg: "bg-[#FFD60A]", text: "text-black" },
  "renewable-energy": { bg: "bg-[#2DC653]", text: "text-white" },
  "sustainable-development": { bg: "bg-[#2DC653]", text: "text-white" },
  "data-science": { bg: "bg-[#7209B7]", text: "text-white" },
  astrobiology: { bg: "bg-[#3F37C9]", text: "text-white" },
};

const getCategoryBadgeColors = (category: string) => {
  return scienceCategoryColors[category] || { bg: "bg-[#6C757D]", text: "text-white" };
};

const getCategoryLabel = (category: string) => category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');

export default function ProfilePage() {
  const { user: loggedInUser, isLoading } = useAuth()
  const params = useParams();
  const username = params?.username as string;
  const searchParams = useSearchParams();
  const defaultTab = searchParams?.get("tab") || "labs";

  // New: state for profile data
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [labsCount, setLabsCount] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [orgsLoading, setOrgsLoading] = useState(true)

  // Fetch profile from Supabase by username
  const fetchProfile = () => {
    if (!username) return;
    setProfileLoading(true)
    setProfileError(null)
    supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()
      .then(({ data, error }) => {
        if (error) setProfileError(error.message)
        setProfile(data as Profile)
        setProfileLoading(false)
      })
  }

  // Fetch organizations
  const fetchOrganizations = async (userId: string) => {
    if (!userId) return;
    setOrgsLoading(true);
    try {
      // Get org memberships
      const { data: memberRows } = await supabase
        .from('orgMembers')
        .select('org_id')
        .eq('user_id', userId);

      if (memberRows && memberRows.length > 0) {
        const orgIds = [...new Set(memberRows.map(m => m.org_id).filter(Boolean))];
        let orgMap: Record<string, any> = {};
        
        if (orgIds.length > 0) {
          const { data: orgs } = await supabase
            .from('organizations')
            .select('org_id, org_name, profilePic, slug')
            .in('org_id', orgIds);
            
          if (orgs) {
            orgs.forEach(o => { orgMap[o.org_id] = o });
            // Convert map to array and sort by name
            const sortedOrgs = Object.values(orgMap).sort((a, b) => a.org_name.localeCompare(b.org_name));
            setOrganizations(sortedOrgs);
          } else {
            setOrganizations([]);
          }
        } else {
          setOrganizations([]);
        }
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    } finally {
      setOrgsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  useEffect(() => {
    if (profile?.user_id) {
      fetchOrganizations(profile.user_id);
    }
  }, [profile?.user_id]);

  if (isLoading || profileLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">Loading profile...</div>
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-red-500">{profileError}</div>
      </div>
    )
  }

  if (!profile) return null;

  // Prepare user data from profile
  const userData = profile && {
    id: profile.user_id,
    name: (profile.username ?? "user"),
    username: (profile.username ?? "user"),
    avatar: profile.profilePic || "/placeholder.svg?height=100&width=100",
    bio: profile.bio || "",
    joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "",
    interests: profile.research_interests || [],
    stats: {
      contributions: profile.contributions_count || 0,
      labs: profile.labs_count || 0,
      following: profile.following_count || 0,
    },
    research_interests: profile.research_interests || [],
  }

  const isOwnProfile = loggedInUser && userData && loggedInUser.id === userData.id;

  if (showSettings && isOwnProfile) {
    const handleSettingsClose = () => {
      setShowSettings(false)
      fetchProfile()
    }
    return <UserProfileSettings user={userData} onClose={handleSettingsClose} defaultTab={defaultTab} />
  }

  return (
    <div className="container py-8 max-w-6xl">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* User Profile Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="relative pb-0">
              {isOwnProfile && (
                <div className="absolute top-4 right-4">
                  <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)} aria-label="Profile settings">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex flex-col items-center">
                <img
                  src={userData.avatar}
                  alt={userData.username}
                  style={{ width: 96, height: 96, borderRadius: '50%', marginBottom: 16 }}
                />
                <CardTitle className="text-center">@{userData.username}</CardTitle>
                {userData.bio && (
                  <div className="text-sm text-muted-foreground text-center mt-2 mb-2">{userData.bio}</div>
                )}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {userData.interests.map((interest, index) => {
                    const variant = interest.toLowerCase().replace(/\s+/g, '-');
                    const colors = getCategoryBadgeColors(variant);
                    return (
                      <Badge
                        key={index}
                        variant={variant as any}
                        className="mr-2 mb-2 text-xs"
                      >
                        {getCategoryLabel(interest)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Organizations Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              {orgsLoading ? (
                <div className="text-center py-4">Loading organizations...</div>
              ) : organizations.length > 0 ? (
                <div className="space-y-2">
                  {organizations.map((org) => (
                    <Link
                      key={org.org_id}
                      href={`/orgs/${org.slug}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="relative h-8 w-8 rounded-full overflow-hidden border border-secondary">
                        <Image
                          src={org.profilePic || "/placeholder.svg"}
                          alt={org.org_name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium truncate">{org.org_name}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  No organizations yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2">
          <Tabs defaultValue="labs" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="labs">My Labs</TabsTrigger>
              <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="collections">Saved Stuff</TabsTrigger>
            </TabsList>

            <TabsContent value="labs" className="mt-6">
              {userData && <UserLabsSection userId={userData.id} onLabsCountChange={setLabsCount} />}
            </TabsContent>

            <TabsContent value="publications" className="mt-6">
              <UserPublications />
            </TabsContent>

            <TabsContent value="activity" className="mt-6">
              <UserActivityLogs userId={userData.id} userName={userData.username} userProfilePic={userData.avatar} />
            </TabsContent>

            <TabsContent value="collections" className="mt-6">
              <UserCollections />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 