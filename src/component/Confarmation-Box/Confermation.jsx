// import React, { useState } from 'react';
// import Button from '@mui/material/Button';
// import Dialog from '@mui/material/Dialog';
// import DialogActions from '@mui/material/DialogActions';
// import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
// import DialogTitle from '@mui/material/DialogTitle';
// import Slide from '@mui/material/Slide';
// import styles from "../MainPage/MainPage.module.css"


// const Transition = React.forwardRef(function Transition(props, ref) {
//     return <Slide direction="up" ref={ref} {...props} />;
// });

// const AlertDialogSlide = ({ open, handleClose }) => {
//     const [showModal, setShowModal] = useState(false);
//     const [signedPdfUrl, setSignedPdfUrl] = useState(null);
//     const handleCloseModal = () => {
//         setShowModal(false);
//     };
//     const handleFinish = () => {
//         window.location.reload();
//     };
//     const handleBackdropClick = (e) => {
//         if (e.target === e.currentTarget) {
//             setShowModal(false);
//         }
//     };
    
//     return (
//         <Dialog
//             open={open}
//             TransitionComponent={Transition}
//             keepMounted
//             onClose={handleClose}
//             aria-describedby="alert-dialog-slide-description"
//         >
//             <DialogTitle>{"Are you sure you want to submit the document"}</DialogTitle>
            
//             <DialogActions>
//                 <Button onClick={handleClose}>Disagree</Button>
//                 <Button onClick={handleClose}>Agree</Button>
//             </DialogActions>
//             {showModal && (
//                 <div className={styles.modal} onClick={handleBackdropClick}>

//                     <div className={styles.modal_content}>
//                         <div className={styles.CloseButtonDiv}> <button className={styles.close} onClick={handleCloseModal}>Close</button></div>
//                         <div className={styles.Content_doc}>
//                             <h2>Document Submitted <br></br>Successfully</h2>
//                         </div>

//                         <div className={styles.modal_button_div}>
//                             <div className={styles.modal_button}>
//                                 <div className={styles.Viewpdf_doc}>
//                                     <button className={styles.DownlaodPdf}>  <a href={signedPdfUrl} download="signed.pdf">
//                                         Download PDF
//                                     </a></button>
//                                 </div>
//                                 <div>
//                                     <button className={styles.Finish} onClick={handleFinish}>Finish</button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </Dialog>
        
//     );
    
// };

// export default AlertDialogSlide;
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import styles from "../MainPage/MainPage.module.css";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AlertDialogSlide = ({ open, handleClose, signedPdfUrl }) => {
    const [showModal, setShowModal] = useState(false);

    const handleAgree = () => {
        setShowModal(true);
        handleClose(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleFinish = () => {
        window.location.reload();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
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
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={handleAgree}>Agree</Button>
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
