import "./style.css";
export const metadata={
 title:"The Second Brain",
 description:"Your multilingual personal daily brain",
 manifest:"/manifest.webmanifest",
 appleWebApp:{capable:true,title:"Second Brain",statusBarStyle:"default"},
 icons:{icon:"/icon.svg",apple:"/icon.svg"}
};
export const viewport={themeColor:"#111111",width:"device-width",initialScale:1};
export default function RootLayout({children}){return <html lang="en"><body>{children}</body></html>}