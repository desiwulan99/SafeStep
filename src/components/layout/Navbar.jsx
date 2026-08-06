import { User } from "lucide-react";
import logoImg from "../../assets/images/logo.svg";
import "./Navbar.css";

export default function Navbar({ userName = "user" }) {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <img src={logoImg} alt="SafeStep Logo" className="navbar__logo" />
      </div>
      <button type="button" className="navbar__profile" aria-label="Profil pengguna">
        <User size={18} strokeWidth={2.2} />
      </button>
    </header>
  );
}