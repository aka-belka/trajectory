import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-copyright">
            <p>© {new Date().getFullYear()} ТраеКТОриЯ</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;