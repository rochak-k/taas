import Link from "next/link";

interface GameCardProps {
  href: string;
  title: string;
  description: string;
  symbol: string;
  color: "red" | "blue";
}

export function GameCard({
  href,
  title,
  description,
  symbol,
  color,
}: GameCardProps) {
  return (
    <Link
      href={href}
      className={`game-card game-card-${color}`}
      aria-label={`${title}. ${description}`}
    >
      <span className="game-card-symbol" aria-hidden="true">
        {symbol}
      </span>
      <span className="game-card-title">{title}</span>
      <span className="game-card-description">{description}</span>
      <span className="game-card-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
