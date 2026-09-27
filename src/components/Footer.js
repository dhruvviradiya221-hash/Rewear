import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">ReWear</p>
          <p className="footer-tagline">
            Swap your style. Earn rewards. Reduce waste.

          </p>
        </div>
        <div>
          <p className="footer-heading">Explore</p>
          <Link to="/browse">Browse catalog</Link>
          <Link to="/list">List an item</Link>
          <Link to="/signup">Create account</Link>
        </div>
        <div>
          <p className="footer-heading">Designed & Developed by</p>
          <p className="footer-stat">Jiya Yadav</p>
            <p className="footer-stat">Jiya Thakkar</p>
             <p className="footer-stat">Krishna Trivadi</p>
          <p className="footer-stat">Dhruv Viradiya</p>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ReWear</span>
        <span>Sustainable fashion, shared.</span>
      </div>
    </footer>
  );
}
