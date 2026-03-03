type SocialPlatform =
  | "facebook"
  | "instagram"
  | "youtube"
  | "spotify"
  | "x"
  | "tiktok"
  | "bluesky"
  | "website";

function detectPlatform(url: string): SocialPlatform {
  const lower = url.toLowerCase();
  if (lower.includes("facebook")) return "facebook";
  if (lower.includes("instagram")) return "instagram";
  if (lower.includes("youtube") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("spotify")) return "spotify";
  if (lower.includes("twitter") || lower.includes("x.com")) return "x";
  if (lower.includes("tiktok")) return "tiktok";
  if (lower.includes("bsky") || lower.includes("bluesky")) return "bluesky";
  return "website";
}

export function getSocialLinks(raw: string | null | undefined): Array<{ url: string; platform: SocialPlatform; label: string }> {
  if (!raw) return [];

  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((url) => {
      const platform = detectPlatform(url);
      const labels: Record<SocialPlatform, string> = {
        facebook: "Facebook",
        instagram: "Instagram",
        youtube: "YouTube",
        spotify: "Spotify",
        x: "X",
        tiktok: "TikTok",
        bluesky: "Bluesky",
        website: "Site web",
      };
      return { url, platform, label: labels[platform] };
    });
}

export default function SocialIcon({ platform, className = "h-5 w-5" }: { platform: SocialPlatform; className?: string }) {
  switch (platform) {
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <circle cx="12" cy="12" r="10" fillOpacity="0.1" />
          <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5H16V5.1c-.2 0-1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8v3h2.6v7h2.9Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" />
        </svg>
      );
    case "spotify":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.5a.8.8 0 0 1-1.1.3c-3-.9-6.8-1.1-11.1-.4a.8.8 0 1 1-.3-1.5c4.6-.8 8.7-.6 11.9.5.4.1.7.6.6 1.1Zm1.3-2.8a1 1 0 0 1-1.3.4c-3.4-1-8.5-1.3-12.5-.5a1 1 0 1 1-.4-1.9c4.5-.9 10-.6 13.5.6.5.2.8.8.7 1.4Zm.2-3a1.2 1.2 0 0 1-1.5.5c-4-1.2-10.5-1.3-14.2-.5a1.2 1.2 0 0 1-.5-2.3c4.2-.9 11.2-.8 15.4.6.6.2 1 1 .8 1.7Z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M18.2 3h2.9l-6.4 7.3L22 21h-5.8l-4.6-6-5.3 6H3.4l6.8-7.7L2 3h6l4.1 5.4L18.2 3Zm-1 16.3h1.6L7.1 4.6H5.4l11.8 14.7Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M19.5 5.22c-1.3-.9-2.2-2.4-2.3-4v-.4h-2.8c.1 1.4-.3 2.9-1.2 4-.5.6-1.1 1-1.7 1.3-.7.4-1.4.7-2.1.8v11c0 1.4-1.1 2.5-2.5 2.5-1.4 0-2.5-1.1-2.5-2.5 0-1.4 1.1-2.5 2.5-2.5.8 0 1.5.4 2 1v-8.7c1.1-.4 2.3-1 3.2-1.9 1.2-1.2 1.9-2.9 1.9-4.6v.3c0 1.1.3 2 .8 2.8.6.9 1.4 1.6 2.4 2v7.2c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5" />
        </svg>
      );
    case "bluesky":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor">
          <path d="M12 10.7c1.9-3.6 5-6 7.8-7.8.4-.2.8.2.7.6-.5 2.3-2.3 7.9-6.5 9.8 3 .4 5.7 2 7.2 4.8.2.4-.1.8-.5.8-2.8 0-6-.8-8.7-3-2.7 2.2-5.9 3-8.7 3-.4 0-.7-.4-.5-.8 1.5-2.8 4.2-4.4 7.2-4.8-4.2-1.9-6-7.5-6.5-9.8-.1-.4.3-.8.7-.6C7 4.7 10.1 7.1 12 10.7Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 14 21 3" />
          <path d="M15 3h6v6" />
          <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
        </svg>
      );
  }
}

