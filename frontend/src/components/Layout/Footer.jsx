import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div>
                <strong>Block Paradise</strong>
                <p>Premium building blocks for every creator.</p>
            </div>
            <div className={styles.links}>
                <a href="#">Instagram</a>
                <a href="#">Facebook</a>
                <a href="#">Twitter</a>
            </div>
            <p className={styles.copy}>© {new Date().getFullYear()} Block Paradise. All rights reserved.</p>
        </footer>
    )
}
