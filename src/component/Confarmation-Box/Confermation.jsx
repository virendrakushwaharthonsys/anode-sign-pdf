import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import CircularProgress from '@mui/material/CircularProgress'; // Import the loader component
import styles from "../MainPage/MainPage.module.css";
import { AUTH_TOKEN, SUBMIT_URL } from '../../ApiConfig';
import { useParams } from 'react-router-dom';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AlertDialogSlide = ({ open, handleClose, signedPdfBlob, signedPdfUrl }) => {
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false); // State to manage loading

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleFinish = () => {
        window.location.reload();
    };

    const { uuid } = useParams();

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };

    const handleAgree = async () => {
        if (!signedPdfBlob) {
            console.error('No signed PDF available for submission');
            return;
        }

        setLoading(true); // Start loading

        try {
            const formData = new FormData();
            formData.append('signedPdf', signedPdfBlob, 'signed.pdf');

            const apiUrl = `${SUBMIT_URL}${uuid}/`;
            const headers = {
                Authorization: AUTH_TOKEN,
            };

            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers,
                body: formData,
            });

            if (response.ok) {
                console.log('Signed PDF uploaded successfully');
                setShowModal(true);
                handleClose(true);
            } else {
                console.error('Failed to upload signed PDF', response);
                const responseText = await response.text();
                console.error('Response text:', responseText);
            }
        } catch (error) {
            console.error('Error uploading signed PDF:', error);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                style={{ zIndex: 1300 }}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Are you sure you want to submit the document?"}</DialogTitle>
                <DialogActions>
                    <Button onClick={handleClose} disabled={loading}>Disagree</Button>
                    <Button onClick={handleAgree} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Agree'}
                    </Button>
                </DialogActions>
            </Dialog>
            {showModal && (
                <div className={styles.modal} onClick={handleBackdropClick}>
                    <div className={styles.modal_content}>
                        <div className={styles.CloseButtonDiv}>
                            <button className={styles.close} onClick={handleCloseModal}>Close</button>
                        </div>
                        <div className={styles.Content_doc}>
                            <h2>Document Submitted <br />Successfully</h2>
                        </div>
                        <div className={styles.modal_button_div}>
                            <div className={styles.modal_button}>
                                <div className={styles.Viewpdf_doc}>
                                    <button className={styles.DownlaodPdf}>
                                        <a href={signedPdfUrl} download="signed.pdf">
                                            Download PDF
                                        </a>
                                    </button>
                                </div>
                                <div>
                                    <button className={styles.Finish} onClick={handleFinish}>Finish</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlertDialogSlide;
