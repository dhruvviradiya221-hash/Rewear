import { Link } from 'react-router-dom';

const TEAM = ['Jiya Yadav', 'Jiya Thakkar', 'Krishna Trivadi', 'Dhruv Viradiya'];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-glow" aria-hidden="true" />
      <div className="container footer-grid">
        <div className="footer-about">
          <p className="footer-brand">ReWear</p>
          <p className="footer-tagline">
            A premium community wardrobe — swap garments, earn points, and keep fashion in motion
            without the waste.
          </p>
        </div>
        <div>
          <p className="footer-heading">Explore</p>
          <Link to="/browse">Browse catalog</Link>
          <Link to="/list">List an item</Link>
          <Link to="/signup">Create account</Link>
          <Link to="/login">Sign in</Link>
        </div>
        <div>
          <p className="footer-heading">Crafted by</p>
          <ul className="footer-team">
            {TEAM.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ReWear. All rights reserved.</span>
        <span className="footer-motto">Sustainable fashion, shared with intention.</span>
      </div>
    </footer>
  );
}
