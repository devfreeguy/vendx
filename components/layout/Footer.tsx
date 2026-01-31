import footerLinks from "@/data/footer-links.json";
import { FooterColumn } from "./footer/FooterColumn";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {footerLinks.map((section) => (
            <FooterColumn
              key={section.title}
              title={section.title}
              links={section.links}
            />
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} VendX Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              System Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
