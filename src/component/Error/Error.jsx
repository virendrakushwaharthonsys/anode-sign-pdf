import React from 'react';
import styles from './Error.module.css';

const ErrorComponent = () => {
    return (
        <div className={styles.errorContainer}>
            <h2>Error</h2>
            <span> Failed to Fetch data or Invalid Authorization</span>
        </div>
    );
};

export default ErrorComponent;
