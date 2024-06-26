
import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import Header from "../Header/Header";
import styles from "./MainPage.module.css"
import { API_BASE_URL, AUTH_TOKEN, UUID } from '../../ApiConfig';
import { Alert } from '@mui/material';
import AlertDialogSlide from "../Confarmation-Box/Confermation"
// pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.js`;
const MainApp = () => {
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [showCanvas, setShowCanvas] = useState(false);
    const canvasRef = useRef(null);
    const [signedPdfUrl, setSignedPdfUrl] = useState(null);
    const [signedPdfBlob, setSignedPdfBlob] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showConFarmation, setShowConfermation] = useState(false);
const [showSaveAlert, setShowSaveAlert] = useState(false);
    // const [clearVisible, setClearVisible] = useState(true);
    // const handleFileChange = (e) => {
    //     const selectedFile = e.target.files && e.target.files[0];
    //     if (selectedFile) {
    //         setFile(URL.createObjectURL(selectedFile));
    //         setShowCanvas(false);
    //         setSignedPdfUrl(null);
    //     }

    // };
    // eslint-disable-next-line no-undef
    useEffect(() => {
        const fetchPdf = async () => {
            const url = `${API_BASE_URL}${UUID}/`;
            const headers = {
                "Authorization": AUTH_TOKEN,
                "Content-Type": "application/json"
            };
            try {
                const response = await fetch(url, { headers, mode: 'cors' });
                if (!response.ok) {
                    throw new Error('Failed to fetch PDF from the provided URL');
                }
                const responseData = await response.json();
                const pdfUrl = responseData.field_pdf;
                if (!pdfUrl) {
                    throw new Error('PDF URL not found in the response');
                }
                const pdfResponse = await fetch(pdfUrl);
                if (!pdfResponse.ok) {
                    throw new Error('Failed to fetch PDF from the provided URL');
                }
                const pdfBlob = await pdfResponse.blob();
                setFile(URL.createObjectURL(pdfBlob));
                setShowCanvas(false);
                setSignedPdfUrl(null);
            } catch (error) {
                console.error('Error fetching PDF:', error);
            }
        };

        fetchPdf();
    }, []);





    // const handleFileChange = async (pdfUrl) => {
    //     if (pdfUrl) {
    //         try {
    //             const response = await fetch(pdfUrl);
    //             if (!response.ok) {
    //                 throw new Error('Failed to fetch PDF from the provided URL');
    //             }
    //             const pdfBlob = await response.blob();
    //             setFile(URL.createObjectURL(pdfBlob));
    //             setShowCanvas(false);
    //             setSignedPdfUrl(null);
    //         } catch (error) {
    //             console.error('Error fetching PDF:', error);
    //         }
    //     }
    // };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };


    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const endDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.closePath();
    };

    const draw = (e) => {
        if (!isDrawing || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (canvas.width / rect.width);
        const y = (e.clientY - rect.top) * (canvas.height / rect.height);

        ctx.lineTo(x, y);
        ctx.stroke();
    };


    const handleClearSignature = () => {

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setShowAlert(true);
    };

const isCanvasBlank = (canvas) => {
    const ctx = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    return !pixelBuffer.some(color => color !== 0);
};
    const handleSaveSignature = async () => {
                        if (!file || !canvasRef.current) return;
                if (isCanvasBlank(canvasRef.current)) {
                    setShowSaveAlert(true);
                    return;
                }
        try {
            const existingPdfBytes = await fetch(file).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            const pages = pdfDoc.getPages();

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const signatureData = canvasRef.current.toDataURL('image/png');
                const pngImage = await pdfDoc.embedPng(signatureData);

                const { width } = page.getSize();

                // Position the signature at the bottom right corner
                const signatureWidth = 100;
                const signatureHeight = 50;
                const xPos = width - 100;
                const yPos = 5;
                page.drawImage(pngImage, {
                    x: xPos,
                    y: yPos,
                    width: signatureWidth,
                    height: signatureHeight,
                });
            }

            const modifiedPdfBytes = await pdfDoc.save();
            const modifiedBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

            setSignedPdfBlob(modifiedBlob);
            const modifiedPdfUrl = URL.createObjectURL(modifiedBlob);
            setSignedPdfUrl(modifiedPdfUrl);

        } catch (error) {
            console.error('Error saving signature:', error);
        }
    };










    const handleSubmit = async () => {
        if (!signedPdfBlob) {
            console.error('No signed PDF available for submission');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('signedPdf', signedPdfBlob, 'signed.pdf');

            // const response = await fetch('http://localhost:3008/upload', {
            //     method: 'POST',
            //     mode: 'cors',
            //     body: formData,
            // });

            // if (!response.ok) {
            //     throw new Error('Failed to upload signed PDF');
            // }

            console.log('Signed PDF uploaded successfully');
            setShowConfermation(true)
            // setShowModal(true);
        } catch (error) {
            console.error('Error uploading signed PDF:', error);
        }
    };

    return (
        <div className={styles.app} style={{ width: "100%" }}>

            {/* <input
                type='file'
                onChange={handleFileChange}
                accept='application/pdf'
            /> */}
            <div className={styles.mobHeader}>
                <Header />
            </div>
            <div className={styles.container_main_div}>
                {file && (
                    <div className={styles.pdf_viewer}>
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            
                        >
                            {Array.from(
                                new Array(numPages),
                                (el, index) => (
                                    <Page
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        className={styles.pagesdetail}
                                    />
                                ),
                            )}
                        </Document>
                    </div>
                )}
                {/* {!signedPdfUrl && (
                <button onClick={handleSignButtonClick} className={styles.sign}>Sign</button>
            )}
            {showCanvas && ( */}
                <div className={styles.canvas_main_div}>

                    <div className={styles.canvas_container}>
                        <div className={styles.desktopHeader}>
                            <Header />
                        </div>

                        <div className={styles.rightBoxContent}>
                            <div className={styles.signature_div}>Signature :</div>
                            <div> <canvas
                                ref={canvasRef}
                                // width={400}
                                height={200}
                                className={styles.canvas}
                                onMouseDown={startDrawing}
                                onMouseUp={endDrawing}
                                onMouseMove={draw}
                            ></canvas></div>

                            <div className={styles.signature_buttons}>
                                <button className={styles.Clear} onClick={handleClearSignature}>Clear Signature</button>
                                {showAlert && (
                                    <div className={styles.alertdiv} >
                                        <Alert severity="success" sx={{ height: "36px", width: "300px" }} onClose={() => setShowAlert(false)}>
                                            Signature cleared successfully.
                                        </Alert>
                                    </div>
                                )}
                                <button className={styles.Save} onClick={handleSaveSignature}>Save Signature</button>
    {
        showSaveAlert && (
            <div className={styles.alertdiv_two}>
                <Alert severity="error" sx={{ height: "36px", width: "330px" }} onClose={() => setShowSaveAlert(false)}>
                    Please add a signature before saving.
                </Alert>
            </div>
        )
    }

                            </div>

                            {signedPdfUrl && (
                                <div className={styles.viewpdf}>
                                    <div>
                                        <button className={styles.Viewbtn}>
                                            <a href={signedPdfUrl} target="_blank" rel="noopener noreferrer">
                                                View Signed Pdf
                                            </a>
                                        </button>
                                    </div>
                                    <div>

                                        <button className={styles.SubmitSign} onClick={handleSubmit}>Submit</button>
                                        {setShowConfermation && (
                                            <AlertDialogSlide open={showConFarmation} handleClose={() => setShowConfermation(false)} signedPdfUrl={signedPdfUrl} />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>



                </div>
            </div>

        </div>
    );
};

export default MainApp;
