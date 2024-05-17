
import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {PDFDocument}  from 'pdf-lib';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import Header from "./component/Header/Header";

import styles from "./component/MainPage/MainPage.module.css"
import { BASE_URL } from './ApiConfig';
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MainApp = () => {
    const [file, setFile] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [showCanvas, setShowCanvas] = useState(false);
    const canvasRef = useRef(null);
    const [signedPdfUrl, setSignedPdfUrl] = useState(null);
    const [signedPdfBlob, setSignedPdfBlob] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showModal, setShowModal] = useState(false);
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
        handleFileChange(BASE_URL);
    }, []);

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };
    const handleFileChange = async (pdfUrl) => {
        if (pdfUrl) {
            try {
                const response = await fetch(pdfUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch PDF from the provided URL');
                }
                const pdfBlob = await response.blob();
                setFile(URL.createObjectURL(pdfBlob));
                setShowCanvas(false);
                setSignedPdfUrl(null);
            } catch (error) {
                console.error('Error fetching PDF:', error);
            }
        }
    };
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    };

    const endDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
    };

    const handleSignButtonClick = () => {
        setShowCanvas(true);
    };
    const handleSaveSignature = async () => {
        if (!file || !canvasRef.current) return;

        try {
            const existingPdfBytes = await fetch(file).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
            // await pdfDoc.save({ updateFieldAppearances: false })
            const pages = pdfDoc.getPages();

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];

                // Your existing code to handle signatures on each page
                // For example:
                const signatureData = canvasRef.current.toDataURL('image/png');
                const pngImage = await pdfDoc.embedPng(signatureData);

                const extraSpace = 100;
                const { width, height } = page.getSize();


                            page.setSize(width, height + extraSpace);


                            page.translateContent(0, extraSpace);


                            const signatureWidth = 100;
                            const signatureHeight = 50;
                            const xPos = 470;
                            const yPos = 50;
                page.drawImage(pngImage, {
                                x: xPos,
                                y: -yPos,
                                width: signatureWidth,
                                height: signatureHeight,
                            });
            }

            // Save modified PDF and update state
            const modifiedPdfBytes = await pdfDoc.save();
            const modifiedBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

            setSignedPdfBlob(modifiedBlob);
            const modifiedPdfUrl = URL.createObjectURL(modifiedBlob);
            setSignedPdfUrl(modifiedPdfUrl);
            setShowCanvas(false);
        } catch (error) {
            console.error('Error saving signature:', error);
        }
    };


    // const handleSaveSignature = async () => {
    //     if (!file || !canvasRef.current) return;

    //     try {
    //         const existingPdfBytes = await fetch(file).then(res => res.arrayBuffer());
    //         // const pdfDoc = await PDFDocument.load(existingPdfBytes);
    //         const pdfDoc = PDFDocument.load(existingPdfBytes, { ignoreEncryption: true })
    //         for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    //             const page = pdfDoc.getPage(i);


    //             const signatureData = canvasRef.current.toDataURL('image/png');


    //             const pngImage = await pdfDoc.embedPng(signatureData);


    //             const extraSpace = 100;

    //             const { width, height } = page.getSize();


    //             page.setSize(width, height + extraSpace);


    //             page.translateContent(0, extraSpace);


    //             const signatureWidth = 100;
    //             const signatureHeight = 50;
    //             const xPos = 470;
    //             const yPos = 50;


    //             page.drawImage(pngImage, {
    //                 x: xPos,
    //                 y: -yPos,
    //                 width: signatureWidth,
    //                 height: signatureHeight,
    //             });
    //         }


    //         const modifiedPdfBytes = await pdfDoc.save();
    //         const modifiedBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });


    //         setSignedPdfBlob(modifiedBlob);

    //         const modifiedPdfUrl = URL.createObjectURL(modifiedBlob);
    //         setSignedPdfUrl(modifiedPdfUrl);
    //         setShowCanvas(false);
    //     } catch (error) {
    //         console.error('Error saving signature:', error);
    //     }
    // };


  


    const handleSubmit = async () => {
        if (!signedPdfBlob) {
            console.error('No signed PDF available for submission');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('signedPdf', signedPdfBlob, 'signed.pdf');

            const response = await fetch('http://localhost:3008/upload', {
                method: 'POST',
                mode: 'cors',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload signed PDF');
            }

            console.log('Signed PDF uploaded successfully');
            setShowModal(true);
        } catch (error) {
            console.error('Error uploading signed PDF:', error);
        }
    };

    return (
        <div className={styles.app} style={{ width: "100%" }}>
            <Header />
            {/* <input
                type='file'
                onChange={handleFileChange}
                accept='application/pdf'
            /> */}
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
                                    width={900}
                                />
                            ),
                        )}
                    </Document>
                </div>
            )}
            {!signedPdfUrl && (
                <button onClick={handleSignButtonClick} className={styles.sign}>Sign</button>
            )}
            {showCanvas && (
                <div className={styles.canvas_container}>
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={200}
                        style={{ border: '1px solid black', marginTop: '10px' }}
                        onMouseDown={startDrawing}
                        onMouseUp={endDrawing}
                        onMouseMove={draw}
                    ></canvas>
                    <button className={styles.Save} onClick={handleSaveSignature}>Save Signature</button>
                </div>
            )}
            {signedPdfUrl && (
                <div className={styles.viewpdf}>
                    {/* <button className={styles.Viewbtn}>
                        <a href={signedPdfUrl} target="_blank" rel="noopener noreferrer">
                            View
                        </a> */}
                    {/* </button> */}
                    <button className={styles.SubmitSign} onClick={handleSubmit}>Submit</button>
                </div>
            )}
            {showModal && (
                <div className={styles.modal} onClick={handleBackdropClick}>
                    <div className={styles.modal_content}>
                        <div className={styles.CloseButtonDiv}> <button className={styles.close} onClick={handleCloseModal}>Close</button></div>
                        <div className={styles.Content_doc}>
                            <h2>Document Submitted <br></br>Successfully</h2>
                        </div>

                        <div>
                            <a href={signedPdfUrl} download="signed.pdf">
                                <button className={styles.DownlaodPdf}>Download PDF</button>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainApp;
