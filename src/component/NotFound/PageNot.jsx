import React from 'react';
import styles from "./PageNot.module.css"
const NotFound = () => {
    return (
        <div className={styles.error__container}>
            <div className={styles.error__code}>
                <p>4</p>
                <p>0</p>
                <p>4</p>
            </div>
            <div className={styles.error__title}>Page Not Found</div>
            <div className={styles.error__description}>
                We can't seem to find that page. It might have been removed or doesn't
                exist anymore.
            </div>
           
        </div>
    );
};

export default NotFound;
