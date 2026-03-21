import "../index.css";
import "../App.css";

import Menu from "../components/Menu/Menu";

export const metadata = {
  title: "TECHNOPHILIA 3.0 | Event Portal",
  icons: {
    icon: "/help-svgrepo-com.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Menu />
        {children}
      </body>
    </html>
  );
}
