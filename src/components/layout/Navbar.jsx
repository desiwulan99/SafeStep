import { ShieldCheck, User } from "lucide-react";
import "./Navbar.css";

export default function Navbar({ userName = "user" }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <span className="navbar__mark" aria-hidden="true">
          <ShieldCheck size={20} strokeWidth={2.4} />
        </span>
        <span className="navbar__title">SafeStep</span>
      </div>
      <button type="button" className="navbar__profile" aria-label="Profil pengguna">
        <User size={18} strokeWidth={2.2} />
      </button>
    </header>
  );
}