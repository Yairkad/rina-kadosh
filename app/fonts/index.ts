import { Rubik } from "next/font/google";
import localFont from "next/font/local";

/** Hebrew body font — Google Fonts (open license, no web-license purchase needed). Replaces mekomi, which had no web license. Used for everything except the display headings below (nav, product names, buttons, body copy). */
export const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-hebrew",
  display: "swap",
});

/**
 * Hebrew display/heading font — Bona Nova SC (Google Fonts, open license), self-hosted
 * because next/font/google doesn't bundle the SC variant, only the non-SC "Bona Nova".
 * Files are the Hebrew-subset woff2s served by Google Fonts' CSS API. Only 400/700 exist
 * upstream — used for section titles only, via Tailwind's `font-heading` class, NOT the
 * sitewide body font. Nav/product names/buttons stay on Rubik (--font-hebrew) above.
 */
export const bonaNovaSC = localFont({
  src: [
    { path: "./bona-nova-sc/BonaNovaSC-Regular.woff2", weight: "400", style: "normal" },
    { path: "./bona-nova-sc/BonaNovaSC-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-heading-he",
  display: "swap",
});

/** English script/display font for logo-style headings (confirmed by user: no web license required). */
export const happyBirthday = localFont({
  src: "./happyBirthday.ttf",
  variable: "--font-script",
  display: "swap",
});
