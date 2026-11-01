import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taas",
  description: "A simple, family-friendly score tracker for Marriage and Call Break.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <div className="site-frame">
          {children}
          <footer className="site-footer">
            <div className="site-footer-content">
              <span className="site-footer-copyright">
                © Rochak Khatiwada
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
