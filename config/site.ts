export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "Virtual Lab",
  description: "A platform for virtual scientific collaboration and research",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Lab",
      href: "/lab",
    },
    {
      title: "Contributions",
      href: "/contributions",
    },
    {
      title: "Funding",
      href: "/funding",
    },
    {
      title: "Network",
      href: "/network",
    },
  ],
  links: {
    github: "https://github.com",
    docs: "/docs",
  },
}
