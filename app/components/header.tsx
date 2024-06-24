import ModeToggle from "./buttons/mode-toggle";

export default function Header() {
  return (
    <nav
      role="navigation"
      className="flex w-full justify-between mb-10"
      aria-label="Primary"
    >
      <h3 className="text-xl font-bold">Linkin Remix</h3>
      <ModeToggle />
      {/* <ul>
        <li>
          <a href="/">Home</a>
        </li>
      </ul> */}
    </nav>
  );
}
