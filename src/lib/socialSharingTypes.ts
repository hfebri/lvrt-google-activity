export interface SocialSharingText {
  caption: string;
  hashtags: string[];
  callToAction: string;
}

/**
 * Format sharing text for easy copying
 */
export function formatSharingText(sharing: SocialSharingText): string {
  return `${sharing.caption}

${sharing.hashtags.join(" ")}

${sharing.callToAction}`;
}
