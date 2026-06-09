import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'
import ScrollToTop from './ScrollToTop'
import styles from './Layout.module.css'

export default function Layout() {
    return (
        <>
            <ScrollToTop />
            <Navbar />
            <main className={styles.content}>
                <Outlet />
            </main>
            <Footer />
        </>
    )
}
