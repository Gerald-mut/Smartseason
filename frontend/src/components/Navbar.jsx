import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>🌱 SmartSeason</span>
      <div className={styles.right}>
        <span className={styles.name}>{user?.name}</span>
        <span className={styles.role}>{user?.role}</span>
        <button className={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
