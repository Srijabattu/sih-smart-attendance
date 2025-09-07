// src/components/attendance/QRScanner.js
import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { attendanceAPI } from '../../services/api';
import { toast } from 'react-toastify';

const QRScanner = ({ onSuccess, onError }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const scannerRef = useRef(null);
    const html5QrcodeScanner = useRef(null);

    useEffect(() => {
        if (isScanning && scannerRef.current) {
            html5QrcodeScanner.current = new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                false
            );

            html5QrcodeScanner.current.render(
                handleScanSuccess,
                handleScanError
            );
        }

        return () => {
            if (html5QrcodeScanner.current) {
                html5QrcodeScanner.current.clear().catch(console.error);
            }
        };
    }, [isScanning]);

    const handleScanSuccess = async (decodedText) => {
        try {
            setIsProcessing(true);
            
            // Stop scanner
            if (html5QrcodeScanner.current) {
                await html5QrcodeScanner.current.clear();
            }
            setIsScanning(false);

            // Process QR code data
            const response = await attendanceAPI.markAttendanceQR(decodedText);
            
            if (response.data.success) {
                toast.success('Attendance marked successfully!');
                onSuccess?.(response.data);
            } else {
                toast.error(response.data.message || 'Failed to mark attendance');
                onError?.(response.data.message);
            }
        } catch (error) {
            console.error('QR scan processing error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to process QR code';
            toast.error(errorMessage);
            onError?.(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleScanError = (error) => {
        // Only log actual errors, not "No QR code found" messages
        if (!error.includes('No MultiFormat Readers were able to detect the code')) {
            console.warn('QR Scan Error:', error);
        }
    };

    const startScanning = () => {
        setIsScanning(true);
    };

    const stopScanning = () => {
        if (html5QrcodeScanner.current) {
            html5QrcodeScanner.current.clear().catch(console.error);
        }
        setIsScanning(false);
    };

    return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" gutterBottom>
                QR Code Attendance Scanner
            </Typography>

            {!isScanning && !isProcessing && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={startScanning}
                    size="large"
                    sx={{ mb: 2 }}
                >
                    Start Scanning
                </Button>
            )}

            {isProcessing && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    <Typography>Processing attendance...</Typography>
                </Box>
            )}

            {isScanning && (
                <Box>
                    <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }}></div>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={stopScanning}
                        sx={{ mt: 2 }}
                    >
                        Stop Scanning
                    </Button>
                </Box>
            )}

            <Alert severity="info" sx={{ mt: 2 }}>
                Position the QR code within the scanner frame. Make sure you have good lighting and hold steady.
            </Alert>
        </Box>
    );
};

export default QRScanner;
