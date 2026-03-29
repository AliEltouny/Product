export type DrinkVariant = {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  accentColor: string;
  frameCount: number;
  basePath: string;
};

export const DRINK_VARIANTS: DrinkVariant[] = [
  {
    id: 1,
    name: "CHERRY",
    subtitle: "Soda",
    description: "A modern take on a classic soda with a perfect blend of sweet and tart, full of nostalgic flavor.",
    themeColor: "#FF1F44",
    accentColor: "#9e132b",
    frameCount: 192,
    basePath: "https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/Cherry/frame_"
  },
  {
    id: 2,
    name: "GRAPE",
    subtitle: "Soda",
    description: "A functional soda brand inspired by classic flavors but made with better ingredients and real fruit juices.",
    themeColor: "#5226D9",
    accentColor: "#3a1a9e",
    frameCount: 192,
    basePath: "https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/Grapes/frame_"
  },
  {
    id: 3,
    name: "ORANGE",
    subtitle: "Soda",
    description: "Bright and refreshing citrus soda with natural lemon spark and crisp bubbles for that perfect zest.",
    themeColor: "#FF8C00",
    accentColor: "#cc7000",
    frameCount: 192,
    basePath: "https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/Orange/frame_"
  }
];
