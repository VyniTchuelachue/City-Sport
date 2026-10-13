import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import SelectionDrawer from './components/SelectionDrawer.jsx';
import { LanguageProvider, useLang } from './context/LanguageContext.jsx';
import { SelectionProvider } from './context/SelectionContext.jsx';
import { StoresProvider } from './context/StoresContext.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Product from './pages/Product.jsx';
import Shop from './pages/Shop.jsx';
import Stores from './pages/Stores.jsx';

// A new page starts at the top. Filter changes keep the same path, and anchor
// links are handled by the page they point to, so both are left alone.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Layout() {
  const { t } = useLang();
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
      >
        {t('skip')}
      </a>
      <Header />
      <main id="contenu" className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/boutique" element={<Shop />} />
          <Route path="/produit/:slug" element={<Product />} />
          <Route path="/magasins" element={<Stores />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <SelectionDrawer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <StoresProvider>
          <SelectionProvider>
            <ScrollToTop />
            <Layout />
          </SelectionProvider>
        </StoresProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
