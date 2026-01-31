import Link from "next/link";

interface LinkItem {
  label: string;
  href: string;
}

interface FooterColumnProps {
  title: string;
  links: LinkItem[];
}

export function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-foreground font-semibold mb-6">{title}</h3>
      <ul className="space-y-4 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
