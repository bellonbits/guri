import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CompareWidget from './CompareWidget';

const PublicLayout = () => {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <CompareWidget />
            <Footer />
        </>
    );
};

export default PublicLayout;
