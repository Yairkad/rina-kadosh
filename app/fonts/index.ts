import { Rubik } from "next/font/google";
import localFont from "next/font/local";

/** Hebrew body/heading font — Google Fonts (open license, no web-license purchase needed). Replaces mekomi, which had no web license. */
export const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-hebrew",
  display: "swap",
});

/** English script/display font for logo-style headings (confirmed by user: no web license required). */
export const happyBirthday = localFont({
  src: "./happyBirthday.ttf",
  variable: "--font-script",
  display: "swap",
});
