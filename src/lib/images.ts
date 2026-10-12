/**
 * Photography: Unsplash (https://unsplash.com/license), hotlinked from images.unsplash.com as Unsplash asks,
 * sized with URL parameters. People in the photos are not the fictional coaches/clients named in the demo.
 */
const u = (id: string, w = 1200, h?: number) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=72&w=${w}${h ? `&h=${h}` : ""}`;

export const PHOTO_IDS = {
  coachAarav: "1738523686578-f18348c8292b",
  coachingSession: "1738523687459-963f3fb56522",
  dumbbellPress: "1745329532593-53a9ec306787",
  trainerTablet: "1758875570137-8691b7c55033",
  deadliftCoaching: "1758875569256-f37c438cac65",
  barbellBack: "1541534741688-6078c6bfb5c5",
  yogaOutdoor: "1758797316894-c25b94e8426a",
  yogaPortrait: "1686386271712-183bcc0e256f",
  stretch: "1758599879024-7379d769f664",
} as const;

export const img = (key: keyof typeof PHOTO_IDS, w = 1200, h?: number) => u(PHOTO_IDS[key], w, h);

export const IMAGES = {
  coachAarav: img("coachAarav", 1400),
  coachAaravThumb: `${img("coachAarav", 120, 120)}&crop=faces`,
  coachMeera: img("yogaOutdoor", 1400),
};
