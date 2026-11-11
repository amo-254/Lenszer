import "./globals.css";
export const metadata = { title: "LENSZER", description: "Learner assessment and performance analysis" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
