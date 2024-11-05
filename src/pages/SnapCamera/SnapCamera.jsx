// src/pages/SnapCamera/SnapCamera.jsx
import React, { useEffect, useRef, useCallback, useState } from "react";
import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import LeadCaptureForm from "../../components/LeadCaptureForm/LeadCaptureForm";
import "./SnapCamera.css";

// Inicializa FFmpeg
const ffmpeg = new FFmpeg();

const SnapCamera = () => {
    const [showForm, setShowForm] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [showAdditionalControls, setShowAdditionalControls] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15);
    const [isFrontCamera, setIsFrontCamera] = useState(true);
    const [recordedVideo, setRecordedVideo] = useState(null);
    const [photoCaptured, setPhotoCaptured] = useState(null);
    const [processingMedia, setProcessingMedia] = useState(false);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const videoRef = useRef(null);
    const timerRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const sessionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const captureTimeoutRef = useRef(null);
    const retryAttemptsRef = useRef(0);

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;

    const VIDEO_CONFIG = {
        mobile: {
            width: { ideal: 720, max: 1280 },
            height: { ideal: 1280, max: 720 },
            frameRate: { ideal: 30, max: 30 },
            facingMode: "user",
        },
        desktop: {
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30, max: 60 },
        },
    };

    const RECORDER_CONFIG = {
        mobile: {
            videoBitsPerSecond: 2500000,
            audioBitsPerSecond: 128000,
        },
        desktop: {
            videoBitsPerSecond: 4000000,
            audioBitsPerSecond: 128000,
        },
    };

    useEffect(() => {
        const loadFfmpeg = async () => {
            try {
                if (!ffmpeg.loaded) {
                    await ffmpeg.load({
                        coreURL: await toBlobURL(
                            "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
                            "text/javascript",
                        ),
                        wasmURL: await toBlobURL(
                            "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm",
                            "application/wasm",
                        ),
                    });
                    setFfmpegLoaded(true);
                }
            } catch (error) {
                console.error("Error loading FFmpeg:", error);
                if (retryAttemptsRef.current < 3) {
                    retryAttemptsRef.current++;
                    setTimeout(loadFfmpeg, 2000);
                }
            }
        };
        loadFfmpeg();

        return () => {
            retryAttemptsRef.current = 0;
        };
    }, []);

    const getUrlParameter = useCallback((name) => {
        const searchParams = new URLSearchParams(window.location.search);
        return searchParams.get(name);
    }, []);

    const getLensId = useCallback(() => {
        return getUrlParameter("id");
    }, [getUrlParameter]);

    const getVideoMimeType = () => {
        const mimeTypes = [
            "video/mp4;codecs=avc1.42E01F,mp4a.40.2",
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
        ];
        return (
            mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) ||
            "video/webm"
        );
    };

    const getAudioConstraints = () => ({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        channelCount: 2,
        sampleRate: 44100,
        sampleSize: 16,
    });

    const getVideoDuration = (blob) => {
        return new Promise((resolve) => {
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.src = URL.createObjectURL(blob);
        });
    };

    const compressVideo = async (inputBlob, targetSize = 15728640) => {
        if (!ffmpegLoaded) {
            console.warn("FFmpeg not loaded, returning original blob");
            return inputBlob;
        }

        try {
            const inputBuffer = await inputBlob.arrayBuffer();
            const inputName = "input.webm";
            const outputName = "output.mp4";

            await ffmpeg.writeFile(inputName, new Uint8Array(inputBuffer));

            const duration = await getVideoDuration(inputBlob);
            const targetBitrate = Math.floor((targetSize * 8) / duration);

            await ffmpeg.exec([
                "-i",
                inputName,
                "-c:v",
                "libx264",
                "-preset",
                "medium",
                "-crf",
                "23",
                "-b:v",
                `${targetBitrate}k`,
                "-maxrate",
                `${targetBitrate * 1.5}k`,
                "-bufsize",
                `${targetBitrate * 3}k`,
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-ar",
                "44100",
                "-movflags",
                "+faststart",
                "-y",
                outputName,
            ]);

            const outputData = await ffmpeg.readFile(outputName);
            const outputBlob = new Blob([outputData.buffer], {
                type: "video/mp4",
            });

            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);

            return outputBlob;
        } catch (error) {
            console.error("Error compressing video:", error);
            return inputBlob;
        }
    };

    const capturePhoto = async () => {
        setProcessingMedia(true);
        try {
            const canvas = document.createElement("canvas");
            const video = videoRef.current.querySelector("canvas");

            if (!video) {
                throw new Error("Video element not found");
            }

            const aspectRatio = video.width / video.height;
            const targetWidth = isMobile ? 1280 : 1920;
            const targetHeight = Math.round(targetWidth / aspectRatio);

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const context = canvas.getContext("2d", {
                alpha: false,
                desynchronized: true,
                willReadFrequently: true,
            });

            if (isFrontCamera && !isIOS) {
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
            }

            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, "image/jpeg", 0.95);
            });

            let finalBlob = blob;
            if (blob.size > 5242880) {
                const compressedCanvas = document.createElement("canvas");
                const ctx = compressedCanvas.getContext("2d", {
                    alpha: false,
                    desynchronized: true,
                });
                const img = new Image();

                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.src = URL.createObjectURL(blob);
                });

                const scale = Math.sqrt(5242880 / blob.size);
                compressedCanvas.width = canvas.width * scale;
                compressedCanvas.height = canvas.height * scale;

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(
                    img,
                    0,
                    0,
                    compressedCanvas.width,
                    compressedCanvas.height,
                );

                finalBlob = await new Promise((resolve) => {
                    compressedCanvas.toBlob(resolve, "image/jpeg", 0.9);
                });

                URL.revokeObjectURL(img.src);
            }

            const url = URL.createObjectURL(finalBlob);
            setPhotoCaptured({ url, blob: finalBlob });

            const filename = `snaplead-photo-${Date.now()}.jpg`;
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error capturing photo:", error);
            setCameraError("Failed to capture photo. Please try again.");
        } finally {
            setProcessingMedia(false);
        }
    };

    const startRecording = async () => {
        setProcessingMedia(true);
        try {
            const canvas = videoRef.current.querySelector("canvas");
            if (!canvas) {
                throw new Error("Canvas element not found");
            }

            const stream = canvas.captureStream(isMobile ? 30 : 60);

            const audioStream = mediaStreamRef.current; // Usa o stream atual configurado no toggleCamera

            if (audioStream) {
                audioStream.getAudioTracks().forEach((track) => {
                    stream.addTrack(track);
                });
            }

            const mimeType = getVideoMimeType();
            const config = {
                mimeType,
                ...(isMobile
                    ? RECORDER_CONFIG.mobile
                    : RECORDER_CONFIG.desktop),
            };

            mediaRecorderRef.current = new MediaRecorder(stream, config);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onerror = (error) => {
                console.error("MediaRecorder error:", error);
                stopRecording();
                setCameraError("Recording failed. Please try again.");
            };

            mediaRecorderRef.current.onstop = async () => {
                try {
                    const rawBlob = new Blob(chunksRef.current, {
                        type: mimeType,
                    });

                    const optimizedBlob =
                        await optimizeVideoForSharing(rawBlob);
                    const url = URL.createObjectURL(optimizedBlob);

                    setRecordedVideo({ url, blob: optimizedBlob });
                } catch (error) {
                    console.error("Error processing video:", error);
                    setCameraError(
                        "Failed to process video. Please try again.",
                    );
                } finally {
                    setProcessingMedia(false);
                }
            };

            setIsRecording(true);
            setTimeLeft(15);
            mediaRecorderRef.current.start(1000);

            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            console.error("Error starting recording:", error);
            setIsRecording(false);
            setProcessingMedia(false);
            setCameraError(
                "Failed to start recording. Please check camera permissions.",
            );
        }
    };

    const optimizeVideoForSharing = async (blob) => {
        if (!ffmpegLoaded) {
            console.warn("FFmpeg not loaded, returning original blob");
            return blob;
        }

        try {
            const compressedBlob = await compressVideo(blob);

            if (isIOS) {
                return await convertToMP4ForIOS(compressedBlob);
            } else if (isAndroid) {
                return await optimizeForAndroid(compressedBlob);
            }

            return compressedBlob;
        } catch (error) {
            console.error("Error optimizing video:", error);
            return blob;
        }
    };

    const convertToMP4ForIOS = async (blob) => {
        try {
            const inputBuffer = await blob.arrayBuffer();
            const inputName = "input.webm";
            const outputName = "output.mp4";

            await ffmpeg.writeFile(inputName, new Uint8Array(inputBuffer));

            await ffmpeg.exec([
                "-i",
                inputName,
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-profile:v",
                "baseline",
                "-level",
                "3.0",
                "-pix_fmt",
                "yuv420p",
                "-vf",
                "scale=trunc(iw/2)*2:trunc(ih/2)*2",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-strict",
                "experimental",
                "-movflags",
                "+faststart",
                "-y",
                outputName,
            ]);

            const outputData = await ffmpeg.readFile(outputName);
            const outputBlob = new Blob([outputData.buffer], {
                type: "video/mp4",
            });

            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);

            return outputBlob;
        } catch (error) {
            console.error("Error converting for iOS:", error);
            return blob;
        }
    };

    const optimizeForAndroid = async (blob) => {
        try {
            const inputBuffer = await blob.arrayBuffer();
            const inputName = "input.webm";
            const outputName = "output.mp4";

            await ffmpeg.writeFile(inputName, new Uint8Array(inputBuffer));

            await ffmpeg.exec([
                "-i",
                inputName,
                "-c:v",
                "libx264",
                "-preset",
                "fast",
                "-profile:v",
                "main",
                "-level",
                "3.1",
                "-pix_fmt",
                "yuv420p",
                "-vf",
                "scale=trunc(iw/2)*2:trunc(ih/2)*2",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-ar",
                "44100",
                "-movflags",
                "+faststart",
                "-y",
                outputName,
            ]);

            const outputData = await ffmpeg.readFile(outputName);
            const outputBlob = new Blob([outputData.buffer], {
                type: "video/mp4",
            });

            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(outputName);

            return outputBlob;
        } catch (error) {
            console.error("Error optimizing for Android:", error);
            return blob;
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setShowAdditionalControls(true);
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (mediaStreamRef.current) {
            const audioTracks = mediaStreamRef.current.getAudioTracks();
            audioTracks.forEach((track) => track.stop());
        }
    };

    const handleRecordPress = () => {
        if (processingMedia) return;

        captureTimeoutRef.current = setTimeout(() => {
            startRecording();
        }, 300);
    };

    const handleRecordRelease = () => {
        if (processingMedia) return;

        if (captureTimeoutRef.current) {
            clearTimeout(captureTimeoutRef.current);
            captureTimeoutRef.current = null;
        }

        if (isRecording) {
            stopRecording();
        } else {
            capturePhoto();
        }
    };

    const handleDownload = async () => {
        setProcessingMedia(true);
        try {
            if (recordedVideo) {
                const a = document.createElement("a");
                a.href = recordedVideo.url;
                const filename = `snaplead-recording-${Date.now()}.mp4`;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else if (photoCaptured) {
                const a = document.createElement("a");
                a.href = photoCaptured.url;
                const filename = `snaplead-photo-${Date.now()}.jpg`;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error("Error downloading media:", error);
            setCameraError("Failed to download media. Please try again.");
        } finally {
            setProcessingMedia(false);
        }
    };

    const handleShare = async () => {
        if (!recordedVideo || processingMedia) return;

        setProcessingMedia(true);
        try {
            const file = new File(
                [recordedVideo.blob],
                `snaplead-recording-${Date.now()}.mp4`,
                { type: "video/mp4" },
            );

            if (file.size > 16777216) {
                throw new Error("Video file is too large for WhatsApp sharing");
            }

            if (navigator.share && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: "SnapLead AR Recording",
                    text: "Check out my SnapLead AR recording!",
                    files: [file],
                });
            } else {
                const url = URL.createObjectURL(file);
                const a = document.createElement("a");
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error("Error sharing:", error);
            setCameraError(
                error.message === "Video file is too large for WhatsApp sharing"
                    ? "Video is too large to share. Please try recording a shorter video."
                    : "Error sharing video. Please try downloading instead.",
            );
        } finally {
            setProcessingMedia(false);
        }
    };

    const toggleCamera = async () => {
        if (processingMedia || isRecording) return;

        try {
            setProcessingMedia(true);
            setIsFrontCamera((prev) => !prev);

            if (mediaStreamRef.current) {
                mediaStreamRef.current
                    .getTracks()
                    .forEach((track) => track.stop());
            }

            const config = isMobile
                ? VIDEO_CONFIG.mobile
                : VIDEO_CONFIG.desktop;
            const constraints = {
                video: {
                    ...config,
                    facingMode: isFrontCamera ? "environment" : "user",
                },
                audio: getAudioConstraints(),
            };

            const newStream =
                await navigator.mediaDevices.getUserMedia(constraints);
            mediaStreamRef.current = newStream;

            if (sessionRef.current) {
                const source = createMediaStreamSource(newStream);
                await sessionRef.current.setSource(source);
                await sessionRef.current.play();
            }
        } catch (error) {
            console.error("Error switching camera:", error);
            setCameraError("Failed to switch camera. Please try again.");
        } finally {
            setProcessingMedia(false);
        }
    };

    useEffect(() => {
        const initializeCamera = async () => {
            if (showForm) return;

            const lensId = getLensId();
            if (!lensId) {
                console.log("No lens ID provided");
                if (videoRef.current) {
                    videoRef.current.style.display = "none";
                }
                return;
            }

            try {
                const cameraKit = await bootstrapCameraKit({
                    apiToken: process.env.REACT_APP_API_TOKEN,
                });

                sessionRef.current = await cameraKit.createSession();

                const config = isMobile
                    ? VIDEO_CONFIG.mobile
                    : VIDEO_CONFIG.desktop;
                const constraints = {
                    video: {
                        ...config,
                        facingMode: isFrontCamera ? "user" : "environment",
                    },
                    audio: getAudioConstraints(),
                };

                mediaStreamRef.current =
                    await navigator.mediaDevices.getUserMedia(constraints);
                const source = createMediaStreamSource(mediaStreamRef.current);
                await sessionRef.current.setSource(source);

                const container = videoRef.current;
                if (container) {
                    container.innerHTML = "";
                    const output = sessionRef.current.output.live;

                    if (isIOS) {
                        output.setAttribute("playsinline", "true");
                    }

                    output.style.width = "100%";
                    output.style.height = "100%";
                    output.style.objectFit = "cover";

                    if (isFrontCamera && !isIOS) {
                        output.style.transform = "scaleX(-1)";
                    }

                    container.appendChild(output);
                }

                const { lenses } =
                    await cameraKit.lenses.repository.loadLensGroups([
                        process.env.REACT_APP_LENS_GROUP_ID,
                    ]);

                const selectedLens = lenses.find((lens) => lens.id === lensId);
                if (selectedLens) {
                    await sessionRef.current.applyLens(selectedLens);
                    await sessionRef.current.play();
                }
            } catch (error) {
                console.error("Error initializing camera:", error);
                setCameraError(
                    "Failed to initialize camera. Please check your camera permissions.",
                );
                cleanup();
            }
        };

        initializeCamera();

        return cleanup;
    }, [getLensId, showForm, isFrontCamera]);

    const cleanup = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }
        if (sessionRef.current) {
            sessionRef.current.pause();
            sessionRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (captureTimeoutRef.current) {
            clearTimeout(captureTimeoutRef.current);
            captureTimeoutRef.current = null;
        }
        if (recordedVideo) {
            URL.revokeObjectURL(recordedVideo.url);
        }
        if (photoCaptured) {
            URL.revokeObjectURL(photoCaptured.url);
        }
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setProcessingMedia(false);
        setIsRecording(false);
        setShowAdditionalControls(false);
        setCameraError(null);
    };

    const handleFormSubmit = () => {
        setShowForm(false);
    };

    const renderCameraControls = () => {
        if (showForm) return null;

        return (
            <>
                <div className="snap-watermark"></div>

                {isRecording && (
                    <div className="timer-container">
                        <div
                            className={`timer ${timeLeft <= 5 ? "animate" : ""}`}
                        >
                            {timeLeft}
                        </div>
                    </div>
                )}

                <div
                    className="camera-controls"
                    style={{ touchAction: "none" }}
                >
                    <button
                        className="camera-button"
                        onClick={toggleCamera}
                        disabled={processingMedia || isRecording}
                        aria-label="Switch camera"
                    >
                        <span className="material-symbols-rounded">
                            {isFrontCamera ? "camera_rear" : "camera_front"}
                        </span>
                    </button>

                    {showAdditionalControls ? (
                        <>
                            <button
                                className="record-button"
                                onClick={() => {
                                    setShowAdditionalControls(false);
                                    setRecordedVideo(null);
                                    setCameraError(null);
                                }}
                                disabled={processingMedia}
                                aria-label="New recording"
                            >
                                <span className="material-symbols-rounded">
                                    fiber_manual_record
                                </span>
                            </button>
                            <button
                                className="download-button"
                                onClick={handleDownload}
                                disabled={processingMedia}
                                aria-label="Download media"
                            >
                                <span className="material-symbols-rounded">
                                    download
                                </span>
                            </button>
                            <button
                                className="share-button"
                                onClick={handleShare}
                                disabled={processingMedia || !recordedVideo}
                                aria-label="Share media"
                            >
                                <span className="material-symbols-rounded">
                                    share
                                </span>
                            </button>
                        </>
                    ) : (
                        <button
                            className={`record-button ${isRecording ? "recording" : ""} ${
                                processingMedia ? "processing" : ""
                            }`}
                            onMouseDown={handleRecordPress}
                            onMouseUp={handleRecordRelease}
                            onTouchStart={(e) => {
                                e.preventDefault();
                                handleRecordPress();
                            }}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                handleRecordRelease();
                            }}
                            disabled={processingMedia}
                            aria-label={
                                isRecording
                                    ? "Stop recording"
                                    : "Start recording or take photo"
                            }
                        >
                            <span className="material-symbols-rounded">
                                {isRecording ? "stop" : "fiber_manual_record"}
                            </span>
                        </button>
                    )}
                </div>

                {processingMedia && (
                    <div className="processing-overlay" aria-live="polite">
                        <div
                            className="processing-spinner"
                            role="progressbar"
                        ></div>
                        <p>Processing media...</p>
                    </div>
                )}

                {cameraError && (
                    <div className="error-message" role="alert">
                        <div className="error-content">
                            <span className="material-symbols-rounded error-icon">
                                error
                            </span>
                            <p>{cameraError}</p>
                            <button
                                className="error-close"
                                onClick={() => setCameraError(null)}
                                aria-label="Close error message"
                            >
                                <span className="material-symbols-rounded">
                                    close
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="container">
            {showForm ? (
                <LeadCaptureForm onFormSubmit={handleFormSubmit} />
            ) : (
                <div className="video-container">
                    <div ref={videoRef} className="video-wrapper" />
                    {renderCameraControls()}
                </div>
            )}
        </div>
    );
};

export default SnapCamera;
