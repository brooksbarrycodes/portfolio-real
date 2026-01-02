import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './App.css';
import CurtainEffect from './CurtainEffect';
import ColorBends from './components/ColorBends';
import Particles from './components/Particles';
import FuzzyText from './components/FuzzyText';
import TextType from './components/TextType';

function App() {
  const PERF_MODE = true; // temporarily reduce lag by disabling mouse-driven effects
  const [selectedTrack, setSelectedTrack] = useState<any>(null);
  const [currentEyeIndex, setCurrentEyeIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentDirection, setCurrentDirection] = useState('center');
  const [normalizedPos, setNormalizedPos] = useState({ x: 0, y: 0 });
  const [debugZone, setDebugZone] = useState('');
  const [isYankeeGoHomePlaying, setIsYankeeGoHomePlaying] = useState(false);
  const [isTrack2Playing, setIsTrack2Playing] = useState(false);
  const [isTrack3Playing, setIsTrack3Playing] = useState(false);
  const [isTrack4Playing, setIsTrack4Playing] = useState(false);
  const [isTrack5Playing, setIsTrack5Playing] = useState(false);
  const [projectorOverlaySide, setProjectorOverlaySide] = useState<'left' | 'right' | null>(null);
  const [showProjectorYouTube, setShowProjectorYouTube] = useState(false);
  const [projectorYouTubeVideo, setProjectorYouTubeVideo] = useState('dQw4w9WgXcQ'); // YouTube video ID for alpha-left (change this to your desired video ID)
  const [showProjectorYouTubeRight, setShowProjectorYouTubeRight] = useState(false);
  const [projectorYouTubeVideoRight, setProjectorYouTubeVideoRight] = useState('otCpCn0l4Wo'); // YouTube video ID for alpha-right
  const [isTrack6Playing, setIsTrack6Playing] = useState(false);
  const [isDrumLooperPlaying, setIsDrumLooperPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [drumPattern, setDrumPattern] = useState({
    kick: new Array(16).fill(false),
    snare: new Array(16).fill(false),
    hihat: new Array(16).fill(false)
  });
  const [drumSoundVariants, setDrumSoundVariants] = useState({
    kick: 0,
    snare: 0,
    hihat: 0
  });
  const [textPulse, setTextPulse] = useState({
    kick: false,
    snare: false,
    hihat: false
  });
  const [laserShow, setLaserShow] = useState(false);
  const [currentBPM, setCurrentBPM] = useState(120);
  const [currentVHSVideo, setCurrentVHSVideo] = useState('/videos/VHS/loading-screen-vhs-short.mp4');
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);
  const [currentYouTubeVideo, setCurrentYouTubeVideo] = useState('IuCPDv0KK7U'); // Default: ACID LOVE
  const [showPositioningBox, setShowPositioningBox] = useState(false);
  const [boxPosition, setBoxPosition] = useState({ top: 20, right: 15, width: 40.5, height: 30 });
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [currentCurtainScene, setCurrentCurtainScene] = useState(1);
  const [isCurtainAnimating, setIsCurtainAnimating] = useState(false);
  const [currentScoresScene, setCurrentScoresScene] = useState(1);
  const [showFilmVideo, setShowFilmVideo] = useState(false);
  const [showCommercialVideo, setShowCommercialVideo] = useState(false);
  const [activeGuitarString, setActiveGuitarString] = useState<number | null>(null);
  const [fadingGuitarString, setFadingGuitarString] = useState<number | null>(null);
  const [fadingInGuitarString, setFadingInGuitarString] = useState<number | null>(null);
  const [debugPoint1, setDebugPoint1] = useState({ x: 101, y: 1636 });
  const [debugPoint2, setDebugPoint2] = useState({ x: 56, y: 4612 });
  const [isDragging, setIsDragging] = useState<'point1' | 'point2' | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const drumSequenceRef = useRef<any>(null);
  const drumSoundsRef = useRef<any>(null);
  const vhsVideoRef = useRef<HTMLVideoElement>(null);
  const curtainAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const scoresAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  
  // Audio refs for disc players
  const discAudioRefs = useRef<(HTMLAudioElement | null)[]>([]);
  const [playingDiscIndex, setPlayingDiscIndex] = useState<number | null>(null);
  // Title overlay switching
  const [titleIndex, setTitleIndex] = useState<0 | 1>(0);
  useEffect(() => {
    const id = setInterval(() => setTitleIndex((prev) => (prev === 0 ? 1 : 0)), 2000);
    return () => clearInterval(id);
  }, []);

  const [activeDiscTextIndex, setActiveDiscTextIndex] = useState<number | null>(null);
  const [hasClickedDiscText, setHasClickedDiscText] = useState<boolean[]>(() => new Array(6).fill(false));

  const scrollToSection = (selector: string) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTopVhsWithButtons = () => {
    const buttonsEl = document.querySelector('#videos-section .vhs-images-container');
    if (!buttonsEl) {
      scrollToSection('#videos-section');
      return;
    }
    const rect = buttonsEl.getBoundingClientRect();
    // Position the VHS buttons so they sit at the very bottom of the viewport (with a tiny padding).
    const padding = -12;
    const y = window.scrollY + rect.bottom - window.innerHeight + padding;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };

  const scrollToCdSectionBottom = () => {
    const el = document.querySelector('.disc-grid-section');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const padding = 0;
    const y = window.scrollY + rect.bottom - window.innerHeight + padding;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };

  const scrollToContactSectionBottom = () => {
    const el = document.querySelector('.contact-section');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const padding = 0;
    const y = window.scrollY + rect.bottom - window.innerHeight + padding;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  };

  const discTypedTexts = useMemo(
    () => [
      `YANKEE GO HOME\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.\n\nNeque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.`,
      `PROJ 993\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      `HOW IT GOT SO TOUGH\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nSed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.\n\nTotam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
      `THE PLAN\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nNemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.`,
      `WINDOWS DOWN\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\nAt vero eos et accusamus et iusto odio dignissimos ducimus.`,
      `PLACEHOLDER\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nSimilique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.\n\nEt harum quidem rerum facilis est et expedita distinctio.`,
    ],
    []
  );

  // CD section gap line (temporary): centered between section left edge and left-most CD image edge
  const discGridSectionRef = useRef<HTMLElement | null>(null);
  const [cdGapLineLeftPx, setCdGapLineLeftPx] = useState<number | null>(null);

  useEffect(() => {
    const section = discGridSectionRef.current;
    if (!section) return;

    const update = () => {
      const imgs = Array.from(section.querySelectorAll<HTMLImageElement>('.disc-image'));
      if (imgs.length == 0) return;

      const sectionLeft = section.getBoundingClientRect().left;
      const minDiscLeft = imgs.reduce((min, img) => Math.min(min, img.getBoundingClientRect().left), Number.POSITIVE_INFINITY);
      const relativeLeft = minDiscLeft - sectionLeft;
      if (!Number.isFinite(relativeLeft) || relativeLeft <= 0) return;

      setCdGapLineLeftPx(relativeLeft / 2);
    };

    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    const ro = new ResizeObserver(() => update());
    ro.observe(section);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, []);
  
  // Handle disc click to play audio
  const handleDiscClick = (trackIndex: number) => {
    setActiveDiscTextIndex(trackIndex);
    setHasClickedDiscText((prev) => {
      if (prev[trackIndex]) return prev;
      const next = [...prev];
      next[trackIndex] = true;
      return next;
    });
    // Stop all other tracks
    discAudioRefs.current.forEach((audio, index) => {
      if (audio && index !== trackIndex) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    
    // Play or pause the clicked track
    const audio = discAudioRefs.current[trackIndex];
    if (audio) {
      if (audio.paused) {
        audio.play();
        setPlayingDiscIndex(trackIndex);
      } else {
        audio.pause();
        setPlayingDiscIndex(null);
      }
    }
  };
  
  // Set up audio event listeners
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];
    
    discAudioRefs.current.forEach((audio, index) => {
      if (audio) {
        const handlePlay = () => setPlayingDiscIndex(index);
        const handlePause = () => setPlayingDiscIndex(null);
        const handleEnded = () => setPlayingDiscIndex(null);
        
        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);
        
        cleanupFunctions.push(() => {
          audio.removeEventListener('play', handlePlay);
          audio.removeEventListener('pause', handlePause);
          audio.removeEventListener('ended', handleEnded);
        });
      }
    });
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, []);
  
  // Scores animation function
  const startScoresAnimation = () => {
    const animateScores = () => {
      setCurrentScoresScene(prev => prev === 1 ? 2 : 1);
      scoresAnimationRef.current = setTimeout(animateScores, 300);
    };
    animateScores();
  };
  
  const stopScoresAnimation = () => {
    if (scoresAnimationRef.current) {
      clearTimeout(scoresAnimationRef.current);
      scoresAnimationRef.current = null;
    }
  };
  
  // Film sign click handler
  const handleFilmSignClick = () => {
    setShowFilmVideo(!showFilmVideo);
  };
  
  // Commercial sign click handler
  const handleCommercialSignClick = () => {
    setShowCommercialVideo(!showCommercialVideo);
  };
  
  // Exit sign click handler - closes all videos
  const handleExitSignClick = () => {
    setShowFilmVideo(false);
    setShowCommercialVideo(false);
  };
  
  // Guitar string click handler
  const handleGuitarStringClick = (stringNumber: number) => {
    console.log(`Guitar string ${stringNumber} clicked!`);
    
    // Always start a new animation sequence - clicks only induce effects, never terminate them
    setFadingInGuitarString(stringNumber);
    setActiveGuitarString(stringNumber);
    
    // Quick fade in (0.1 seconds)
    setTimeout(() => {
      setFadingInGuitarString(null);
    }, 100);
    
    // Show for 1.5 seconds, then start fading out
    setTimeout(() => {
      setFadingGuitarString(stringNumber);
      setActiveGuitarString(null);
      
      // Complete fade out after 4 seconds
      setTimeout(() => {
        setFadingGuitarString(null);
      }, 4000);
    }, 1500);
  };

  // Debug point dragging handlers
  const handleMouseDown = (point: 'point1' | 'point2', e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(point);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging === 'point1') {
      setDebugPoint1({ x, y });
    } else if (isDragging === 'point2') {
      setDebugPoint2({ x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };
  
  // Curtain animation functions
  const startCurtainAnimation = () => {
    if (isCurtainAnimating) return;
    
    // If any video is playing, always show scene 6 and don't animate
    if (showFilmVideo || showCommercialVideo) {
      setCurrentCurtainScene(6);
      return;
    }
    
    setIsCurtainAnimating(true);
    setCurrentCurtainScene(1);
    
    // Animate through scenes 2-5 (0.5 seconds each)
    const scenes = [2, 3, 4, 5];
    let sceneIndex = 0;
    
    const animateNextScene = () => {
      // Check again if video started playing during animation
      if (showFilmVideo || showCommercialVideo) {
        setCurrentCurtainScene(6);
        setIsCurtainAnimating(false);
        return;
      }
      
      if (sceneIndex < scenes.length) {
        setCurrentCurtainScene(scenes[sceneIndex]);
        sceneIndex++;
        curtainAnimationRef.current = setTimeout(animateNextScene, 500);
      } else {
        // Stay on scene 6 indefinitely
        setCurrentCurtainScene(6);
      }
    };
    
    curtainAnimationRef.current = setTimeout(animateNextScene, 500);
  };
  
  const stopCurtainAnimation = () => {
    if (curtainAnimationRef.current) {
      clearTimeout(curtainAnimationRef.current);
      curtainAnimationRef.current = null;
    }
    
    // Reverse animation: 6 -> 5 -> 4 -> 3 -> 2 -> 1
    const reverseScenes = [5, 4, 3, 2, 1];
    let sceneIndex = 0;
    
    const animateReverseScene = () => {
      if (sceneIndex < reverseScenes.length) {
        setCurrentCurtainScene(reverseScenes[sceneIndex]);
        sceneIndex++;
        curtainAnimationRef.current = setTimeout(animateReverseScene, 500);
      } else {
        // Animation complete
        setIsCurtainAnimating(false);
      }
    };
    
    // Start reverse animation immediately if we're on scene 6, otherwise just reset
    if (currentCurtainScene === 6) {
      curtainAnimationRef.current = setTimeout(animateReverseScene, 500);
    } else {
      setIsCurtainAnimating(false);
      setCurrentCurtainScene(1);
    }
  };
  
  // Smooth video switching function
  const switchVideoSmooth = (newVideoSrc: string) => {
    if (vhsVideoRef.current) {
      setIsVideoLoading(true);
      
      // Hide YouTube player and stop/eject button when switching between intro videos
      if (newVideoSrc === '/videos/VHS/ACID LOVE INTRO VHS.mp4' || 
          newVideoSrc === '/videos/VHS/ALL THE TIME INTRO VHS.mp4') {
        setShowYouTubePlayer(false);
      }
      
      setCurrentVHSVideo(newVideoSrc); // Update state for timing logic
      vhsVideoRef.current.pause();
      vhsVideoRef.current.currentTime = 0;
      vhsVideoRef.current.src = newVideoSrc;
      vhsVideoRef.current.load();
      
      vhsVideoRef.current.addEventListener('canplaythrough', () => {
        setIsVideoLoading(false);
        vhsVideoRef.current?.play();
      }, { once: true });
    }
  };
  
  // Eye images array - actual converted JPG files
  const eyeImages = [
    'IMG_9677.jpg', 'IMG_9678.jpg', 'IMG_9679.jpg', 'IMG_9680.jpg',
    'IMG_9681.jpg', 'IMG_9682.jpg', 'IMG_9683.jpg', 'IMG_9684.jpg',
    'IMG_9685.jpg', 'IMG_9686.jpg', 'IMG_9687.jpg', 'IMG_9688.jpg',
    'IMG_9689.jpg', 'IMG_9690.jpg'
  ];

  // Eye direction types
  type EyeDirection = 
    | 'top-left' | 'top-center' | 'top-right'
    | 'mid-top-left' | 'mid-top-center' | 'mid-top-right'
    | 'center-left' | 'center' | 'center-right'
    | 'mid-bottom-left' | 'mid-bottom-center' | 'mid-bottom-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right';

  // Eye direction mapping - using your specified image files
  const eyeDirectionMap: Record<EyeDirection, number> = {
    // Top row (looking up)
    'top-left': 6,      // IMG_9683.jpg
    'top-center': 7,    // IMG_9684.jpg
    'top-right': 8,     // IMG_9685.jpg
    
    // Middle-top row
    'mid-top-left': 6,  // IMG_9683.jpg
    'mid-top-center': 7, // IMG_9684.jpg
    'mid-top-right': 9, // IMG_9686.jpg
    
    // Center row (straight ahead)
    'center-left': 5,   // IMG_9682.jpg
    'center': 0,        // IMG_9677.jpg
    'center-right': 1,  // IMG_9678.jpg
    
    // Middle-bottom row
    'mid-bottom-left': 13,  // IMG_9690.jpg
    'mid-bottom-center': 11, // IMG_9688.jpg
    'mid-bottom-right': 10, // IMG_9687.jpg
    
    // Bottom row (looking down)
    'bottom-left': 11,  // IMG_9688.jpg
    'bottom-center': 11, // IMG_9688.jpg
    'bottom-right': 10  // IMG_9687.jpg
  };

  // Eye tracking based purely on page coordinates - no viewport dependency
  useEffect(() => {
    let eyeCenters: Array<{ x: number; y: number }> = [];
    
    // Calculate eye position once on load/resize
    const calculateEyePositions = () => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>('.eyes-section .eye-image'));
      eyeCenters = imgs.map((img) => {
        const rect = img.getBoundingClientRect();
        return {
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY + rect.height / 2,
        };
      });
    };
    
    // Calculate initial position
    calculateEyePositions();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateEyePositions);
    
    // Shared function to calculate eye direction based on mouse position
    const calculateEyeDirection = (mousePageX: number, mousePageY: number) => {
      if (eyeCenters.length === 0) return;
      // Pick the closest eye on the page to the mouse position (supports multiple eyes sections).
      let eyeCenterPageX = eyeCenters[0].x;
      let eyeCenterPageY = eyeCenters[0].y;
      let bestDist = Number.POSITIVE_INFINITY;
      for (const c of eyeCenters) {
        const dx = mousePageX - c.x;
        const dy = mousePageY - c.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < bestDist) {
          bestDist = d2;
          eyeCenterPageX = c.x;
          eyeCenterPageY = c.y;
        }
      }
      // Calculate distance from mouse to eye center in pure page coordinates
      const deltaX = mousePageX - eyeCenterPageX;
      const deltaY = mousePageY - eyeCenterPageY;
      
      // Store mouse position for debugging
      setMousePos({ x: mousePageX, y: mousePageY });
      
      // Define fixed zones around the eye image (in pixels)
      const zoneWidth = 400; // 400px left/right of eye center
      const zoneHeight = 300; // 300px up/down from eye center
      
      // Normalize based on fixed pixel zones
      const normalizedX = deltaX / zoneWidth;
      const normalizedY = deltaY / zoneHeight;
      
      // Store normalized position for debugging
      setNormalizedPos({ x: normalizedX, y: normalizedY });
      
      // Eye direction mapping based on pure page coordinates
      let eyeDirection: EyeDirection = 'center';
      
      // Define zones based on absolute pixel distances from eye center
      if (deltaY < -300) {
        // Far above eye (300px+ above)
        setDebugZone('far-top');
        if (deltaX < -200) {
          eyeDirection = 'top-left';
        } else if (deltaX > 200) {
          eyeDirection = 'top-right';
        } else {
          eyeDirection = 'top-center';
        }
      } else if (deltaY < -90) {
        // Above eye (90-300px above)
        setDebugZone('near-top');
        if (deltaX < -200) {
          eyeDirection = 'mid-top-left';
        } else if (deltaX > 200) {
          eyeDirection = 'mid-top-right';
        } else {
          eyeDirection = 'mid-top-center';
        }
      } else if (deltaY < 90) {
        // Level with eye (within 90px)
        setDebugZone('center');
        if (deltaX < -200) {
          eyeDirection = 'center-left';
        } else if (deltaX > 200) {
          eyeDirection = 'center-right';
        } else {
          eyeDirection = 'center';
        }
      } else if (deltaY < 300) {
        // Below eye (90-300px below)
        setDebugZone('near-bottom');
        if (deltaX < -200) {
          eyeDirection = 'mid-bottom-left';
        } else if (deltaX > 200) {
          eyeDirection = 'mid-bottom-right';
        } else {
          eyeDirection = 'mid-bottom-center';
        }
      } else {
        // Far below eye (300px+ below)
        setDebugZone(`far-bottom (deltaX: ${deltaX}px)`);
        if (deltaX < -120) {
          eyeDirection = 'bottom-left';
        } else if (deltaX > 120) {
          eyeDirection = 'bottom-right';
        } else {
          eyeDirection = 'bottom-center';
        }
      }
      
      const index = eyeDirectionMap[eyeDirection];
      setCurrentDirection(eyeDirection);
      setCurrentEyeIndex(index);
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Store last mouse position for scroll events
      lastMousePos.current = { x: e.pageX, y: e.pageY };
      
      // Calculate eye direction
      calculateEyeDirection(e.pageX, e.pageY);
    };

    const handleScroll = () => {
      // Recalculate eye positions when scrolling (in case layout changes)
      calculateEyePositions();
      
      // Force update with current mouse position during scroll
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (lastMousePos.current.x !== 0 || lastMousePos.current.y !== 0) {
          calculateEyeDirection(lastMousePos.current.x, lastMousePos.current.y);
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateEyePositions);
    };
  }, []);

  // Drum Looper useEffect - Initialize Tone.js and setup drum sounds
  useEffect(() => {
    // Initialize drum sounds using Tone.js
    const initializeDrumSounds = async () => {
      try {
        // Wait for Tone.js to be available
        if (typeof window !== 'undefined' && (window as any).Tone) {
          const Tone = (window as any).Tone;
          
          // Create kick sample players from real audio files
          const createKickVariants = () => {
            const kickFiles = [
              '347054__giomilko__kick-004.wav',
              '347069__giomilko__kick-019.wav',
              '347070__giomilko__kick-020.wav',
              '347079__giomilko__kick-027.wav',
              '347096__giomilko__kick-042.wav',
              '347104__giomilko__kick-049.wav',
              '353718__giomilko__kick-059.wav',
              '353719__giomilko__kick-058.wav',
              '353732__giomilko__kick-075.wav',
              '353736__giomilko__kick-079.wav',
              '353748__giomilko__kick-077.wav',
              '353755__giomilko__kick-074.wav',
              '353759__giomilko__kick-078.wav',
              // Repeat some files to get to 20 variants
              '347054__giomilko__kick-004.wav',
              '347069__giomilko__kick-019.wav',
              '347070__giomilko__kick-020.wav',
              '347079__giomilko__kick-027.wav',
              '347096__giomilko__kick-042.wav',
              '347104__giomilko__kick-049.wav',
              '353718__giomilko__kick-059.wav'
            ];
            
            return kickFiles.map(file => 
              new Tone.Player({
                url: require(`./drum sounds/kick/${file}`),
                volume: -8
              }).toDestination()
            );
          };

          // Create snare sample players from real audio files
          const createSnareVariants = () => {
            const snareFiles = [
              '208271__choomaque-crispydinner__ppu-snare-marker-116.wav',
              '208279__choomaque-crispydinner__ppu-snare-marker-6.wav',
              '208304__choomaque-crispydinner__ppu-snare-marker-22.wav',
              '208335__choomaque-crispydinner__ppu-snare-marker-31.wav',
              '208363__choomaque-crispydinner__ppu-snare-marker-153.wav',
              '208364__choomaque-crispydinner__ppu-snare-marker-154.wav',
              '208384__choomaque-crispydinner__ppu-snare-marker-163.wav',
              '208392__choomaque-crispydinner__ppu-snare-marker-44.wav',
              '208418__choomaque-crispydinner__ppu-snare-marker-145.wav',
              '208422__choomaque-crispydinner__ppu-snare-marker-141.wav',
              '208426__choomaque-crispydinner__ppu-snare-marker-138.wav',
              '39581__the_bizniss__snared-4.wav',
              '501249__logicogonist__brian-snare-loud.wav',
              // Repeat some files to get to 20 variants
              '208271__choomaque-crispydinner__ppu-snare-marker-116.wav',
              '208279__choomaque-crispydinner__ppu-snare-marker-6.wav',
              '208304__choomaque-crispydinner__ppu-snare-marker-22.wav',
              '208335__choomaque-crispydinner__ppu-snare-marker-31.wav',
              '208363__choomaque-crispydinner__ppu-snare-marker-153.wav',
              '208364__choomaque-crispydinner__ppu-snare-marker-154.wav',
              '208384__choomaque-crispydinner__ppu-snare-marker-163.wav'
            ];
            
            return snareFiles.map(file => 
              new Tone.Player({
                url: require(`./drum sounds/snare/${file}`),
                volume: -6
              }).toDestination()
            );
          };

          // Create hi-hat sample players from real audio files
          const createHihatVariants = () => {
            const hihatFiles = [
              '102781__mhc__acoustic_closed_hihat2.wav',
              '13248__ianhall__hihat-slushy.aiff',
              '140517__stomachache__closedhatphrase-001.wav',
              '183479__snapper4298__hihat_power.wav',
              '185033__casmarrav__reso-hihat.wav',
              '185302__casmarrav__belly-hi-hat.wav',
              '207914__altemark__open-hihat-2.wav',
              '44953__sascha-burghard__hihat-op1-c3000b-06.wav',
              '46149__sascha-burghard__hihat-cl-sm58-01.wav',
              '614391__jannevse__hihat_acccent1jazzy1.wav',
              '763444__okultix__mouth-hi-hat-with-zoom-h4n.wav',
              '815515__brokenmachinery__databent-closed-hihat-7.wav',
              // Repeat some files to get to 20 variants
              '102781__mhc__acoustic_closed_hihat2.wav',
              '13248__ianhall__hihat-slushy.aiff',
              '140517__stomachache__closedhatphrase-001.wav',
              '183479__snapper4298__hihat_power.wav',
              '185033__casmarrav__reso-hihat.wav',
              '185302__casmarrav__belly-hi-hat.wav',
              '207914__altemark__open-hihat-2.wav',
              '44953__sascha-burghard__hihat-op1-c3000b-06.wav'
            ];
            
            return hihatFiles.map(file => 
              new Tone.Player({
                url: require(`./drum sounds/hihat/${file}`),
                volume: -10
              }).toDestination()
            );
          };

          const kickVariants = createKickVariants();
          const snareVariants = createSnareVariants();
          const hihatVariants = createHihatVariants();

          const kick = kickVariants[drumSoundVariants.kick];
          const snare = snareVariants[drumSoundVariants.snare];
          const hihat = hihatVariants[drumSoundVariants.hihat];

          drumSoundsRef.current = { 
            kick, snare, hihat,
            kickVariants, snareVariants, hihatVariants
          };

          // Create the drum sequence with different pitches for kick variants
          const sequence = new Tone.Sequence((time: any, step: number) => {
            setCurrentStep(step);
            
            // Trigger sounds based on pattern
            if (drumPattern.kick[step]) {
              kick.start(time);
              // Trigger kick text pulse
              setTextPulse(prev => ({ ...prev, kick: true }));
              setTimeout(() => setTextPulse(prev => ({ ...prev, kick: false })), 150);
            }
            if (drumPattern.snare[step]) {
              snare.start(time);
              // Trigger snare text pulse
              setTextPulse(prev => ({ ...prev, snare: true }));
              setTimeout(() => setTextPulse(prev => ({ ...prev, snare: false })), 150);
            }
            if (drumPattern.hihat[step]) {
              hihat.start(time);
              // Trigger hihat text pulse
              setTextPulse(prev => ({ ...prev, hihat: true }));
              setTimeout(() => setTextPulse(prev => ({ ...prev, hihat: false })), 150);
            }
          }, Array.from({ length: 16 }, (_, i) => i), '4n');

          drumSequenceRef.current = sequence;

          // Set initial BPM
          Tone.Transport.bpm.value = 120;
        }
      } catch (error) {
        console.error('Error initializing drum sounds:', error);
      }
    };

    // Delay initialization to ensure Tone.js is loaded
    setTimeout(initializeDrumSounds, 100);

    return () => {
      // Cleanup
      if (drumSequenceRef.current) {
        drumSequenceRef.current.dispose();
      }
      if (drumSoundsRef.current) {
        Object.values(drumSoundsRef.current).forEach((synth: any) => {
          if (synth && typeof synth.dispose === 'function') {
          synth.dispose();
          }
        });
      }
      if (curtainAnimationRef.current) {
        clearTimeout(curtainAnimationRef.current);
      }
    };
  }, []);
  
  // Start scores animation on component mount
  useEffect(() => {
    startScoresAnimation();
    
    return () => {
      stopScoresAnimation();
    };
  }, []);
  
  // Handle curtain scene when video state changes
  useEffect(() => {
    if (showFilmVideo || showCommercialVideo) {
      setCurrentCurtainScene(6);
      // Stop any ongoing curtain animation
      if (curtainAnimationRef.current) {
        clearTimeout(curtainAnimationRef.current);
        curtainAnimationRef.current = null;
      }
      setIsCurtainAnimating(false);
    }
  }, [showFilmVideo, showCommercialVideo]);
  
  // Continuously ensure curtains stay on scene 6 when videos are playing
  useEffect(() => {
    const interval = setInterval(() => {
      if (showFilmVideo || showCommercialVideo) {
        setCurrentCurtainScene(6);
        // Stop any ongoing curtain animation
        if (curtainAnimationRef.current) {
          clearTimeout(curtainAnimationRef.current);
          curtainAnimationRef.current = null;
        }
        setIsCurtainAnimating(false);
      }
    }, 100); // Check every 100ms
    
    return () => clearInterval(interval);
  }, [showFilmVideo, showCommercialVideo]);

  // Update drum sequence when pattern changes
  useEffect(() => {
    if (drumSequenceRef.current && typeof window !== 'undefined' && (window as any).Tone) {
      const Tone = (window as any).Tone;
      
      // Dispose old sequence and create new one
      drumSequenceRef.current.dispose();
      
      const sequence = new Tone.Sequence((time: any, step: number) => {
        setCurrentStep(step);
        
        // Trigger sounds based on current pattern
        if (drumPattern.kick[step] && drumSoundsRef.current?.kick) {
          drumSoundsRef.current.kick.start(time);
          // Trigger kick text pulse
          setTextPulse(prev => ({ ...prev, kick: true }));
          setTimeout(() => setTextPulse(prev => ({ ...prev, kick: false })), 150);
        }
        if (drumPattern.snare[step] && drumSoundsRef.current?.snare) {
          drumSoundsRef.current.snare.start(time);
          // Trigger snare text pulse
          setTextPulse(prev => ({ ...prev, snare: true }));
          setTimeout(() => setTextPulse(prev => ({ ...prev, snare: false })), 150);
        }
        if (drumPattern.hihat[step] && drumSoundsRef.current?.hihat) {
          drumSoundsRef.current.hihat.start(time);
          // Trigger hihat text pulse
          setTextPulse(prev => ({ ...prev, hihat: true }));
          setTimeout(() => setTextPulse(prev => ({ ...prev, hihat: false })), 150);
        }
      }, Array.from({ length: 16 }, (_, i) => i), '4n');

      drumSequenceRef.current = sequence;

      // Start sequence if currently playing
      if (isDrumLooperPlaying) {
        sequence.start(0);
      }
    }
  }, [drumPattern, isDrumLooperPlaying]);

  // Handle drum looper transport controls
  useEffect(() => {
    const handlePlayClick = async (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Play button clicked'); // Debug log
      
      if (typeof window !== 'undefined' && (window as any).Tone) {
        const Tone = (window as any).Tone;
        
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
        
        if (drumSequenceRef.current) {
          drumSequenceRef.current.start(0);
          Tone.Transport.start();
          setIsDrumLooperPlaying(true);
        }
      }
    };

    const handlePauseClick = () => {
      if (typeof window !== 'undefined' && (window as any).Tone) {
        const Tone = (window as any).Tone;
        Tone.Transport.pause();
        setIsDrumLooperPlaying(false);
      }
    };

    const handleStopClick = () => {
      if (typeof window !== 'undefined' && (window as any).Tone) {
        const Tone = (window as any).Tone;
        Tone.Transport.stop();
        setIsDrumLooperPlaying(false);
        setCurrentStep(0);
      }
    };

    const handleClearClick = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('Clear button clicked'); // Debug log
      
      // Stop playback first
      if (typeof window !== 'undefined' && (window as any).Tone) {
        const Tone = (window as any).Tone;
        Tone.Transport.stop();
        setIsDrumLooperPlaying(false);
        setCurrentStep(0);
      }
      
      // Clear all drum patterns
      setDrumPattern({
        kick: new Array(16).fill(false),
        snare: new Array(16).fill(false),
        hihat: new Array(16).fill(false)
      });
      
      // Remove active class from all step buttons
      const stepButtons = document.querySelectorAll('.step-button');
      stepButtons.forEach(button => {
        button.classList.remove('active');
      });
    };

    const handleBpmChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const bpm = parseInt(target.value);
      setCurrentBPM(bpm);
      if (typeof window !== 'undefined' && (window as any).Tone) {
        const Tone = (window as any).Tone;
        Tone.Transport.bpm.value = bpm;
        
        // Update display
        const display = document.getElementById('bpm-display');
        if (display) display.textContent = bpm.toString();
      }
      
      // Update laser show BPM
      if (laserShow) {
        const laserShowElement = document.querySelector('.laser-show');
        if (laserShowElement) {
          (laserShowElement as HTMLElement).style.setProperty('--bpm', bpm.toString());
        }
      }
    };

    const handleStepClick = (e: Event) => {
      const target = e.target as HTMLButtonElement;
      const drum = target.dataset.drum;
      const step = parseInt(target.dataset.step || '0');
      
      // Only handle step buttons, not transport buttons
      if (drum && typeof step === 'number' && target.classList.contains('step-button')) {
        setDrumPattern(prev => ({
          ...prev,
          [drum]: prev[drum as keyof typeof prev].map((active, i) => 
            i === step ? !active : active
          )
        }));
        
        // Toggle visual state
        target.classList.toggle('active');
      }
    };

    const handleRefreshClick = (e: Event) => {
      const target = e.target as HTMLButtonElement;
      const drum = target.dataset.drum;
      
      if (drum && drumSoundsRef.current) {
        setDrumSoundVariants(prev => {
          const newVariant = (prev[drum as keyof typeof prev] + 1) % 20;
          
          // Update the current drum sound
          if (drum === 'kick') {
            drumSoundsRef.current.kick = drumSoundsRef.current.kickVariants[newVariant];
          } else if (drum === 'snare') {
            drumSoundsRef.current.snare = drumSoundsRef.current.snareVariants[newVariant];
          } else if (drum === 'hihat') {
            drumSoundsRef.current.hihat = drumSoundsRef.current.hihatVariants[newVariant];
          }
          
          return {
            ...prev,
            [drum]: newVariant
          };
        });
      }
    };

    // Add event listeners
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const clearBtn = document.getElementById('clear-btn');
    const bpmSlider = document.getElementById('bpm-slider');
    const stepButtons = document.querySelectorAll('.step-button');
    const refreshButtons = document.querySelectorAll('.refresh-btn');

    playBtn?.addEventListener('click', handlePlayClick);
    pauseBtn?.addEventListener('click', handlePauseClick);
    stopBtn?.addEventListener('click', handleStopClick);
    clearBtn?.addEventListener('click', handleClearClick);
    bpmSlider?.addEventListener('input', handleBpmChange);
    
    stepButtons.forEach(button => {
      button.addEventListener('click', handleStepClick);
    });

    refreshButtons.forEach(button => {
      button.addEventListener('click', handleRefreshClick);
    });

    return () => {
      // Cleanup event listeners
      playBtn?.removeEventListener('click', handlePlayClick);
      pauseBtn?.removeEventListener('click', handlePauseClick);
      stopBtn?.removeEventListener('click', handleStopClick);
      clearBtn?.removeEventListener('click', handleClearClick);
      bpmSlider?.removeEventListener('input', handleBpmChange);
      
      stepButtons.forEach(button => {
        button.removeEventListener('click', handleStepClick);
      });

      refreshButtons.forEach(button => {
        button.removeEventListener('click', handleRefreshClick);
      });
    };
  }, []);

  // Handle VHS video timing for YouTube player
  useEffect(() => {
    const videoElement = vhsVideoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      if (currentVHSVideo === '/videos/VHS/ACID LOVE INTRO VHS.mp4' && videoElement.currentTime >= 22) {
        setCurrentYouTubeVideo('IuCPDv0KK7U'); // ACID LOVE video
        setShowYouTubePlayer(true);
        // Remove the event listener after triggering
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
      if (currentVHSVideo === '/videos/VHS/ALL THE TIME INTRO VHS.mp4' && videoElement.currentTime >= 18) {
        setCurrentYouTubeVideo('GZ_NMxpq4BQ'); // ALL THE TIME video
        setShowYouTubePlayer(true);
        // Remove the event listener after triggering
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };

    const handleVideoEnded = () => {
      if (currentVHSVideo === '/videos/VHS/ACID LOVE OUTRO VHS.mp4' || 
          currentVHSVideo === '/videos/VHS/ALL THE TIME OUTRO VHS.mp4') {
        // Return to default looping video after outro finishes
        switchVideoSmooth('/videos/VHS/loading-screen-vhs-short.mp4');
      }
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('ended', handleVideoEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('ended', handleVideoEnded);
    };
  }, [currentVHSVideo]);

  const handleStopEject = () => {
    // Hide YouTube player and stop/eject button
    setShowYouTubePlayer(false);
    // Switch to appropriate outro video based on which intro was playing
    if (currentVHSVideo === '/videos/VHS/ACID LOVE INTRO VHS.mp4') {
      switchVideoSmooth('/videos/VHS/ACID LOVE OUTRO VHS.mp4');
    } else if (currentVHSVideo === '/videos/VHS/ALL THE TIME INTRO VHS.mp4') {
      switchVideoSmooth('/videos/VHS/ALL THE TIME OUTRO VHS.mp4');
    }
  };

  const trackData = [
    {
      id: 1,
      title: "YANKEE GO HOME",
      credits: "Produced, Vocals, Mixing, and Mastering by Brooks Barry",
      genre: "(Jazz/House/Rap)",
      description: "This is a detailed description of YANKEE GO HOME. Here you can include the full story behind the song, the inspiration, the recording process, collaborators involved, and any interesting details about the production. You can also mention the genre, the mood of the track, and what makes it special in your portfolio."
    },
    {
      id: 2,
      title: "PROJ. 993 W", 
      credits: "Produced by Brooks Barry • Featuring Artist Name",
      genre: "(Industrial/Hip-Hop/Rap)",
      description: "A comprehensive description of PROJ. 993 W with details about collaboration, the creative process, and the unique elements that make this track stand out. Include information about the featured artist, the recording sessions, and any notable achievements or recognition this track has received."
    },
    {
      id: 3,
      title: "HOW IT GOT SO TOUGH (DEMO 3)",
      credits: "Produced by Brooks Barry • Mastered by Mastering Engineer",
      genre: "(Hip-Hop/Rap)", 
      description: "Full details about HOW IT GOT SO TOUGH (DEMO 3), including the production journey, mastering process, and any notable achievements or recognition. Describe the genre, influences, and what makes this track special in your catalog."
    },
    {
      id: 4,
      title: "THE PLAN",
      featuring: "Placard",
      spotifyLink: "https://open.spotify.com/artist/2vOxAq7oxq3IhhFcGwLMlt",
      credits: "Produced by Brooks Barry • Co-written with Songwriter",
      description: "Complete information about THE PLAN, the songwriting collaboration, creative process, and additional details about the production and any notable features of this track."
    },
    {
      id: 5,
      title: "WINDOWS DOWN",
      credits: "Produced by Brooks Barry • Mastered by Brooks Barry",
      description: "Detailed description of WINDOWS DOWN, showcasing your full production capabilities from start to finish, including both production and mastering work on this track."
    },
    {
      id: 6,
      title: "ROCK AND ROLL (placeholder)",
      credits: "Produced by Brooks Barry • Mixed by Brooks Barry", 
      description: "Full details about ROCK AND ROLL (placeholder), demonstrating your versatility across genres and your skills in both production and mixing for this particular track."
    }
  ];

  return (
    <div className="portfolio">
        {/* Portrait Image Section - Top of Page (Background layer) */}
      <section className="portrait-section">
        <img
          src={require('./Photos/DSC_1009 2.jpg')}
          alt="Portrait"
          className="portrait-image"
        />
        {/* Disclaimer - overlayed on portrait */}
        <div className="disclaimer">
          All contents of this website were photographed, recorded, stylized, edited, coded, structured, and produced by Brooks Barry, unless otherwise stated
        </div>
      </section>
      
      {/* Content wrapper - scrolls over portrait but stays in place */}
      <div className="content-overlay">
      
      {/* Roles Text Section - Invisible section that scrolls over photo */}
      <section className="roles-section">
        <div className="roles-text">
          <button
            type="button"
            className="role-item"
            onClick={() => {
              setIsAboutExpanded(true);
              // Wait a tick so the expanded content affects layout before scrolling.
              requestAnimationFrame(() => scrollToSection('#about-me-section'));
            }}
          >
            Artist
          </button>
          <button type="button" className="role-item" onClick={scrollToCdSectionBottom}>
            Producer
          </button>
          <button type="button" className="role-item" onClick={scrollToTopVhsWithButtons}>
            Performer
          </button>
          <button type="button" className="role-item" onClick={() => scrollToSection('.projector-section')}>
            Video Producer
          </button>
          <button type="button" className="role-item" onClick={() => scrollToSection('.scoring-section')}>
            Content Creator
          </button>
          <button type="button" className="role-item" onClick={scrollToCdSectionBottom}>
            Mixing Engineer
          </button>
          <button type="button" className="role-item" onClick={scrollToCdSectionBottom}>
            Vocalist/Lyricist
          </button>
          <button type="button" className="role-item" onClick={() => scrollToSection('.scoring-section')}>
            Graphic Designer
          </button>
          <div className="roles-divider" />
          <button type="button" className="role-item" onClick={scrollToContactSectionBottom}>
            Contact
          </button>
        </div>
      </section>
      
      {/* New Section Above Hero */}
      <section id="about-me-section" className="new-section-above-hero">
        <div className="hero-about-bends-bg" aria-hidden="true">
          <ColorBends
                enableMouse={false}
            colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
            rotation={30}
            speed={0.3}
            scale={1.2}
            frequency={1.4}
            warpStrength={1.2}
            mouseInfluence={0.8}
            parallax={0.6}
            noise={0.08}
            transparent
            className=""
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div className="hero-about-bends-overlay" aria-hidden="true" />
        <div className="container">
          <h2 className="about-me-title">About Me</h2>
          <div className={`about-me-content ${isAboutExpanded ? 'expanded' : ''}`}>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p>
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
            </p>
            <p>
              Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
            </p>
            <p>
              Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.
            </p>
            <p>
              Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
            </p>
      </div>
          <button 
            className="read-more-btn"
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
          >
            {isAboutExpanded ? 'Read Less' : 'Read More'}
          </button>
        </div>
      </section>
      
      {/* Disc Grid Section */}
      <section className="disc-grid-section" ref={discGridSectionRef}>
        <div className="cd-particles-bg" aria-hidden="true">
          <Particles
                enableMouse={false}
                maxFps={24}
            count={90}
            mouseRadius={180}
            mouseForce={1.3}
            linkDistance={150}
            linkOpacity={0.35}
            className=""
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div className="cd-particles-overlay" aria-hidden="true" />
        {cdGapLineLeftPx != null && activeDiscTextIndex != null && hasClickedDiscText[activeDiscTextIndex] && (
          <>
                        <div
              className="cd-gap-textbox"
              style={{
                left: cdGapLineLeftPx,
                width: Math.max(120, cdGapLineLeftPx * 2 - 48),
              }}
            >
              <div className="cd-gap-textbox-inner">
                {discTypedTexts.map((txt, idx) => {
                  if (!hasClickedDiscText[idx]) return null;
                  const isActive = idx === activeDiscTextIndex;
                  return (
                    <div
                      key={idx}
                      className={`cd-disc-text ${isActive ? 'cd-disc-text--active' : 'cd-disc-text--inactive'}`}
                      aria-hidden={!isActive}
                    >
                      <TextType text={txt} cursor="|" speed={12} startDelay={0} cursorBlink hideCursorWhenDone={false} />
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        <div className="disc-grid-container">
          <div className="disc-grid">
            {/* Top row: Tracks 1, 2, 3 */}
            <div className="disc-wrapper" onClick={() => handleDiscClick(0)}>
              <div className={`disc-container ${playingDiscIndex === 0 ? 'spinning' : ''}`}>
                <img 
                  src={require('./amuse stores logos/disc.png')} 
                  alt="Disc" 
                  className="disc-image"
                />
                <svg className="disc-text-svg" viewBox="0 0 300 300">
                  <defs>
                    <path id="disc-curve" d="M 50,150 A 100,100 0 1,1 250,150" fill="none" />
                  </defs>
                  <text className="disc-text-curved">
                    <textPath href="#disc-curve" startOffset="50%">
                      <tspan textAnchor="middle">YANKEE GO HOME</tspan>
                    </textPath>
                  </text>
                </svg>
          </div>
              <audio ref={(el) => { discAudioRefs.current[0] = el; }} preload="metadata">
                <source src={require('./Tracks/YANKEE GO HOME master.wav')} type="audio/wav" />
              </audio>
          </div>
            <div className="disc-wrapper" onClick={() => handleDiscClick(1)}>
              <div className={`disc-container ${playingDiscIndex === 1 ? 'spinning' : ''}`}>
                <img 
                  src={require('./amuse stores logos/disc.png')} 
                  alt="Disc" 
                  className="disc-image"
                />
                <svg className="disc-text-svg" viewBox="0 0 300 300">
                  <defs>
                    <path id="disc-curve-2" d="M 50,150 A 100,100 0 1,1 250,150" fill="none" />
                  </defs>
                  <text className="disc-text-curved">
                    <textPath href="#disc-curve-2" startOffset="50%">
                      <tspan textAnchor="middle">PROJ 993</tspan>
                    </textPath>
                  </text>
                </svg>
          </div>
              <audio ref={(el) => { discAudioRefs.current[1] = el; }} preload="metadata">
                <source src={require('./Tracks/proj 993 w into.wav')} type="audio/wav" />
              </audio>
          </div>
            <div className="disc-wrapper" onClick={() => handleDiscClick(2)}>
              <div className={`disc-container ${playingDiscIndex === 2 ? 'spinning' : ''}`}>
                <img 
                  src={require('./amuse stores logos/disc.png')} 
                  alt="Disc" 
                  className="disc-image"
                />
                <svg className="disc-text-svg" viewBox="0 0 300 300">
                  <defs>
                    <path id="disc-curve-3" d="M 30,150 A 120,120 0 1,1 270,150" fill="none" />
                  </defs>
                  <text className="disc-text-curved disc-text-long">
                    <textPath href="#disc-curve-3" startOffset="50%">
                      <tspan textAnchor="middle">how it got so tough</tspan>
                    </textPath>
                  </text>
                </svg>
          </div>
              <audio ref={(el) => { discAudioRefs.current[2] = el; }} preload="metadata">
                <source src={require('./Tracks/how it got so tough rough demo 3.wav')} type="audio/wav" />
              </audio>
          </div>
            {/* Bottom row: Tracks 4, 5, 6 */}
            <div className="disc-wrapper" onClick={() => handleDiscClick(3)}>
              <div className={`disc-container ${playingDiscIndex === 3 ? 'spinning' : ''}`}>
                <img 
                  src={require('./amuse stores logos/disc.png')} 
                  alt="Disc" 
                  className="disc-image"
                />
                <svg className="disc-text-svg" viewBox="0 0 300 300">
                  <defs>
                    <path id="disc-curve-4" d="M 50,150 A 100,100 0 1,1 250,150" fill="none" />
                  </defs>
                  <text className="disc-text-curved">
                    <textPath href="#disc-curve-4" startOffset="50%">
                      <tspan textAnchor="middle">the Plan</tspan>
                    </textPath>
                  </text>
                </svg>
          </div>
              <audio ref={(el) => { discAudioRefs.current[3] = el; }} preload="metadata">
                <source src={require('./Tracks/the plan explicit MASTER 2.wav')} type="audio/wav" />
              </audio>
          </div>
            <div className="disc-wrapper" onClick={() => handleDiscClick(4)}>
              <div className={`disc-container ${playingDiscIndex === 4 ? 'spinning' : ''}`}>
                <img 
                  src={require('./amuse stores logos/disc.png')} 
                  alt="Disc" 
                  className="disc-image"
                />
                <svg className="disc-text-svg" viewBox="0 0 300 300">
                  <defs>
                    <path id="disc-curve-5" d="M 50,150 A 100,100 0 1,1 250,150" fill="none" />
                  </defs>
                  <text className="disc-text-curved">
                    <textPath href="#disc-curve-5" startOffset="50%">
                      <tspan textAnchor="middle">WINDOWS DOWN</tspan>
                    </textPath>
                  </text>
                </svg>
          </div>
              <audio ref={(el) => { discAudioRefs.current[4] = el; }} preload="metadata">
                <source src={require('./Tracks/WINDOWS DOWN master 6.wav')} type="audio/wav" />
              </audio>
          </div>
            <div className="disc-wrapper" onClick={() => handleDiscClick(5)}>
              <div className={`disc-container ${playingDiscIndex === 5 ? 'spinning' : ''}`}>
                <img 
                  src={require('./amuse stores logos/disc.png')} 
                  alt="Disc" 
                  className="disc-image"
                />
                <svg className="disc-text-svg" viewBox="0 0 300 300">
                  <defs>
                    <path id="disc-curve-6" d="M 50,150 A 100,100 0 1,1 250,150" fill="none" />
                  </defs>
                  <text className="disc-text-curved">
                    <textPath href="#disc-curve-6" startOffset="50%">
                      <tspan textAnchor="middle">placeholder</tspan>
                    </textPath>
                  </text>
                </svg>
          </div>
              <audio ref={(el) => { discAudioRefs.current[5] = el; }} preload="metadata">
                <source src={require('./Tracks/electric guitar wet 70 bpm.wav')} type="audio/wav" />
              </audio>
          </div>
        </div>
          </div>
      </section>
      {/* VHS Section */}
      <section id="videos-section" className="vhs-section">
        <div className="vhs-video-container">
          <video
            ref={vhsVideoRef}
            className="vhs-video"
            autoPlay
            loop={currentVHSVideo === '/videos/VHS/loading-screen-vhs-short.mp4'}
            muted
            playsInline
            src={currentVHSVideo}
          />
          {showYouTubePlayer && (
            <>
              <div
                className="vhs-youtube-overlay"
                style={{
                  top: `${boxPosition.top}%`,
                  right: `${boxPosition.right}%`,
                  width: `${boxPosition.width}%`,
                  paddingBottom: `${boxPosition.height}%`
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentYouTubeVideo}?autoplay=1`}
                  title="Music Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <img
                src="/videos/VHS/stop_ejects VHS png.png"
                alt="Stop/Eject"
                className="vhs-stop-eject-btn"
                onClick={handleStopEject}
                style={{
                  top: `calc(${boxPosition.top + boxPosition.height + 1}% + 250px)`,
                  right: `${boxPosition.right + boxPosition.width / 2 - boxPosition.width / 6}%`,
                  width: `${boxPosition.width / 3}%`,
                  cursor: 'pointer'
                }}
              />
            </>
          )}
          {showPositioningBox && (
            <div
              className="vhs-positioning-box"
              style={{
                top: `${boxPosition.top}%`,
                right: `${boxPosition.right}%`,
                width: `${boxPosition.width}%`,
                paddingBottom: `${boxPosition.height}%`
              }}
            >
              <div className="positioning-label">YouTube Player Position</div>
            </div>
          )}
        </div>

        {showPositioningBox && (
          <div className="positioning-controls">
            <h4>Adjust YouTube Player Position:</h4>
            <div className="control-row">
              <label>Top: {boxPosition.top}%</label>
              <input
                type="range"
                min="0"
                max="80"
                step="0.5"
                value={boxPosition.top}
                onChange={(e) => setBoxPosition({ ...boxPosition, top: parseFloat(e.target.value) })}
              />
            </div>
            <div className="control-row">
              <label>Right: {boxPosition.right}%</label>
              <input
                type="range"
                min="0"
                max="80"
                step="0.5"
                value={boxPosition.right}
                onChange={(e) => setBoxPosition({ ...boxPosition, right: parseFloat(e.target.value) })}
              />
            </div>
            <div className="control-row">
              <label>Width: {boxPosition.width}%</label>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={boxPosition.width}
                onChange={(e) => setBoxPosition({ ...boxPosition, width: parseFloat(e.target.value) })}
              />
            </div>
            <div className="control-row">
              <label>Height: {boxPosition.height}%</label>
              <input
                type="range"
                min="5"
                max="50"
                step="0.5"
                value={boxPosition.height}
                onChange={(e) => setBoxPosition({ ...boxPosition, height: parseFloat(e.target.value) })}
              />
            </div>
            <button className="hide-positioning-btn" onClick={() => setShowPositioningBox(false)}>
              Hide Positioning Box (Click ACID LOVE to show again)
            </button>
            <div className="positioning-values">
              Current values: top: {boxPosition.top}%, right: {boxPosition.right}%, width: {boxPosition.width}%, height: {boxPosition.height}%
            </div>
          </div>
        )}

        <div className="vhs-images-container">
          <img
            src="/videos/VHS/ACID LOVE OFFICIAL VIDEO PNG.png"
            alt="Acid Love Official Video"
            className="vhs-image vhs-image-clickable"
            onClick={() => switchVideoSmooth('/videos/VHS/ACID LOVE INTRO VHS.mp4')}
            style={{ cursor: 'pointer' }}
          />
          <img
            src="/videos/VHS/ALL THE TIME OFFICIAL VIDEO PNG.png"
            alt="All The Time Official Video"
            className="vhs-image vhs-image-clickable"
            onClick={() => switchVideoSmooth('/videos/VHS/ALL THE TIME INTRO VHS.mp4')}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </section>







      {/* Projector Section */}
      <section
        className="projector-section"
        onMouseMove={(e) => {
          const side = e.clientX < window.innerWidth / 2 ? 'left' : 'right';
          setProjectorOverlaySide(side);
        }}
        onMouseLeave={() => setProjectorOverlaySide(null)}
      >
        <video
          className="projector-video"
          src="/videos/main-loop.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />

        {/* Video Projects title overlay */}
        {/* Title overlays that alternate every 3s */}
        <img
          className={"projector-title-overlay" + (titleIndex === 0 ? "" : " hidden")}
          src="/images/video-projects.png"
          alt="Video Projects Title"
        />
        <img
          className={"projector-title-overlay" + (titleIndex === 1 ? "" : " hidden")}
          src="/images/video-projects-2.png"
          alt="Video Projects Title 2"
        />

        <video
          className={"projector-overlay-video projector-overlay-video--left" + (projectorOverlaySide === 'left' ? ' projector-overlay-video--active' : '')}
          src="/videos/alpha-left.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onClick={() => {
            if (projectorOverlaySide === 'left') {
              setShowProjectorYouTube(true);
            }
          }}
          style={{ cursor: projectorOverlaySide === 'left' ? 'pointer' : 'default' }}
        />

        <video
          className={"projector-overlay-video projector-overlay-video--right" + (projectorOverlaySide === 'right' ? ' projector-overlay-video--active' : '')}
          src="/videos/alpha-right.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onClick={() => {
            if (projectorOverlaySide === 'right') {
              setShowProjectorYouTubeRight(true);
            }
          }}
          style={{ cursor: projectorOverlaySide === 'right' ? 'pointer' : 'default' }}
        />

        <img
          className={"projector-poster-image projector-poster-image--right" + (projectorOverlaySide === 'left' ? ' projector-poster-image--active' : '')}
          src="/images/TIC TAC TOE movie poster 2.png"
          alt="TIC TAC TOE movie poster"
        />

        <img
          className={"projector-poster-image projector-poster-image--left" + (projectorOverlaySide === 'right' ? ' projector-poster-image--active' : '')}
          src="/images/super seniors directors note 2.png"
          alt="Super Seniors directors note"
        />

        {showProjectorYouTube && (
          <>
            <div className="projector-youtube-overlay">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${projectorYouTubeVideo}?autoplay=1`}
                title="YouTube Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <button
              className="projector-youtube-close-btn"
              onClick={() => setShowProjectorYouTube(false)}
            >
              ×
            </button>
          </>
        )}

        {showProjectorYouTubeRight && (
          <>
            <div className="projector-youtube-overlay">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${projectorYouTubeVideoRight}?autoplay=1`}
                title="YouTube Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <button
              className="projector-youtube-close-btn"
              onClick={() => setShowProjectorYouTubeRight(false)}
            >
              ×
            </button>
          </>
        )}
      </section>

      {/* Eyes Section (copy) - directly above Contact */}
      <section className="eyes-section">
        <img
          src={require(`./eyes/${eyeImages[currentEyeIndex]}`)}
          alt="Eye tracking mouse movement"
          className="eye-image"
        />
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-galaxy-background">
        </div>
        <div className="contact-container">
          <div className="contact-title">
            <FuzzyText fontSize="clamp(2.8rem, 7vw, 5rem)" fontWeight={900} color="#E9F2F2" enableHover={true}>
              LET'S WORK!
            </FuzzyText>
          </div>

          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="form-row">
              <label>Name</label>
              <input type="text" name="name" required />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input type="email" name="email" required />
            </div>
            <div className="form-row">
              <label>Message</label>
              <textarea name="message" rows={6} required />
            </div>
            <button type="submit">Send</button>
          </form>
        </div>
      </section>

      {/* Scoring Section */}
      <section 
        className="scoring-section"
        onMouseEnter={startCurtainAnimation}
        onMouseLeave={stopCurtainAnimation}
      >
        {/* Curtains Overlay */}
        <div className="scoring-curtains-overlay">
          <img 
            src={`/overlays/curtains scene ${currentCurtainScene}.png`}
            alt="Theatrical curtains overlay" 
            className="curtains-image"
          />
        </div>
        
        {/* Scores Overlay */}
        <div className="scoring-scores-overlay">
          <img 
            src={`/overlays/scores scene ${currentScoresScene}.png`}
            alt="Musical scores overlay" 
            className="scores-image"
          />
        </div>
        
        {/* Film Sign Overlay */}
        <div className="scoring-film-sign-overlay" onClick={handleFilmSignClick}>
          <img 
            src="/overlays/film sign.png"
            alt="Film Sign"
            className="film-sign-image"
          />
          </div>
      </section>

      {/* Drum Looper Section */}
      <section className="drum-looper-section">
        <div className="container">
            <h1 className={`challenge-title ${textPulse.kick ? 'pulse-kick' : ''}`}>VERSATILITY TEST</h1>
            <h2 className={`challenge-subtitle ${textPulse.snare ? 'pulse-snare' : ''}`}>I can rap on any beat in the world</h2>
            <p className={`challenge-instructions ${textPulse.hihat ? 'pulse-hihat' : ''}`}>Make your own drum loop, and I'll rap over it</p>

          {/* BPM Control */}
          <div className="bpm-control">
            <label htmlFor="bpm-slider">BPM: {currentBPM}</label>
            <input
              type="range"
              id="bpm-slider"
              min="60"
              max="180"
              value={currentBPM}
              onChange={(e) => setCurrentBPM(Number(e.target.value))}
              className="bpm-slider"
            />
          </div>

          {/* Play/Pause Button */}
          <div className="play-controls">
            <button 
              className={`play-btn ${isDrumLooperPlaying ? 'playing' : ''}`}
              onClick={() => setIsDrumLooperPlaying(!isDrumLooperPlaying)}
            >
              {isDrumLooperPlaying ? '⏸ PAUSE' : '▶ PLAY'}
            </button>
          </div>

          {/* Drum Grid */}
          <div className="drum-grid">
            {/* Beat Lines - Vertical dotted lines every 8 steps (every 2 bars) */}
            <div className="beat-lines">
              <div className="beat-line beat-line-1"></div>
              <div className="beat-line beat-line-2"></div>
              <div className="beat-line beat-line-3"></div>
        </div>
            
            {/* Step Numbers */}
            <div className="step-numbers">
              <div className="step-spacer"></div>
              <div className="step-spacer"></div>
              {[...Array(16)].map((_, i) => (
                <div key={i} className="step-number">{i + 1}</div>
              ))}
            </div>

            {/* Kick Row */}
            <div className="drum-row">
              <button className="refresh-btn" data-drum="kick" title="New kick sound">
                <svg className="refresh-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12a8 8 0 0 1 8-8V2.5L14.5 5 12 7.5V6a6 6 0 1 0-6 6H4z" fill="currentColor"/>
                  <path d="M20 12a8 8 0 0 1-8 8v1.5L9.5 19 12 16.5V18a6 6 0 1 0 6-6h2z" fill="currentColor"/>
                </svg>
              </button>
              <div className="drum-label">Kick</div>
              {[...Array(16)].map((_, i) => (
                <button 
                  key={`kick-${i}`} 
                  className={`step-button ${drumPattern.kick[i] ? 'active' : ''} ${currentStep === i ? 'current' : ''}`}
                  data-drum="kick" 
                  data-step={i}
                >
                </button>
              ))}
            </div>

            {/* Snare Row */}
            <div className="drum-row">
              <button className="refresh-btn" data-drum="snare" title="New snare sound">
                <svg className="refresh-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12a8 8 0 0 1 8-8V2.5L14.5 5 12 7.5V6a6 6 0 1 0-6 6H4z" fill="currentColor"/>
                  <path d="M20 12a8 8 0 0 1-8 8v1.5L9.5 19 12 16.5V18a6 6 0 1 0 6-6h2z" fill="currentColor"/>
                </svg>
              </button>
              <div className="drum-label">Snare</div>
              {[...Array(16)].map((_, i) => (
                <button 
                  key={`snare-${i}`} 
                  className={`step-button ${drumPattern.snare[i] ? 'active' : ''} ${currentStep === i ? 'current' : ''}`}
                  data-drum="snare" 
                  data-step={i}
                >
                </button>
              ))}
            </div>

            {/* Hi-Hat Row */}
            <div className="drum-row">
              <button className="refresh-btn" data-drum="hihat" title="New hi-hat sound">
                <svg className="refresh-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12a8 8 0 0 1 8-8V2.5L14.5 5 12 7.5V6a6 6 0 1 0-6 6H4z" fill="currentColor"/>
                  <path d="M20 12a8 8 0 0 1-8 8v1.5L9.5 19 12 16.5V18a6 6 0 1 0 6-6h2z" fill="currentColor"/>
                </svg>
              </button>
              <div className="drum-label">Hi-Hat</div>
              {[...Array(16)].map((_, i) => (
                <button 
                  key={`hihat-${i}`} 
                  className={`step-button ${drumPattern.hihat[i] ? 'active' : ''} ${currentStep === i ? 'current' : ''}`}
                  data-drum="hihat" 
                  data-step={i}
                >
                </button>
              ))}
            </div>
          </div>

          {/* Current Step Indicator */}
          <div className="current-step-indicator">
            <div className="step-indicator-track">
              {[...Array(16)].map((_, i) => (
                <div key={i} className={`step-indicator ${currentStep === i ? 'current' : ''}`} data-step={i}></div>
              ))}
            </div>
          </div>

          {/* Light Show Button */}
          <div className="light-show-controls">
            <button 
              id="light-btn" 
              className={`light-btn ${laserShow ? 'active' : ''}`}
              onClick={() => setLaserShow(!laserShow)}
            >
              {laserShow ? '⚡ STOP LIGHT SHOW' : '💡 START LIGHT SHOW'}
            </button>
          </div>

          {/* Professional Light Show */}
          {laserShow && (
            <div className="concert-lights" style={{'--bpm': currentBPM} as React.CSSProperties}>
              {/* Main Stage Wash Lights */}
              <div className="stage-wash wash-left"></div>
              <div className="stage-wash wash-center"></div>
              <div className="stage-wash wash-right"></div>
              
              {/* Moving Head Spotlights */}
              <div className="moving-head head-1"></div>
              <div className="moving-head head-2"></div>
              <div className="moving-head head-3"></div>
              <div className="moving-head head-4"></div>
              
              {/* LED Strip Chases */}
              <div className="led-strip strip-top"></div>
              <div className="led-strip strip-bottom"></div>
              <div className="led-strip strip-left"></div>
              <div className="led-strip strip-right"></div>
              
              {/* Rhythmic Pulse Lights */}
              <div className="pulse-light pulse-1"></div>
              <div className="pulse-light pulse-2"></div>
              <div className="pulse-light pulse-3"></div>
              <div className="pulse-light pulse-4"></div>
              
              {/* Color Chase Beams */}
              <div className="chase-beam beam-1"></div>
              <div className="chase-beam beam-2"></div>
              <div className="chase-beam beam-3"></div>
              <div className="chase-beam beam-4"></div>
              <div className="chase-beam beam-5"></div>
              <div className="chase-beam beam-6"></div>
              
              {/* Atmospheric Haze Effect */}
              <div className="haze-layer"></div>
            </div>
          )}
        </div>
      </section>

      {/* DAWs Section */}
      <section id="daws-section" className="daws-section">
        <div className="container">
          <h3>DAWs/Software</h3>
          <div className="daws-scroll-container">
          <div className="daws-grid">
              {/* First set */}
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/fl studio logo.png')}
                  alt="FL Studio"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">FL Studio</h4>
              </div>
              
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Logic_Pro_icon.png')}
                  alt="Logic Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Logic Pro</h4>
              </div>
              
            <div className="daw-item">
              <div className="daw-logo-placeholder">
                <div className="logo-content">
                    <div className="logo-icon">🎚️</div>
                    <p>DAW Logo 3</p>
                </div>
              </div>
                <h4 className="daw-name">Adobe Audition</h4>
            </div>
            
            <div className="daw-item">
              <div className="daw-logo-placeholder">
                <div className="logo-content">
                    <div className="logo-icon">🎨</div>
                    <p>Software Logo 1</p>
                </div>
              </div>
                <h4 className="daw-name">Adobe Photoshop</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Premiere_Pro_CC_icon.svg.png')}
                  alt="Adobe Premiere Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Premiere Pro</h4>
          </div>
              
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/final-cut-pro-logo-hd.png')}
                  alt="Final Cut Pro"
              style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Final Cut Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/cursor-logo-icon-freelogovectors.net_.png')}
                  alt="Cursor"
            style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Cursor</h4>
              </div>

              {/* Duplicate set for infinite scroll */}
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/fl studio logo.png')}
                  alt="FL Studio"
              style={{
                    width: '150px',
                    height: '150px',
                objectFit: 'contain',
              }}
            />
                <h4 className="daw-name">FL Studio</h4>
          </div>
              
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Logic_Pro_icon.png')}
                  alt="Logic Pro"
            style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Logic Pro</h4>
              </div>
              
            <div className="daw-item">
              <div className="daw-logo-placeholder">
                <div className="logo-content">
                  <div className="logo-icon">🎚️</div>
                  <p>DAW Logo 3</p>
                </div>
              </div>
              <h4 className="daw-name">Adobe Audition</h4>
            </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Photoshop_CC_icon.svg.png')}
                  alt="Adobe Photoshop"
              style={{
                    width: '150px',
                    height: '150px',
                objectFit: 'contain',
              }}
            />
                <h4 className="daw-name">Adobe Photoshop</h4>
          </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Premiere_Pro_CC_icon.svg.png')}
                  alt="Adobe Premiere Pro"
            style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Premiere Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/final-cut-pro-logo-hd.png')}
                  alt="Final Cut Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Final Cut Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/cursor-logo-icon-freelogovectors.net_.png')}
                  alt="Cursor"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Cursor</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h3>About Me</h3>
          <p className="bio">
            Add your professional bio here. Describe your musical background, 
            experience, and what makes you unique as a musician.
          </p>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="tracks-section" className="portfolio-section">
        <div className="container">
          <h3>Tracks</h3>
          
          {/* Guitar Credit */}
          
          
          {/* Guitar Sticker */}
          <div className="guitar-sticker-container" style={{ top: 'calc(50% + 3500px)' }}>
            <img
              src={require('./amuse stores logos/guitar sticker.png')}
              alt="Guitar Sticker"
              className="guitar-sticker"
            />
          </div>
              
            {/* Clickable String 1 - Fixed Position */}
            <div
              className={`guitar-string string-1 ${activeGuitarString === 1 ? 'active' : ''}`}
              style={{
                position: 'absolute',
                left: 101,
                top: 686,
                width: Math.sqrt(Math.pow(56 - 101, 2) + Math.pow(4612 - 1636, 2)),
                height: '8px',
                backgroundColor: 'transparent',
                transformOrigin: '0 0',
                transform: `rotate(${Math.atan2(4612 - 1636, 56 - 101)}rad)`,
                zIndex: 9998,
                cursor: 'pointer',
              }}
              onClick={() => handleGuitarStringClick(1)}
            ></div>

        {/* Guitar String 1 Overlay - Shows when clicked */}
        {(activeGuitarString === 1 || fadingGuitarString === 1 || fadingInGuitarString === 1) && (
          <div
            className={`guitar-string-overlay string-1-overlay ${fadingGuitarString === 1 ? 'fading-out' : ''} ${fadingInGuitarString === 1 ? 'fading-in' : ''}`}
            style={{
              position: 'absolute',
              right: '-470px',
              top: 'calc(50% + 1650px)',
              transform: 'translateY(-50%)',
              height: '1400px',
              width: 'auto',
              zIndex: 10000,
              cursor: 'pointer',
              transition: fadingInGuitarString === 1 ? 'opacity 0.1s ease-in' : 'opacity 4s ease-out',
              opacity: fadingGuitarString === 1 ? 0 : fadingInGuitarString === 1 ? 0 : 1,
              pointerEvents: 'none',
            }}
          >
            <img
              src={require('./amuse stores logos/guitar string 1.png')}
              alt="Guitar String 1"
              style={{
                height: '1400px',
                width: 'auto',
                transform: 'rotate(270deg)',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Guitar String 2 Overlay - Shows when clicked */}
        {(activeGuitarString === 2 || fadingGuitarString === 2 || fadingInGuitarString === 2) && (
          <div
            className={`guitar-string-overlay string-2-overlay ${fadingGuitarString === 2 ? 'fading-out' : ''} ${fadingInGuitarString === 2 ? 'fading-in' : ''}`}
            style={{
              position: 'absolute',
              right: '-470px',
              top: 'calc(50% + 1650px)',
              transform: 'translateY(-50%)',
              height: '1400px',
              width: 'auto',
              zIndex: 10000,
              cursor: 'pointer',
              transition: fadingInGuitarString === 2 ? 'opacity 0.1s ease-in' : 'opacity 4s ease-out',
              opacity: fadingGuitarString === 2 ? 0 : fadingInGuitarString === 2 ? 0 : 1,
              pointerEvents: 'none',
            }}
          >
            <img
              src={require('./amuse stores logos/guitar string 2.png')}
              alt="Guitar String 2"
              style={{
                height: '1400px',
                width: 'auto',
                transform: 'rotate(270deg)',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Guitar String 3 Overlay - Shows when clicked */}
        {(activeGuitarString === 3 || fadingGuitarString === 3 || fadingInGuitarString === 3) && (
          <div
            className={`guitar-string-overlay string-3-overlay ${fadingGuitarString === 3 ? 'fading-out' : ''} ${fadingInGuitarString === 3 ? 'fading-in' : ''}`}
            style={{
              position: 'absolute',
              right: '-470px',
              top: 'calc(50% + 1650px)',
              transform: 'translateY(-50%)',
              height: '1400px',
              width: 'auto',
              zIndex: 10000,
              cursor: 'pointer',
              transition: fadingInGuitarString === 3 ? 'opacity 0.1s ease-in' : 'opacity 4s ease-out',
              opacity: fadingGuitarString === 3 ? 0 : fadingInGuitarString === 3 ? 0 : 1,
              pointerEvents: 'none',
            }}
          >
            <img
              src={require('./amuse stores logos/guitar string 3 real.png')}
              alt="Guitar String 3"
              style={{
                height: '1400px',
                width: 'auto',
                transform: 'rotate(270deg)',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Guitar String 4 Overlay - Shows when clicked */}
        {(activeGuitarString === 4 || fadingGuitarString === 4 || fadingInGuitarString === 4) && (
          <div
            className={`guitar-string-overlay string-4-overlay ${fadingGuitarString === 4 ? 'fading-out' : ''} ${fadingInGuitarString === 4 ? 'fading-in' : ''}`}
            style={{
              position: 'absolute',
              right: '-470px',
              top: 'calc(50% + 1650px)',
              transform: 'translateY(-50%)',
              height: '1400px',
              width: 'auto',
              zIndex: 10000,
              cursor: 'pointer',
              transition: fadingInGuitarString === 4 ? 'opacity 0.1s ease-in' : 'opacity 4s ease-out',
              opacity: fadingGuitarString === 4 ? 0 : fadingInGuitarString === 4 ? 0 : 1,
              pointerEvents: 'none',
            }}
          >
            <img
              src={require('./amuse stores logos/guitar string 4 real.png')}
              alt="Guitar String 4"
              style={{
                height: '1400px',
                width: 'auto',
                transform: 'rotate(270deg)',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Guitar String 5 Overlay - Shows when clicked */}
        {(activeGuitarString === 5 || fadingGuitarString === 5 || fadingInGuitarString === 5) && (
          <div
            className={`guitar-string-overlay string-5-overlay ${fadingGuitarString === 5 ? 'fading-out' : ''} ${fadingInGuitarString === 5 ? 'fading-in' : ''}`}
            style={{
              position: 'absolute',
              right: '-470px',
              top: 'calc(50% + 1650px)',
              transform: 'translateY(-50%)',
              height: '1400px',
              width: 'auto',
              zIndex: 10000,
              cursor: 'pointer',
              transition: fadingInGuitarString === 5 ? 'opacity 0.1s ease-in' : 'opacity 4s ease-out',
              opacity: fadingGuitarString === 5 ? 0 : fadingInGuitarString === 5 ? 0 : 1,
              pointerEvents: 'none',
            }}
          >
            <img
              src={require('./amuse stores logos/guitar string 5 real.png')}
              alt="Guitar String 5"
              style={{
                height: '1400px',
                width: 'auto',
                transform: 'rotate(270deg)',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Guitar String 6 Overlay - Shows when clicked */}
        {(activeGuitarString === 6 || fadingGuitarString === 6 || fadingInGuitarString === 6) && (
          <div
            className={`guitar-string-overlay string-6-overlay ${fadingGuitarString === 6 ? 'fading-out' : ''} ${fadingInGuitarString === 6 ? 'fading-in' : ''}`}
            style={{
              position: 'absolute',
              right: '-470px',
              top: 'calc(50% + 1650px)',
              transform: 'translateY(-50%)',
              height: '1400px',
              width: 'auto',
              zIndex: 100000,
              cursor: 'pointer',
              transition: fadingInGuitarString === 6 ? 'opacity 0.1s ease-in' : 'opacity 4s ease-out',
              opacity: fadingGuitarString === 6 ? 0 : fadingInGuitarString === 6 ? 0 : 1,
              pointerEvents: 'none',
            }}
          >
            <img
              src={require('./amuse stores logos/guitar string 6 real.png')}
              alt="Guitar String 6"
              style={{
                height: '1400px',
                width: 'auto',
                transform: 'rotate(270deg)',
                objectFit: 'contain',
              }}
            />
          </div>
        )}

            {/* Clickable String 2 - Fixed Position */}
            <div
              className={`guitar-string string-2 ${activeGuitarString === 2 ? 'active' : ''}`}
              style={{
                position: 'absolute',
                left: 129,
                top: 584,
                width: Math.sqrt(Math.pow(99 - 129, 2) + Math.pow(4612 - 1534, 2)),
                height: '8px',
                backgroundColor: 'transparent',
                transformOrigin: '0 0',
                transform: `rotate(${Math.atan2(4612 - 1534, 99 - 129)}rad)`,
                zIndex: 9998,
                cursor: 'pointer',
              }}
              onClick={() => handleGuitarStringClick(2)}
            ></div>

            {/* Clickable String 3 - Fixed Position */}
            <div
              className={`guitar-string string-3 ${activeGuitarString === 3 ? 'active' : ''}`}
              style={{
                position: 'absolute',
                left: 160,
                top: 493,
                width: Math.sqrt(Math.pow(145 - 160, 2) + Math.pow(4604 - 1443, 2)),
                height: '8px',
                backgroundColor: 'transparent',
                transformOrigin: '0 0',
                transform: `rotate(${Math.atan2(4604 - 1443, 145 - 160)}rad)`,
                zIndex: 9998,
                cursor: 'pointer',
              }}
              onClick={() => handleGuitarStringClick(3)}
            ></div>

            {/* Clickable String 4 - Fixed Position */}
            <div
              className={`guitar-string string-4 ${activeGuitarString === 4 ? 'active' : ''}`}
              style={{
                position: 'absolute',
                left: 191,
                top: 392,
                width: Math.sqrt(Math.pow(188 - 191, 2) + Math.pow(4597 - 1342, 2)),
                height: '8px',
                backgroundColor: 'transparent',
                transformOrigin: '0 0',
                transform: `rotate(${Math.atan2(4597 - 1342, 188 - 191)}rad)`,
                zIndex: 9998,
                cursor: 'pointer',
              }}
              onClick={() => handleGuitarStringClick(4)}
            ></div>

            {/* Clickable String 5 - Fixed Position */}
            <div
              className={`guitar-string string-5 ${activeGuitarString === 5 ? 'active' : ''}`}
              style={{
                position: 'absolute',
                left: 220,
                top: 296,
                width: Math.sqrt(Math.pow(236 - 220, 2) + Math.pow(4593 - 1246, 2)),
                height: '8px',
                backgroundColor: 'transparent',
                transformOrigin: '0 0',
                transform: `rotate(${Math.atan2(4593 - 1246, 236 - 220)}rad)`,
                zIndex: 9998,
                cursor: 'pointer',
              }}
              onClick={() => handleGuitarStringClick(5)}
            ></div>

            {/* Clickable String 6 - Fixed Position */}
            <div
              className={`guitar-string string-6 ${activeGuitarString === 6 ? 'active' : ''}`}
              style={{
                position: 'absolute',
                left: 253,
                top: 196,
                width: Math.sqrt(Math.pow(279 - 253, 2) + Math.pow(4591 - 1146, 2)),
                height: '8px',
                backgroundColor: 'transparent',
                transformOrigin: '0 0',
                transform: `rotate(${Math.atan2(4591 - 1146, 279 - 253)}rad)`,
                zIndex: 9998,
                cursor: 'pointer',
              }}
              onClick={() => handleGuitarStringClick(6)}
            ></div>
          
          <div className="guitar-fretboard-container">
            {/* Guitar Background */}
            <div className="guitar-background">
              <img src={require('./amuse stores logos/guitar.png')} alt="Electric Guitar" className="guitar-image" />
            </div>
            
            {/* Music Notes Animation - positioned relative to YANKEE GO HOME track */}
            {isYankeeGoHomePlaying && (
              <div className="music-notes-container yankee-notes">
                {[...Array(20)].map((_, i) => {
                  const notes = ['♪', '♫', '♬', '♩', '♭', '♯'];
                  const noteIndex = i % notes.length;
                  return (
                    <div key={i} className={`music-note music-note-${i + 1}`}>
                      {notes[noteIndex]}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Music Notes Animation - positioned relative to Track 2 */}
            {isTrack2Playing && (
              <div className="music-notes-container track2-notes">
                {[...Array(20)].map((_, i) => {
                  const notes = ['♪', '♫', '♬', '♩', '♭', '♯'];
                  const noteIndex = i % notes.length;
                  return (
                    <div key={`track2-${i}`} className={`music-note track2-note-${i + 1}`}>
                      {notes[noteIndex]}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Music Notes Animation - positioned relative to Track 3 */}
            {isTrack3Playing && (
              <div className="music-notes-container track3-notes">
                {[...Array(20)].map((_, i) => {
                  const notes = ['♪', '♫', '♬', '♩', '♭', '♯'];
                  const noteIndex = i % notes.length;
                  return (
                    <div key={`track3-${i}`} className={`music-note track3-note-${i + 1}`}>
                      {notes[noteIndex]}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Music Notes Animation - positioned relative to Track 4 */}
            {isTrack4Playing && (
              <div className="music-notes-container track4-notes">
                {[...Array(20)].map((_, i) => {
                  const notes = ['♪', '♫', '♬', '♩', '♭', '♯'];
                  const noteIndex = i % notes.length;
                  return (
                    <div key={`track4-${i}`} className={`music-note track4-note-${i + 1}`}>
                      {notes[noteIndex]}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Music Notes Animation - positioned relative to Track 5 */}
            {isTrack5Playing && (
              <div className="music-notes-container track5-notes">
                {[...Array(20)].map((_, i) => {
                  const notes = ['♪', '♫', '♬', '♩', '♭', '♯'];
                  const noteIndex = i % notes.length;
                  return (
                    <div key={`track5-${i}`} className={`music-note track5-note-${i + 1}`}>
                      {notes[noteIndex]}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Music Notes Animation - positioned relative to Track 6 */}
            {isTrack6Playing && (
              <div className="music-notes-container track6-notes">
                {[...Array(20)].map((_, i) => {
                  const notes = ['♪', '♫', '♬', '♩', '♭', '♯'];
                  const noteIndex = i % notes.length;
                  return (
                    <div key={`track6-${i}`} className={`music-note track6-note-${i + 1}`}>
                      {notes[noteIndex]}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Tracks positioned along fretboard */}
            <div className="fretboard-tracks">
              {trackData.map((track, index) => (
                <div key={track.id} className={`fret-track fret-${index + 1}`}>
                  <div className="track-item-guitar">
                    <h4 className="track-title-guitar">
                      {track.title}
                      {track.featuring && (
                        <span>
                          {" (feat. "}
                          <a 
                            href={track.spotifyLink} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="featuring-link"
                          >
                            {track.featuring}
                          </a>
                          {")"}
                        </span>
                      )}
                    </h4>
            <div className="audio-player-guitar">
              <audio 
                controls
                  onPlay={track.id === 1 ? () => setIsYankeeGoHomePlaying(true) : 
                          track.id === 2 ? () => setIsTrack2Playing(true) : 
                          track.id === 3 ? () => setIsTrack3Playing(true) : 
                          track.id === 4 ? () => setIsTrack4Playing(true) : 
                          track.id === 5 ? () => setIsTrack5Playing(true) : 
                          track.id === 6 ? () => setIsTrack6Playing(true) : undefined}
                  onPause={track.id === 1 ? () => setIsYankeeGoHomePlaying(false) : 
                           track.id === 2 ? () => setIsTrack2Playing(false) : 
                           track.id === 3 ? () => setIsTrack3Playing(false) : 
                           track.id === 4 ? () => setIsTrack4Playing(false) : 
                           track.id === 5 ? () => setIsTrack5Playing(false) : 
                           track.id === 6 ? () => setIsTrack6Playing(false) : undefined}
                  onEnded={track.id === 1 ? () => setIsYankeeGoHomePlaying(false) : 
                          track.id === 2 ? () => setIsTrack2Playing(false) : 
                          track.id === 3 ? () => setIsTrack3Playing(false) : 
                          track.id === 4 ? () => setIsTrack4Playing(false) : 
                          track.id === 5 ? () => setIsTrack5Playing(false) : 
                          track.id === 6 ? () => setIsTrack6Playing(false) : undefined}
              >
                <source src={track.id === 1 ? require('./Tracks/YANKEE GO HOME master.wav') : 
                              track.id === 2 ? require('./Tracks/proj 993 w into.wav') : 
                              track.id === 3 ? require('./Tracks/how it got so tough rough demo 3.wav') : 
                              track.id === 4 ? require('./Tracks/the plan explicit MASTER 2.wav') : 
                              track.id === 5 ? require('./Tracks/WINDOWS DOWN master 6.wav') : 
                              track.id === 6 ? require('./Tracks/electric guitar wet 70 bpm.wav') : "#"} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
            </div>
                    <div className="track-info-guitar">
                      <p className="track-credits-guitar">{track.credits}</p>
                      {track.genre && <span className="track-genre-guitar">{track.genre}</span>}
                    </div>
                  </div>
                  <div className="get-info-box">
                    <button 
                      className="get-info-btn"
                      onClick={() => setSelectedTrack(track)}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* DAWs/Software Infinite Scroll Module */}
          <div className="daws-scroll-container-tracks">
            <div className="daws-grid-tracks">
              {/* First set */}
              <div className="daw-item">
                <div className="daw-logo-placeholder">
                  <img
                    src={require('./amuse stores logos/fl studio logo.png')}
                    alt="FL Studio"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
        </div>
                <h4 className="daw-name">FL Studio</h4>
              </div>
              
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Logic_Pro_icon.png')}
                  alt="Logic Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Logic Pro</h4>
              </div>
              
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Audition_CC_icon_(2020).svg.png')}
                  alt="Adobe Audition"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Audition</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Photoshop_CC_icon.svg.png')}
                  alt="Adobe Photoshop"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Photoshop</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Premiere_Pro_CC_icon.svg.png')}
                  alt="Adobe Premiere Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Premiere Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/final-cut-pro-logo-hd.png')}
                  alt="Final Cut Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Final Cut Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/cursor-logo-icon-freelogovectors.net_.png')}
                  alt="Cursor"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Cursor</h4>
              </div>

              {/* Duplicate set for infinite scroll */}
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/fl studio logo.png')}
                  alt="FL Studio"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">FL Studio</h4>
              </div>
              
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Logic_Pro_icon.png')}
                  alt="Logic Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Logic Pro</h4>
              </div>
              
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Audition_CC_icon_(2020).svg.png')}
                  alt="Adobe Audition"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Audition</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Photoshop_CC_icon.svg.png')}
                  alt="Adobe Photoshop"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Photoshop</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Premiere_Pro_CC_icon.svg.png')}
                  alt="Adobe Premiere Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Premiere Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/final-cut-pro-logo-hd.png')}
                  alt="Final Cut Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Final Cut Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/cursor-logo-icon-freelogovectors.net_.png')}
                  alt="Cursor"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Cursor</h4>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* VHS Section */}
      <section id="videos-section-2" className="vhs-section">
        <div className="vhs-video-container">
          <video
            ref={vhsVideoRef}
            className="vhs-video"
            autoPlay
            loop={currentVHSVideo === '/videos/VHS/loading-screen-vhs-short.mp4'}
            muted
            playsInline
            src={currentVHSVideo}
          />
          {showYouTubePlayer && (
            <>
              <div 
                className="vhs-youtube-overlay"
                style={{
                  top: `${boxPosition.top}%`,
                  right: `${boxPosition.right}%`,
                  width: `${boxPosition.width}%`,
                  paddingBottom: `${boxPosition.height}%`
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${currentYouTubeVideo}?autoplay=1`}
                  title="Music Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <img 
                src="/videos/VHS/stop_ejects VHS png.png"
                alt="Stop/Eject"
                className="vhs-stop-eject-btn"
                onClick={handleStopEject}
                style={{
                  top: `calc(${boxPosition.top + boxPosition.height + 1}% + 250px)`,
                  right: `${boxPosition.right + boxPosition.width/2 - boxPosition.width/6}%`,
                  width: `${boxPosition.width / 3}%`,
                  cursor: 'pointer'
                }}
              />
            </>
          )}
          {showPositioningBox && (
            <div 
              className="vhs-positioning-box"
              style={{
                top: `${boxPosition.top}%`,
                right: `${boxPosition.right}%`,
                width: `${boxPosition.width}%`,
                paddingBottom: `${boxPosition.height}%`
              }}
            >
              <div className="positioning-label">YouTube Player Position</div>
              </div>
          )}
            </div>
        {showPositioningBox && (
          <div className="positioning-controls">
            <h4>Adjust YouTube Player Position:</h4>
            <div className="control-row">
              <label>Top: {boxPosition.top}%</label>
              <input 
                type="range" 
                min="0" 
                max="80" 
                step="0.5"
                value={boxPosition.top}
                onChange={(e) => setBoxPosition({...boxPosition, top: parseFloat(e.target.value)})}
              />
                </div>
            <div className="control-row">
              <label>Right: {boxPosition.right}%</label>
              <input 
                type="range" 
                min="0" 
                max="80" 
                step="0.5"
                value={boxPosition.right}
                onChange={(e) => setBoxPosition({...boxPosition, right: parseFloat(e.target.value)})}
              />
              </div>
            <div className="control-row">
              <label>Width: {boxPosition.width}%</label>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="0.5"
                value={boxPosition.width}
                onChange={(e) => setBoxPosition({...boxPosition, width: parseFloat(e.target.value)})}
              />
              </div>
            <div className="control-row">
              <label>Height: {boxPosition.height}%</label>
              <input 
                type="range" 
                min="5" 
                max="50" 
                step="0.5"
                value={boxPosition.height}
                onChange={(e) => setBoxPosition({...boxPosition, height: parseFloat(e.target.value)})}
              />
            </div>
            <button 
              className="hide-positioning-btn"
              onClick={() => setShowPositioningBox(false)}
            >
              Hide Positioning Box (Click ACID LOVE to show again)
            </button>
            <div className="positioning-values">
              Current values: top: {boxPosition.top}%, right: {boxPosition.right}%, width: {boxPosition.width}%, height: {boxPosition.height}%
          </div>
          </div>
        )}
        <div className="vhs-images-container">
          <img 
            src="/videos/VHS/ACID LOVE OFFICIAL VIDEO PNG.png" 
            alt="Acid Love Official Video"
            className="vhs-image vhs-image-clickable"
            onClick={() => switchVideoSmooth('/videos/VHS/ACID LOVE INTRO VHS.mp4')}
            style={{ cursor: 'pointer' }}
          />
          <img 
            src="/videos/VHS/ALL THE TIME OFFICIAL VIDEO PNG.png" 
            alt="All The Time Official Video"
            className="vhs-image vhs-image-clickable"
            onClick={() => switchVideoSmooth('/videos/VHS/ALL THE TIME INTRO VHS.mp4')}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </section>

      {/* Scoring Section */}
      <section 
        className="scoring-section"
        onMouseEnter={startCurtainAnimation}
        onMouseLeave={stopCurtainAnimation}
      >
        {/* Curtains Overlay */}
        <div className="scoring-curtains-overlay">
          <img 
            src={`/overlays/curtains scene ${currentCurtainScene}.png`}
            alt="Theatrical curtains overlay" 
            className="curtains-image"
          />
              </div>
        
        {/* Scores Overlay */}
        <div className="scoring-scores-overlay">
          <img 
            src={`/overlays/scores scene ${currentScoresScene}.png`}
            alt="Musical scores overlay" 
            className="scores-image"
          />
              </div>
        
        {/* Film Sign Overlay */}
        <div className="scoring-film-sign-overlay" onClick={handleFilmSignClick}>
          <img 
            src="/overlays/film sign.png"
            alt="Film sign" 
            className="film-sign-image"
            style={{ cursor: 'pointer' }}
          />
            </div>
            
        {/* Commercial Sign Overlay */}
        <div className="scoring-commercial-sign-overlay" onClick={handleCommercialSignClick}>
          <img 
            src="/overlays/commercial sign.png"
            alt="Commercial sign" 
            className="commercial-sign-image"
            style={{ cursor: 'pointer' }}
          />
              </div>
        
        {/* Film YouTube Video Overlay */}
        {showFilmVideo && (
          <div className="scoring-film-video-overlay">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/rYv2a_VF328?start=29&autoplay=1"
              title="Film Score Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
              </div>
        )}
        
        {/* Commercial YouTube Video Overlay */}
        {showCommercialVideo && (
          <div className="scoring-commercial-video-overlay">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/86D7AGm5sHk?autoplay=1"
              title="Commercial Score Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
            </div>
        )}
        
        {/* Exit Sign Overlay */}
        <div className="scoring-exit-sign-overlay" onClick={handleExitSignClick}>
          <img 
            src="/overlays/exit sign.png"
            alt="Exit sign" 
            className="exit-sign-image"
            style={{ cursor: 'pointer' }}
          />
          </div>
        
      </section>

      {/* Drum Looper Section */}
      <section className="drum-looper-section">
        <div className="container">
            <h1 className={`challenge-title ${textPulse.kick ? 'pulse-kick' : ''}`}>VERSATILITY TEST</h1>
            <h2 className={`challenge-subtitle ${textPulse.snare ? 'pulse-snare' : ''}`}>I can rap on any beat in the world</h2>
            <p className={`challenge-instructions ${textPulse.hihat ? 'pulse-hihat' : ''}`}>Make your own drum loop, and I'll rap over it</p>
          
          {/* Transport Controls */}
          <div className="transport-controls">
            <button id="clear-btn" className="transport-btn clear-btn">Clear</button>
            <button id="play-btn" className="transport-btn play-btn">▶ Play</button>
            <button id="pause-btn" className="transport-btn pause-btn">⏸ Pause</button>
            <button id="stop-btn" className="transport-btn stop-btn">⏹ Stop</button>
            <div className="bpm-control">
              <label htmlFor="bpm-slider">BPM: </label>
              <input 
                type="range" 
                id="bpm-slider" 
                min="60" 
                max="180" 
                defaultValue="120" 
                className="bpm-slider"
              />
              <span id="bpm-display">120</span>
            </div>
          </div>

          {/* Drum Grid */}
          <div className="drum-grid">
            {/* Beat Lines - Vertical dotted lines every 8 steps (every 2 bars) */}
            <div className="beat-lines">
              <div className="beat-line beat-line-1"></div>
              <div className="beat-line beat-line-2"></div>
              <div className="beat-line beat-line-3"></div>
            </div>
            
            {/* Step Numbers */}
            <div className="step-numbers">
              <div className="step-spacer"></div>
              <div className="step-spacer"></div>
              {[...Array(16)].map((_, i) => (
                <div key={i} className="step-number">{i + 1}</div>
              ))}
            </div>

            {/* Kick Row */}
            <div className="drum-row">
              <button className="refresh-btn" data-drum="kick" title="New kick sound">
                <svg className="refresh-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12a8 8 0 0 1 8-8V2.5L14.5 5 12 7.5V6a6 6 0 1 0-6 6H4z" fill="currentColor"/>
                  <path d="M20 12a8 8 0 0 1-8 8v1.5L9.5 19 12 16.5V18a6 6 0 1 0 6-6h2z" fill="currentColor"/>
                </svg>
              </button>
              <div className="drum-label">Kick</div>
              {[...Array(16)].map((_, i) => (
                <button 
                  key={`kick-${i}`} 
                  className={`step-button ${drumPattern.kick[i] ? 'active' : ''} ${currentStep === i ? 'current' : ''}`}
                  data-drum="kick" 
                  data-step={i}
                >
                </button>
              ))}
            </div>

            {/* Snare Row */}
            <div className="drum-row">
              <button className="refresh-btn" data-drum="snare" title="New snare sound">
                <svg className="refresh-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12a8 8 0 0 1 8-8V2.5L14.5 5 12 7.5V6a6 6 0 1 0-6 6H4z" fill="currentColor"/>
                  <path d="M20 12a8 8 0 0 1-8 8v1.5L9.5 19 12 16.5V18a6 6 0 1 0 6-6h2z" fill="currentColor"/>
                </svg>
              </button>
              <div className="drum-label">Snare</div>
              {[...Array(16)].map((_, i) => (
                <button 
                  key={`snare-${i}`} 
                  className={`step-button ${drumPattern.snare[i] ? 'active' : ''} ${currentStep === i ? 'current' : ''}`}
                  data-drum="snare" 
                  data-step={i}
                >
                </button>
              ))}
            </div>

            {/* Hi-Hat Row */}
            <div className="drum-row">
              <button className="refresh-btn" data-drum="hihat" title="New hi-hat sound">
                <svg className="refresh-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12a8 8 0 0 1 8-8V2.5L14.5 5 12 7.5V6a6 6 0 1 0-6 6H4z" fill="currentColor"/>
                  <path d="M20 12a8 8 0 0 1-8 8v1.5L9.5 19 12 16.5V18a6 6 0 1 0 6-6h2z" fill="currentColor"/>
                </svg>
              </button>
              <div className="drum-label">Hi-Hat</div>
              {[...Array(16)].map((_, i) => (
                <button 
                  key={`hihat-${i}`} 
                  className={`step-button ${drumPattern.hihat[i] ? 'active' : ''} ${currentStep === i ? 'current' : ''}`}
                  data-drum="hihat" 
                  data-step={i}
                >
                </button>
              ))}
            </div>
          </div>

          {/* Current Step Indicator */}
          <div className="current-step-indicator">
            <div className="step-indicator-track">
              {[...Array(16)].map((_, i) => (
                <div key={i} className={`step-indicator ${currentStep === i ? 'current' : ''}`} data-step={i}></div>
              ))}
            </div>
          </div>

          {/* Light Show Button */}
          <div className="light-show-controls">
            <button 
              id="light-btn" 
              className={`light-btn ${laserShow ? 'active' : ''}`}
              onClick={() => setLaserShow(!laserShow)}
            >
              {laserShow ? '⚡ STOP LIGHT SHOW' : '💡 START LIGHT SHOW'}
            </button>
          </div>

          {/* Professional Light Show */}
          {laserShow && (
            <div className="concert-lights" style={{'--bpm': currentBPM} as React.CSSProperties}>
              {/* Main Stage Wash Lights */}
              <div className="stage-wash wash-left"></div>
              <div className="stage-wash wash-center"></div>
              <div className="stage-wash wash-right"></div>
              
              {/* Moving Head Spotlights */}
              <div className="moving-head head-1"></div>
              <div className="moving-head head-2"></div>
              <div className="moving-head head-3"></div>
              <div className="moving-head head-4"></div>
              
              {/* LED Strip Chases */}
              <div className="led-strip strip-top"></div>
              <div className="led-strip strip-bottom"></div>
              <div className="led-strip strip-left"></div>
              <div className="led-strip strip-right"></div>
              
              {/* Rhythmic Pulse Lights */}
              <div className="pulse-light pulse-1"></div>
              <div className="pulse-light pulse-2"></div>
              <div className="pulse-light pulse-3"></div>
              <div className="pulse-light pulse-4"></div>
              
              {/* Color Chase Beams */}
              <div className="chase-beam beam-1"></div>
              <div className="chase-beam beam-2"></div>
              <div className="chase-beam beam-3"></div>
              <div className="chase-beam beam-4"></div>
              <div className="chase-beam beam-5"></div>
              <div className="chase-beam beam-6"></div>
              
              {/* Atmospheric Haze Effect */}
              <div className="haze-layer"></div>
            </div>
          )}
        </div>
      </section>

      {/* DAWs Section */}
      <section id="daws-section" className="daws-section">
        <div className="container">
          <h3>DAWs/Software</h3>
          <div className="daws-scroll-container">
          <div className="daws-grid">
              {/* First set */}
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/fl studio logo.png')}
                  alt="FL Studio"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">FL Studio</h4>
              </div>
              
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Logic_Pro_icon.png')}
                  alt="Logic Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Logic Pro</h4>
              </div>
              
            <div className="daw-item">
              <div className="daw-logo-placeholder">
                <div className="logo-content">
                    <div className="logo-icon">🎚️</div>
                    <p>DAW Logo 3</p>
                </div>
              </div>
                <h4 className="daw-name">Adobe Audition</h4>
            </div>
            
            <div className="daw-item">
              <div className="daw-logo-placeholder">
                <div className="logo-content">
                    <div className="logo-icon">🎨</div>
                    <p>Software Logo 1</p>
                </div>
              </div>
                <h4 className="daw-name">Adobe Photoshop</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Premiere_Pro_CC_icon.svg.png')}
                  alt="Adobe Premiere Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Premiere Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/final-cut-pro-logo-hd.png')}
                  alt="Final Cut Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Final Cut Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/cursor-logo-icon-freelogovectors.net_.png')}
                  alt="Cursor"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Cursor</h4>
              </div>

              {/* Duplicate set for infinite scroll */}
              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/fl studio logo.png')}
                  alt="FL Studio"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">FL Studio</h4>
              </div>
              
              <div className="daw-item">
                <div className="daw-logo-placeholder">
                  <img
                    src={require('./amuse stores logos/Logic_Pro_icon.png')}
                    alt="Logic Pro"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
              </div>
              <h4 className="daw-name">Logic Pro</h4>
            </div>
            
            <div className="daw-item">
              <div className="daw-logo-placeholder">
                <div className="logo-content">
                  <div className="logo-icon">🎚️</div>
                  <p>DAW Logo 3</p>
                </div>
              </div>
              <h4 className="daw-name">Adobe Audition</h4>
            </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Photoshop_CC_icon.svg.png')}
                  alt="Adobe Photoshop"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Photoshop</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/Adobe_Premiere_Pro_CC_icon.svg.png')}
                  alt="Adobe Premiere Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Adobe Premiere Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/final-cut-pro-logo-hd.png')}
                  alt="Final Cut Pro"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Final Cut Pro</h4>
              </div>

              <div className="daw-item">
                <img
                  src={require('./amuse stores logos/cursor-logo-icon-freelogovectors.net_.png')}
                  alt="Cursor"
                  style={{
                    width: '150px',
                    height: '150px',
                    objectFit: 'contain',
                  }}
                />
                <h4 className="daw-name">Cursor</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instruments Section */}
      <section id="instruments-section" className="instruments-section">
        <div className="container">
          <h3>Instruments</h3>
          <div className="instruments-grid">
            <div className="instrument-item">
              <div className="instrument-icon">🎹</div>
              <h4 className="instrument-name">Piano</h4>
              <p className="proficiency-level">Advanced</p>
              <p className="proficiency-description">10+ years of classical and contemporary piano performance</p>
            </div>
            
            <div className="instrument-item">
              <div className="instrument-icon">🎸</div>
              <h4 className="instrument-name">Electric Guitar</h4>
              <p className="proficiency-level">Intermediate</p>
              <p className="proficiency-description">Skilled in rock, blues, and jazz guitar techniques</p>
            </div>
            
            <div className="instrument-item">
              <div className="instrument-icon">🎸</div>
              <h4 className="instrument-name">Bass Guitar</h4>
              <p className="proficiency-level">Expert</p>
              <p className="proficiency-description">Primary instrument with extensive studio and live experience</p>
            </div>
            
            <div className="instrument-item">
              <div className="instrument-icon">🪕</div>
              <h4 className="instrument-name">Acoustic Guitar</h4>
              <p className="proficiency-level">Intermediate</p>
              <p className="proficiency-description">Fingerpicking and strumming for songwriting and recording</p>
            </div>
            
            <div className="instrument-item">
              <div className="instrument-icon">🎤</div>
              <h4 className="instrument-name">Talkbox</h4>
              <p className="proficiency-level">Advanced</p>
              <p className="proficiency-description">Specialized vocal effects and electronic music integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes and Certificates Section */}
      <section className="education-section">
        <div className="container">
          <h3>Classes and Certificates</h3>
          <div className="education-grid">
            <div className="education-item">
              <div className="education-type">Class</div>
              <h4 className="education-title">Audio Mixing and Engineering</h4>
              <p className="education-instructor">with Paul Botelho</p>
              <p className="education-description">Comprehensive course covering advanced mixing techniques, signal processing, and professional studio workflows</p>
            </div>
            
            <div className="education-item">
              <div className="education-type">Ongoing</div>
              <h4 className="education-title">Composition Lessons</h4>
              <p className="education-instructor">with Paul Botelho</p>
              <p className="education-description">Weekly private composition lessons for the past 2 years, focusing on songwriting, arrangement, and musical theory application</p>
            </div>
            
            <div className="education-item">
              <div className="education-type">Certificate</div>
              <h4 className="education-title">Music Production Fundamentals</h4>
              <p className="education-instructor">Berklee College of Music Online</p>
              <p className="education-description">Certified completion of music production fundamentals including composition, arrangement, and digital audio workstation proficiency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Graphic Design Section */}
      <section className="graphic-design-section">
        <div className="container">
          <h3>Graphic Design</h3>
          <div className="design-scroll-container">
            <div className="design-grid">
              <div className="design-item">
                <div className="design-placeholder"></div>
              </div>
              
              <div className="design-item">
                <div className="design-placeholder"></div>
              </div>
              
              <div className="design-item">
                <div className="design-placeholder"></div>
              </div>
              
              <div className="design-item">
                <div className="design-placeholder"></div>
              </div>
              
              <div className="design-item">
                <div className="design-placeholder"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other Skills Section */}
      <section className="other-skills-section">
        <div className="container">
          <h3>Other Skills</h3>
          <div className="other-skills-grid">
            <div className="other-skill-item">
              <div className="other-skill-icon">🎬</div>
              <h4 className="other-skill-name">Premiere Pro</h4>
            </div>
            
            <div className="other-skill-item">
              <div className="other-skill-icon">📈</div>
              <h4 className="other-skill-name">Marketing</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Music Videos Section */}
      <section id="contact-section" className="music-videos-section">
        <CurtainEffect>
          <div className="container">
            <h3>Music Videos</h3>
            
            <div className="videos-grid">
              <div className="video-item">
                <div className="youtube-container">
                  <iframe
                    width="100%"
                    height="250"
                    src="https://www.youtube.com/embed/IuCPDv0KK7U"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-info">
                  <h4 className="video-title">ACID LOVE (Official Music Video)</h4>
                  <p className="video-credits">Directed by Director Name • Produced by Brooks Barry</p>
                  <p className="video-description">Brief description of the music video concept and production.</p>
                </div>
              </div>

              <div className="video-item">
                <div className="video-placeholder">
                  <div className="video-content">
                    <div className="play-button">▶</div>
                    <p>Video Title 2</p>
                  </div>
                </div>
                <div className="video-info">
                  <h4 className="video-title">Music Video Title 2</h4>
                  <p className="video-credits">Directed by Brooks Barry • Cinematography by Photographer</p>
                  <p className="video-description">Description of the second music video and creative process.</p>
                </div>
              </div>
            </div>
          </div>
        </CurtainEffect>
      </section>

      {/* Track Details Popup */}
      {selectedTrack && (
        <div className="popup-overlay" onClick={() => setSelectedTrack(null)}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="close-btn"
              onClick={() => setSelectedTrack(null)}
            >
              ×
            </button>
            
            <h2 className="popup-title">{selectedTrack.title}</h2>
            
            <div className="popup-audio-player">
              <audio controls>
                <source src="#" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
            
            <p className="popup-credits">{selectedTrack.credits}</p>
            
            <div className="popup-description">
              <h4>About This Track</h4>
              <p>{selectedTrack.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <header id="hero-section" className="hero-section">
        {/* Floating Music Platform Logos Background */}
        <div className="floating-logos">
          <div className="logo-item logo-1">
            <img src={require('./amuse stores logos/Spotify_logo_without_text.svg.png')} alt="Spotify" />
          </div>
          <div className="logo-item logo-2">
            <img src={require('./amuse stores logos/Apple_Music_icon.svg.png')} alt="Apple Music" />
          </div>
          <div className="logo-item logo-3">
            <img src={require('./amuse stores logos/YT_Music.svg.png')} alt="YouTube Music" />
          </div>
          <div className="logo-item logo-4">
            <img src={require('./amuse stores logos/Instagram_icon.png')} alt="Instagram" />
          </div>
          <div className="logo-item logo-5">
            <img src={require('./amuse stores logos/Beatport-Black.png')} alt="Beatport" />
          </div>
          <div className="logo-item logo-6">
            <img src={require('./amuse stores logos/Boomplay_Music_Logo.png')} alt="Boomplay" />
          </div>
          <div className="logo-item logo-7">
            <img src={require('./amuse stores logos/Amazonmusic.logo.png')} alt="Amazon Music" />
          </div>
          <div className="logo-item logo-8">
            <img src={require('./amuse stores logos/Deezer_logo,_2023.svg.png')} alt="Deezer" />
          </div>
          <div className="logo-item logo-9">
            <img src={require('./amuse stores logos/iHeartRadio-Logo.png')} alt="iHeartRadio" />
          </div>
          <div className="logo-item logo-10">
            <img src={require('./amuse stores logos/Pandora-Logo.png')} alt="Pandora" />
          </div>
          <div className="logo-item logo-11">
            <img src={require('./amuse stores logos/Shazam_icon.svg.png')} alt="Shazam" />
          </div>
          <div className="logo-item logo-12">
            <img src={require('./amuse stores logos/Anghami_logo.png')} alt="Anghami" />
          </div>
        </div>
        
        <div className="profile-container">
          <div className="profile-photo">
            <img src={require('./IMG_9674.jpg')} alt="Brooks Barry" className="profile-image" />
          </div>
          <h1 className="name">Brooks Barry</h1>
          
          <div className="social-links">
            <a href="https://instagram.com" className="social-link instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <img src={require('./amuse stores logos/Instagram_icon.png')} alt="Instagram" className="social-icon-img" />
            </a>
            
            <a href="https://tiktok.com" className="social-link tiktok" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
              <img src="/tiktok-icon.svg" alt="TikTok" className="social-icon-img" />
            </a>
            
            <a href="https://spotify.com" className="social-link spotify" aria-label="Spotify" target="_blank" rel="noopener noreferrer">
              <img src={require('./amuse stores logos/Spotify_logo_without_text.svg.png')} alt="Spotify" className="social-icon-img" />
            </a>
            
            <a href="https://music.apple.com" className="social-link apple-music" aria-label="Apple Music" target="_blank" rel="noopener noreferrer">
              <img src={require('./amuse stores logos/Apple_Music_icon.svg.png')} alt="Apple Music" className="social-icon-img" />
            </a>
          </div>
          
          <h2 className="title">Artist • Lyricist • Vocalist • Producer<br />Mixing Engineer • Mastering Engineer<br />Video Producer</h2>
          
          <div className="contact-info">
            <a href="mailto:brooksmusicbarry@gmail.com" className="email-link">
              brooksmusicbarry@gmail.com
            </a>
          </div>
        </div>
      </header>

      </div> {/* End content-overlay */}
      
    </div>
  );
}

export default App;
