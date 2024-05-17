import React from 'react';
import styles from "./Header.module.css"
import HeaderImg from "../../Asset/images/logo 1.png"
const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.header_title}>
                <img
                    className={styles.headerimg}
                    src={HeaderImg}
                />
           </div>
        </header>
    );
};

export default Header;
