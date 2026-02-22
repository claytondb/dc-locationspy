import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Location Images - Aggregate photos from any location",
  description: "Search and aggregate images of any location from Google, Bing, Flickr, Unsplash, Zillow, Redfin, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
