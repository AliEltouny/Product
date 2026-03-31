export type DrinkVariant = {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string;
  accentColor: string;
  videoUrl: string;
};

export const DRINK_VARIANTS: DrinkVariant[] = [
  {
    id: 1,
    name: "CHERRY",
    subtitle: "Soda",
    description: "A modern take on a classic soda with a perfect blend of sweet and tart, full of nostalgic flavor.",
    themeColor: "#FF1F44",
    accentColor: "#9e132b",
    videoUrl: "https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/cherry.mp4"
  },
  {
    id: 2,
    name: "GRAPE",
    subtitle: "Soda",
    description: "A functional soda brand inspired by classic flavors but made with better ingredients and real fruit juices.",
    themeColor: "#A1C7ED",
    accentColor: "#7FA8D1",
    videoUrl: "https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/grapes.mp4"
  },
  {
    id: 3,
    name: "ORANGE",
    subtitle: "Soda",
    description: "Bright and refreshing citrus soda with natural lemon spark and crisp bubbles for that perfect zest.",
    themeColor: "#FF8C00",
    accentColor: "#cc7000",
    videoUrl: "https://braszseedmeagubxkkyp.supabase.co/storage/v1/object/public/Products/orange.mp4"
  }
];
