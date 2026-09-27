import "./styles.css";
export const metadata = { title:"Friends Included Finance", description:"Managerial Accounting Day 4 system" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
