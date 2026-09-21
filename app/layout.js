import "./style.css";
export const metadata={title:"The Second Brain",description:"Your multilingual personal daily brain"};
export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}