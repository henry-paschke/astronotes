import { Cinzel, Crimson_Text } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-cinzel",
});

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-crimson",
});

export const metadata = {
  title: "AstroNotes — Chart Your Learning",
  description:
    "Record lectures, build constellation mind maps, and forge stellar study tools. Navigate your academic cosmos with AstroNotes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cinzel.variable} ${crimson.variable}`}>
      <body>{children}</body>
    </html>
  );
}
