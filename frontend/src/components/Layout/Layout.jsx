import './Layout.css';
import Header from '../Header/Header';
import ScrollToTopButton from '../ScrollToTopButton/ScrollToTopButton';

const Layout = ({ children }) => {
  return (
    <div className="Layout-container">
      <Header />
      <div className="Layout-content">{children}</div>
    
      <ScrollToTopButton/>
    </div>
  );
};

export default Layout;