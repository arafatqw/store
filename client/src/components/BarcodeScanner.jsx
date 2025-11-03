import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Camera, X, RotateCcw } from 'lucide-react';

export default function BarcodeScanner({ onScan, onClose, title = 'مسح الباركود' }) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [lastScan, setLastScan] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const zxingReaderRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanningIntervalRef = useRef(null);
  const checkCameraIntervalRef = useRef(null);

  const getQrboxSize = () => {
    const width = window.innerWidth;
    if (width < 640) {
      // Mobile - use 80% of screen
      return { width: Math.min(280, width * 0.8), height: Math.min(280, width * 0.8) };
    }
    return { width: 250, height: 250 };
  };

  // Helper function to start scanner after permission is granted
  const startScannerAfterPermission = async (permissionStream) => {
    // Stop the permission stream first
    if (permissionStream) {
      try {
        permissionStream.getTracks().forEach(track => track.stop());
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Wait a bit before starting scanner
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Now start the scanner
    // Try Html5Qrcode first (more reliable on mobile)
    try {
      await startScanningWithHtml5Qrcode();
      console.log('Html5Qrcode started successfully');
    } catch (html5Error) {
      console.warn('Html5Qrcode failed, trying ZXing:', html5Error);
      // Fallback to ZXing for barcode support
      try {
        await startScanningWithZXing();
        console.log('ZXing started successfully');
        // ZXing doesn't set camera ready automatically, so set it after a delay
        setTimeout(() => setCameraReady(true), 1000);
      } catch (zxingError) {
        console.error('Both scanners failed:', zxingError);
        throw html5Error; // Throw original error
      }
    }
  };

  const startScanningWithZXing = async () => {
    try {
      const codeReader = new BrowserMultiFormatReader();
      zxingReaderRef.current = codeReader;

      // Get available video devices
      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      let selectedDeviceId = null;
      
      // Try to find back camera
      if (videoInputDevices && videoInputDevices.length > 0) {
        const backCamera = videoInputDevices.find(device => {
          const label = device.label.toLowerCase();
          return label.includes('back') || 
                 label.includes('rear') ||
                 label.includes('environment') ||
                 label.includes('facing back');
        });
        
        selectedDeviceId = backCamera?.deviceId || videoInputDevices[0]?.deviceId;
      }

      if (!selectedDeviceId && videoInputDevices && videoInputDevices.length > 0) {
        selectedDeviceId = videoInputDevices[0]?.deviceId;
      }

      if (!selectedDeviceId) {
        throw new Error('No camera device found');
      }

      // Clear container first
      const container = document.getElementById('scanner-container');
      if (container) {
        container.innerHTML = '';
      }

      // Start decoding from video device - supports QR, EAN, UPC, Code128, Code39, and more
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        'scanner-container',
        (result, err) => {
          if (result) {
            const scannedText = result.getText();
            
            // Prevent duplicate scans
            if (scannedText === lastScan) {
              return;
            }
            
            setLastScan(scannedText);
            
            // Add vibration for success
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            
            // Stop scanning once we get a result
            stopScanning();
            onScan(scannedText);
          }
          if (err) {
            // Ignore NotFoundException - just means no code found yet, keep scanning
            if (err.name !== 'NotFoundException' && !err.message?.includes('NotFound')) {
              // Only log other errors in development
              if (process.env.NODE_ENV === 'development') {
                console.log('Scan error:', err.message || err);
              }
            }
          }
        }
      );

      // Store the reader reference
      // Note: decodeFromVideoDevice doesn't return a stream, it manages it internally
    } catch (err) {
      console.error('ZXing error:', err);
      throw err;
    }
  };

  const startScanningWithHtml5Qrcode = async (tryUserFacing = false) => {
    try {
      // Clear container first
      const container = document.getElementById('scanner-container');
      if (container) {
        container.innerHTML = '';
      }

      // Wait a moment for container to clear
      await new Promise(resolve => setTimeout(resolve, 100));

      const html5QrCode = new Html5Qrcode('scanner-container');
      html5QrCodeRef.current = html5QrCode;

      const qrboxSize = getQrboxSize();
      
      // Try to start camera with proper format
      try {
        await html5QrCode.start(
          { facingMode: tryUserFacing ? 'user' : 'environment' },
          {
            fps: 10,
            qrbox: qrboxSize,
            aspectRatio: 1.0,
            disableFlip: false,
            videoConstraints: {
              facingMode: tryUserFacing ? 'user' : 'environment'
            }
          },
          (decodedText, decodedResult) => {
            // Prevent duplicate scans
            if (decodedText === lastScan) {
              return;
            }
            
            setLastScan(decodedText);
            
            // Add vibration if available
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            
            // Stop scanning once we get a result
            stopScanning();
            onScan(decodedText);
          },
          (errorMessage) => {
            // Ignore minor errors - just keep scanning
            // NotFoundException is normal - it just means no code is in view yet
            if (errorMessage && 
                !errorMessage.includes('NotFoundException') && 
                !errorMessage.includes('No QR code') &&
                !errorMessage.includes('QR code parse error') &&
                !errorMessage.includes('QR code decode error')) {
              // Only log other errors in development
              if (process.env.NODE_ENV === 'development') {
                console.log('Scan warning:', errorMessage);
              }
            }
          }
        );
      } catch (startError) {
        // If environment camera fails and we haven't tried user yet, try user-facing
        if (!tryUserFacing && 
            (startError.message?.includes('environment') || 
             startError.message?.includes('NotReadableError') ||
             startError.name === 'NotReadableError')) {
          console.log('Back camera failed, trying front camera...');
          await stopScanning();
          await new Promise(resolve => setTimeout(resolve, 300));
          return startScanningWithHtml5Qrcode(true); // Try user-facing camera
        }
        throw startError;
      }

      // Check if video element is ready
      const checkCamera = () => {
        const container = document.getElementById('scanner-container');
        const video = container?.querySelector('video');
        if (video) {
          if (video.readyState >= 2) {
            setCameraReady(true);
            if (checkCameraIntervalRef.current) {
              clearInterval(checkCameraIntervalRef.current);
              checkCameraIntervalRef.current = null;
            }
          }
        }
      };

      // Check immediately
      checkCamera();

      // Set up interval to check camera readiness
      if (!checkCameraIntervalRef.current) {
        checkCameraIntervalRef.current = setInterval(checkCamera, 100);
      }

      // Clear interval after 5 seconds max
      setTimeout(() => {
        if (checkCameraIntervalRef.current) {
          clearInterval(checkCameraIntervalRef.current);
          checkCameraIntervalRef.current = null;
        }
        // If still not ready, assume it's working
        setCameraReady(true);
      }, 5000);

    } catch (err) {
      console.error('Html5Qrcode error:', err);
      throw err;
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);
      setLastScan('');
      setCameraReady(false);

      // Check if browser supports camera access and log diagnostic info
      const hasMediaDevices = navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
      const hasGetUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      
      console.log('Camera diagnostic:', {
        hasMediaDevices,
        hasGetUserMedia,
        isSecureContext,
        protocol: location.protocol,
        hostname: location.hostname,
        userAgent: navigator.userAgent
      });
      
      // Check secure context for Chrome
      if (!isSecureContext && /Chrome/.test(navigator.userAgent)) {
        console.warn('⚠️ Chrome requires HTTPS or localhost for camera access');
        // Don't throw immediately - let it try and show better error
      }
      
      if (!hasMediaDevices && !hasGetUserMedia) {
        // Don't throw error here, let the actual camera start handle it
        console.warn('Camera API might not be fully supported, but will try anyway');
      }

      // Clear any existing scanner first
      await stopScanning();
      
      // Wait a bit for cleanup - ensure container is ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Ensure container exists
      const container = document.getElementById('scanner-container');
      if (!container) {
        throw new Error('Scanner container not found');
      }

      // CRITICAL: On mobile, we MUST request camera permission FIRST before opening camera
      // Check if mediaDevices is available
      if (!navigator.mediaDevices) {
        console.error('❌ navigator.mediaDevices is not available');
        throw new Error('MEDIADEVICES_NOT_SUPPORTED');
      }

      if (!navigator.mediaDevices.getUserMedia) {
        console.error('❌ navigator.mediaDevices.getUserMedia is not available');
        throw new Error('MEDIADEVICES_NOT_SUPPORTED');
      }

      // Request camera permission explicitly
      let permissionStream = null;
      try {
        console.log('Requesting camera permission...');
        permissionStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        console.log('✅ Camera permission granted!');
        
        // Now start the scanner after permission is granted
        await startScannerAfterPermission(permissionStream);
        
      } catch (permissionError) {
        console.error('❌ Camera permission denied:', permissionError);
        // Stop everything and show error
        setIsScanning(false);
        setCameraReady(false);
        
        if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
          throw new Error('PERMISSION_DENIED');
        } else {
          throw permissionError;
        }
      }

      // Remove the duplicate code below - we already call startScannerAfterPermission above
      
    } catch (err) {
      console.error('Scanner error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      let errorMsg = 'فشل تشغيل الكاميرا.';
      let errorDetails = '';
      
      if (err.message === 'MEDIADEVICES_NOT_SUPPORTED') {
        errorMsg = 'المتصفح لا يدعم الوصول للكاميرا';
        const isHTTP = location.protocol === 'http:';
        const isIP = /^\d+\.\d+\.\d+\.\d+/.test(location.hostname);
        
        if (isHTTP && isIP) {
          errorDetails = '⚠️ المشكلة: الموقع يعمل على HTTP وليس HTTPS\n\nChrome على Android يحتاج HTTPS للكاميرا:\n\n✅ الحلول:\n\n1️⃣ استخدم Firefox:\n• Firefox يدعم HTTP للكاميرا\n• حمّله من Google Play\n• افتح نفس العنوان: http://192.168.1.106:3001\n\n2️⃣ أو اطلب HTTPS:\n• اطلب من المطور تفعيل HTTPS على السيرفر\n\n3️⃣ أو امنح الإذن في Chrome:\n• إعدادات Chrome → إعدادات الموقع → الكاميرا\n• ابحث عن 192.168.1.106 وامنح الإذن';
        } else {
          errorDetails = 'المتصفح الحالي لا يدعم الوصول للكاميرا.\nيرجى استخدام Chrome أو Firefox محدث.';
        }
      } else if (err.name === 'NotAllowedError' || err.message?.includes('permission') || err.message?.includes('Permission denied') || err.message === 'PERMISSION_DENIED') {
        errorMsg = 'تم رفض الوصول للكاميرا';
        const isChromeMobile = /Chrome/.test(navigator.userAgent) && /Mobile/.test(navigator.userAgent);
        const isIP = /^\d+\.\d+\.\d+\.\d+/.test(location.hostname);
        
        if (isChromeMobile && isIP) {
          errorDetails = '⚠️ Chrome على الهاتف يحتاج HTTPS للكاميرا\n\nالحلول:\n\n1️⃣ امنح الإذن عند الطلب:\n• عند الضغط على "بدء المسح"، سيطلب الإذن\n• اضغط "السماح" فوراً\n• أو: اضغط على القفل 🔒 بجانب العنوان\n• اختر "إعدادات الموقع" → "الكاميرا" → "السماح"\n\n2️⃣ أو استخدم Firefox:\n• Firefox يدعم HTTP للكاميرا\n• حمّل من Google Play\n\n3️⃣ أو استخدم HTTPS:\n• اطلب من المطور تفعيل HTTPS';
        } else {
          errorDetails = '⏰ عند الضغط على "بدء المسح":\n• سيطلب المتصفح الإذن للكاميرا\n• اضغط "السماح" أو "Allow" فوراً\n\n📱 إذا لم يطلب الإذن:\n1. اضغط على القفل 🔒 أو "غير آمن" بجانب العنوان\n2. اختر "إعدادات الموقع" → "الكاميرا"\n3. اختر "السماح"\n\nأو من إعدادات Chrome:\n• القائمة (⋮) → الإعدادات → إعدادات الموقع → الكاميرا';
        }
      } else if (err.name === 'NotFoundError' || err.message?.includes('No camera') || err.message?.includes('not found')) {
        errorMsg = 'لم يتم العثور على كاميرا';
        errorDetails = 'تأكد من وجود كاميرا في الجهاز وأنها تعمل بشكل صحيح.';
      } else if (err.name === 'NotReadableError' || err.message?.includes('in use')) {
        errorMsg = 'الكاميرا مستخدمة';
        errorDetails = 'الكاميرا مستخدمة من قبل تطبيق آخر. يرجى إغلاق التطبيقات الأخرى التي تستخدم الكاميرا.';
      } else if (err.message?.includes('HTTPS') || err.message?.includes('secure context') || err.message?.includes('Only secure origins')) {
        errorMsg = 'يحتاج اتصال آمن';
        errorDetails = 'الكاميرا تحتاج HTTPS على Chrome. جرب استخدام IP بدلاً من localhost، أو استخدم Firefox.';
      } else if (err.message?.includes('NotSupportedError') || err.message?.includes('not supported')) {
        errorMsg = 'المتصفح لا يدعم هذه الميزة';
        errorDetails = 'يرجى استخدام Chrome أو Firefox محدث، أو جرب متصفح آخر.';
      } else if (err.message) {
        // Don't show technical error message to user, show helpful message instead
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        const isFirefox = /Firefox/.test(navigator.userAgent);
        
        if (isChrome) {
          errorMsg = 'فشل الوصول للكاميرا';
          errorDetails = 'حلول محتملة:\n1. تأكد من السماح للكاميرا في إعدادات Chrome\n2. أعد تحميل الصفحة\n3. أغلق التطبيقات الأخرى التي تستخدم الكاميرا\n4. جرب Firefox كبديل';
        } else if (isFirefox) {
          errorMsg = 'فشل الوصول للكاميرا';
          errorDetails = 'حلول محتملة:\n1. تأكد من السماح للكاميرا في إعدادات Firefox\n2. أعد تحميل الصفحة\n3. أغلق التطبيقات الأخرى التي تستخدم الكاميرا';
        } else {
          errorMsg = 'فشل الوصول للكاميرا';
          errorDetails = 'يرجى المحاولة مرة أخرى أو تحديث الصفحة. إذا استمرت المشكلة، جرب Chrome أو Firefox.';
        }
      }
      
      setError(`${errorMsg}\n\n${errorDetails}`);
      setIsScanning(false);
      setCameraReady(false);
    }
  };

  const stopScanning = async () => {
    try {
      // Stop ZXing reader
      if (zxingReaderRef.current) {
        try {
          zxingReaderRef.current.reset();
          zxingReaderRef.current = null;
        } catch (e) {
          // Ignore errors
        }
      }

      // Stop any video tracks
      try {
        const container = document.getElementById('scanner-container');
        if (container) {
          const video = container.querySelector('video');
          if (video && video.srcObject) {
            const stream = video.srcObject;
            stream.getTracks().forEach(track => {
              track.stop();
            });
            video.srcObject = null;
          }
        }
      } catch (e) {
        // Ignore errors
      }

      // Stop stream reference
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        } catch (e) {
          // Ignore errors
        }
      }

      // Clear scanning interval
      if (scanningIntervalRef.current) {
        clearInterval(scanningIntervalRef.current);
        scanningIntervalRef.current = null;
      }

      // Clear camera check interval
      if (checkCameraIntervalRef.current) {
        clearInterval(checkCameraIntervalRef.current);
        checkCameraIntervalRef.current = null;
      }

      setCameraReady(false);

      // Stop Html5Qrcode
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
          html5QrCodeRef.current = null;
        } catch (e) {
          // Ignore errors
        }
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center z-10">
        <h3 className="text-lg font-semibold">{title}</h3>
        <button
          onClick={() => {
            stopScanning();
            onClose();
          }}
          className="text-white hover:text-gray-200 p-2 -mr-2"
          aria-label="إغلاق"
        >
          <X size={24} />
        </button>
      </div>

      {/* Scanner Area - Full screen on mobile */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm max-h-[80%] overflow-y-auto">
            <div className="whitespace-pre-line">{error}</div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setError('');
                  setCameraReady(false);
                  startScanning();
                }}
                className="btn-primary text-sm px-4 py-2"
              >
                حاول مرة أخرى
              </button>
              <button
                onClick={() => {
                  stopScanning();
                  onClose();
                }}
                className="btn-secondary text-sm px-4 py-2"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        <div
          id="scanner-container"
          className="w-full max-w-md bg-black rounded-lg overflow-hidden relative"
          style={{ 
            minHeight: typeof window !== 'undefined' && window.innerWidth < 640 ? '50vh' : '400px'
          }}
        />
        
        {/* Loading indicator - show only when camera is not ready yet */}
        {isScanning && !error && !cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 pointer-events-none z-30">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm font-medium">جاري فتح الكاميرا...</p>
              <p className="text-xs text-gray-300 mt-1">يرجى السماح بالوصول للكاميرا</p>
            </div>
          </div>
        )}

        {/* Scanning overlay indicator */}
        {isScanning && !error && cameraReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-4 border-blue-500 rounded-lg" 
                 style={{ 
                   width: getQrboxSize().width, 
                   height: getQrboxSize().height,
                   animation: 'pulse 2s infinite'
                 }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-white p-4 border-t border-gray-200">
        <div className="flex gap-3 max-w-md mx-auto">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              بدء المسح
            </button>
          ) : (
            <>
              <button
                onClick={stopScanning}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                إيقاف
              </button>
              <button
                onClick={() => {
                  stopScanning();
                  setTimeout(startScanning, 300);
                }}
                className="btn-secondary flex items-center justify-center gap-2"
                title="إعادة المحاولة"
              >
                <RotateCcw size={18} />
              </button>
            </>
          )}
          <button
            onClick={() => {
              stopScanning();
              onClose();
            }}
            className="btn-secondary"
          >
            إلغاء
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 text-center mt-3">
          {isScanning ? (
            <>
              ضع الباركود أو QR Code داخل الإطار<br />
              <span className="text-xs text-gray-500">يدعم: QR Code, EAN, UPC, Code128, Code39, وغيرها</span>
            </>
          ) : (
            'اضغط "بدء المسح" لفتح الكاميرا'
          )}
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        #scanner-container video {
          width: 100% !important;
          height: auto !important;
        }
      `}</style>
    </div>
  );
}
