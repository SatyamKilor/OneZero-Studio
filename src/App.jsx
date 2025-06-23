import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap';
import SplitType from "split-type";


const App = () => {
  
  const [frame, setFrame] = useState(1);
  const [direction, setDirection] = useState(1);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0); // ✅ Progress tracker

  const preLoadedImages = useRef([]);
  const canvasRef = useRef(null);

  const rightRef = useRef(null);
  const falldowntextRef1 = useRef(null);
  const falldowntextRef2 = useRef(null);
  const svgRef = useRef(null);
  const opacityTextRef1 = useRef(null);
  const opacityTextRef2 = useRef(null);
  const fallTextRef = useRef(null);
  const fallTextRef2 = useRef(null);
  const scaleRef = useRef(null);


  const totalFrames = 180; 
  const frameRate = 30; 

  useEffect(()=>{
    if(imagesLoaded){

      if(window.innerWidth < 726){
        gsap.fromTo(
        rightRef.current,
        { x: 500 },
        { x: 0, duration: 1 , delay: 1 }
        );
      } else {
        gsap.fromTo(
        rightRef.current,
        { x: 300 },
        { x: 0, duration: 1 , delay: 1 }
        );
      }

      

    gsap.fromTo(
      scaleRef.current,
      {scale: 1.5},
      {scale: 1, duration: 1, delay: 0.2, ease: "power3.out"},
    );

    gsap.fromTo(
      falldowntextRef1.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 1 }
    );

    gsap.fromTo(
      falldowntextRef2.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, delay: 1 }
    );

    gsap.fromTo(
      svgRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 1 }
    );

    gsap.fromTo(
      opacityTextRef1.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 1 }
    );

    gsap.fromTo(
      opacityTextRef2.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 1 }
    );

    const split = new SplitType(fallTextRef.current, {
    types: "chars",
    });

    const split2 = new SplitType(fallTextRef2.current, {
    types: "chars",
    });

  gsap.from(split.chars, {
    y: -100,
    opacity: 0,
    rotationX: -90,
    transformOrigin: "center center -100px",
    duration: 1,
    ease: "power3.out",
    stagger: 0.05,
    delay: 0.5,
  });

  gsap.from(split2.chars, {
    y: -100,
    opacity: 0,
    rotationX: -90,
    transformOrigin: "center center -100px",
    duration: 1,
    ease: "power3.out",
    stagger: 0.05,
    delay: 0.5,
  });

    
   }
  },[imagesLoaded]);

  // Preload images with progress tracking
 useEffect(() => {
  const preloadAllImages = async ()=>{

    const imagesToLoad = [];

    for(let i = 1; i<=totalFrames; i++){
      const paded = String(i).padStart(4, '0');
      imagesToLoad.push(`/videos/${paded}.png`);
    }

    let loaded = 0;
    const images = [];

    await Promise.all(
      imagesToLoad.map((url, index)=>{
        return new Promise((resolve)=>{
          const img = new Image();
          img.src = url;

          img.onload = () => {
            images[index] = img;
            loaded++;
            setLoadedCount(loaded); // ✅ Update loaded count
            resolve();
          };

          img.onerror = (e) => {
            console.error(`Error Loading ${url}:`, e);
            loaded++;
            setLoadedCount(loaded); // ✅ Update loaded count even on error
            images[index] = null; // Store null for failed loads
            resolve();
          };
        });
      })
    );

    preLoadedImages.current = images.filter(Boolean);
    setImagesLoaded(true); // ✅ Set imagesLoaded to true after all images are loaded

  }

  preloadAllImages();
}, []);


  // Animation loop
useEffect(() => {
    // Only proceed if images are loaded and canvas ref is available and images are actually preloaded
    if (!imagesLoaded || !canvasRef.current || preLoadedImages.current.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    /**
     * Draws the image corresponding to the current frame onto the canvas.
     * @param {number} currentFrame The 1-based index of the frame to draw.
     */
    const drawFrame = (currentFrame) => {
      // Get the image object from the preloadedImages ref (adjusting for 0-based array index)
      const img = preLoadedImages.current[currentFrame - 1];
      if (!ctx || !img) return; // Ensure context and image are available

      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas before drawing

      // Calculate ratios to scale the image to cover the canvas, maintaining aspect ratio
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio); // Use the larger ratio to ensure coverage

      // Calculate new dimensions for the image on the canvas
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      // Calculate position to center the image on the canvas
      const x = (canvas.width - newWidth) / 2;
      const y = (canvas.height - newHeight) / 2;

      // Draw the image onto the canvas
      ctx.drawImage(img, x, y, newWidth, newHeight);
    };

    /**
     * Sets the canvas dimensions to match its parent container, ensuring responsiveness.
     * This is called on initial load and whenever the window is resized.
     */
    const setCanvasSize = () => {
      if (scaleRef.current) {
        const parent = scaleRef.current; // The container div for the canvas
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        // Redraw the current frame immediately after resize to prevent visual glitches
        drawFrame(frame); // This call is now safe as drawFrame is defined above
      }
    };

    let animationFrameId; // To store the ID returned by requestAnimationFrame
    let lastTimestamp = 0; // To track the last time a frame was drawn
    const frameDuration = 1000 / frameRate; // Desired duration for each frame in milliseconds

    /**
     * The main animation loop, called by requestAnimationFrame.
     * @param {DOMHighResTimeStamp} timestamp The current time provided by requestAnimationFrame.
     */
    const animate = (timestamp) => {
      // Initialize lastTimestamp on the first call
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp; // Time elapsed since last frame draw

      // Check if enough time has passed to advance to the next frame
      if (elapsed > frameDuration) {
        // Adjust lastTimestamp to maintain a consistent frame rate
        lastTimestamp = timestamp - (elapsed % frameDuration);

        // Update the current frame state
        setFrame(prevFrame => {
          let nextFrame = prevFrame + direction;

          // Logic to reverse animation direction when boundaries are reached
          if (nextFrame > totalFrames) {
            setDirection(-1); // Reverse to go backward
            nextFrame = totalFrames; // Cap at the last frame
          } else if (nextFrame < 1) {
            setDirection(1); // Reverse to go forward
            nextFrame = 1; // Cap at the first frame
          }
          // Draw the newly calculated frame
          drawFrame(nextFrame);
          return nextFrame;
        });
      }
      // Request the next animation frame
      animationFrameId = requestAnimationFrame(animate);
    };

    // Set initial canvas size and add event listener for window resize
    setCanvasSize(); // Call setCanvasSize after drawFrame is defined
    window.addEventListener('resize', setCanvasSize);

    animationFrameId = requestAnimationFrame(animate); // Start the animation loop

    // Cleanup function for this useEffect, runs on component unmount or when dependencies change
    return () => {
      cancelAnimationFrame(animationFrameId); // Stop the animation loop
      window.removeEventListener('resize', setCanvasSize); // Clean up the resize listener
    };
  }, [imagesLoaded, direction, frameRate, totalFrames, frame, setFrame, setDirection]);


  // Show loading screen with progress bar
  if (!imagesLoaded) {
    const progress = Math.round((loadedCount / totalFrames) * 100);

    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-red-800 text-xl font-bold">
        Loading... {progress}%
        <div className="w-64 mt-4 h-2 bg-red-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-800 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    );
  }


  return (
    <div className=' relative h-screen w-full bg-gradient-to-br from-red-200 to-rose-100 overflow-hidden'>
      {/* Nav */}
      <div className="
       w-full 
       h-15
       sm:h-26
       md:h-38
       lg:h-[25vh]
       relative 
       overflow-hidden
       z-50
       ">

        {/* Text */}
        <div ref={opacityTextRef1}
          id="font1"
          className="
            absolute 
            left-4 top-4
            sm:left-6 sm:top-4
            md:left-10 md:top-6
            bg-custom-text-gradient 
            text-[9.7vh] leading-[60px]
            sm:text-[19.3vh] sm:leading-[14.5vh]
            md:text-[29vh] md:leading-[21.7vh]
            lg:text-[38.7vh] lg:leading-[32.9vh]
            font-light uppercase
            select-none"
        >
          06
        </div>

        <div
        ref={opacityTextRef2}
          id="font1"
          className="
            absolute
            right-4 top-4
            sm:left-[55%] sm:top-4
            md:left-[55%] md:top-6
            lg:left-[52%] lg:top-5

            bg-custom-text-gradient

            text-[9.7vh] leading-[60px]
            sm:text-[19.3vh] sm:leading-[14.5vh]
            md:text-[29vh] md:leading-[21.7vh]
            lg:text-[38.7vh] lg:leading-[32.9vh]
            
            font-light uppercase
            select-none"
        >
          04
        </div>

        {/* Logo + Studio Name + Tag Line */}
        <div ref={fallTextRef} id='font2' className="
        absolute
        left-[45%] top-4
        lg:left-[41vw] lg:top-8
        text-red-800

        text-[2vh]
        md:text-[3vw]
        lg:text-[1.95vw]
        font-medium

        leading-5
        md:leading-8
        lg:leading-10 select-none">Studio<br/>One.Zero</div>

        <svg ref={svgRef}
        className='
        slow-spin
        h-[3vh] w-[3vh]
        sm:h-[4vh] sm:w-[4vh]
        md:h-[5vh] md:w-[5vh]
        lg:h-[5vh] lg:w-[5vh]
        absolute
        left-[35%] top-4
        lg:left-[55.8vh] lg:top-10
        ' 
         viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25.5018 0V15.5657C25.5019 17.7622 26.0156 19.4186 26.7851 20.6675C28.2148 20.3297 29.7527 19.5229 31.3093 17.9664L42.3165 6.96053L43.0324 7.67637L32.0263 18.6834C30.4846 20.2251 29.6767 21.748 29.3332 23.1661C31.4528 24.4449 33.6617 24.493 33.6617 24.493H50V25.5058H33.6663C33.6461 25.5063 31.4716 25.5602 29.3723 26.8132C29.9721 29.1794 31.4693 30.7509 31.4831 30.7653L43.0359 42.319L42.32 43.0349L30.7695 31.4858C30.7531 31.4701 29.1611 29.9549 26.7701 29.3636C26.0114 30.6088 25.5064 32.2561 25.5064 34.4343V50H24.4936V34.4343C24.4936 32.235 23.9779 30.5774 23.2069 29.3279C21.7783 29.6663 20.2423 30.4741 18.6873 32.029L7.68 43.0349L6.96414 42.319L17.9703 31.312C19.5105 29.7717 20.317 28.2498 20.6611 26.8328C18.5507 25.5599 16.3523 25.5062 16.3337 25.5058H0V24.493H16.3291C16.365 24.4922 18.532 24.434 20.6243 23.1845C20.0251 20.8184 18.5289 19.2462 18.5135 19.2301L6.96414 7.67983L7.68 6.96398L19.2271 18.5096C19.2449 18.5267 20.8367 20.0396 23.2265 20.6307C23.9835 19.386 24.4878 17.741 24.4878 15.5657V0H25.5018Z" fill="#8B0000"/>
        </svg>

        <div ref={falldowntextRef1} className="
        absolute
        hidden
        lg:block
        lg:left-[55.7vh] lg:top-[18.5vh]
        justify-start
        text-red-800
        text-[1.7vh] 
        font-normal
        font-['Manrope']
        leading-none select-none">Validate And Evolve Ideas, <br/>From Concept — To 10.0, <br/>Rapidly</div>

      </div>

      {/* Right */}
      <div ref={rightRef} className='
      
      absolute
      bottom-[25%] right-[5%]
      lg:top-[50%] lg:right-5
      translate-y-[-50%]
  
      h-[15%] w-[90%]
      lg:h-[90%] lg:w-[13%]

      bg-custom-gradient

      flex
      flex-col
      z-50
      '>
        {/* top text */}
        <div className="justify-start text-center mt-3">
        <span className="text-red-800 text-sm font-bold font-['Manrope'] select-none">Request</span>
        <span className="text-red-800 text-sm font-bold font-['Manrope'] select-none"> A Prototype</span>
        </div>

        {/* Video Center */}
        <div className='
        hidden
        lg:flex
        items-center
        justify-center
        flex-grow
        aspect-video
        w-full
        mix-blend-multiply
        '>
          <video src="/videos/clip.mp4"
          className="w-full h-[60vh] object-cover"
          autoPlay
          muted
          loop
          ></video>
        </div>

        {/* Icons */}
        <div className="
        mt-auto
        inline-flex
        justify-center
        lg:justify-end
        lg:items-start
        gap-1.5
        mb-3
        mr-5
        ">

          <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.19 14.6947C20.19 14.6947 15.2938 14.5914 15.2938 9.33722V-0.00292969H14.6855V9.33722C14.6855 14.5914 9.78936 14.6947 9.78936 14.6947H-0.0088501V15.3024H9.79231C9.79231 15.3024 14.6885 15.4057 14.6885 20.6599V30H15.2968V20.6599C15.2968 15.4057 20.1929 15.3024 20.1929 15.3024H29.9941V14.6947H20.1929H20.19Z" fill="#8B0000"/>
          </svg>

          <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.19 14.6947C20.19 14.6947 15.2938 14.5914 15.2938 9.33722V-0.00292969H14.6855V9.33722C14.6855 14.5914 9.78936 14.6947 9.78936 14.6947H-0.0088501V15.3024H9.79231C9.79231 15.3024 14.6885 15.4057 14.6885 20.6599V30H15.2968V20.6599C15.2968 15.4057 20.1929 15.3024 20.1929 15.3024H29.9941V14.6947H20.1929H20.19Z" fill="#8B0000"/>
          </svg>

          <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.19 14.6947C20.19 14.6947 15.2938 14.5914 15.2938 9.33722V-0.00292969H14.6855V9.33722C14.6855 14.5914 9.78936 14.6947 9.78936 14.6947H-0.0088501V15.3024H9.79231C9.79231 15.3024 14.6885 15.4057 14.6885 20.6599V30H15.2968V20.6599C15.2968 15.4057 20.1929 15.3024 20.1929 15.3024H29.9941V14.6947H20.1929H20.19Z" fill="#8B0000"/>
          </svg>


        </div>
      </div>

      {/* Two text elements */}
      <h1 ref={falldowntextRef2}
      className="
      hidden
      lg:block
      text-[1.7vh]
      font-bold
      text-red-800
      font-['Manrope']
      leading-5
      m-5
      select-none
      "
      >10x Fast Prototyping<br /><span className='font-normal'>bring ideas to life in record time</span></h1>

      <h1 ref={fallTextRef2} className="
      absolute
      top-1/3 left-1/2
      transform -translate-x-1/2 -translate-y-1/2

      lg:top-[35%] lg:left-auto lg:right-[31%]
      lg:transform-none

      text-center lg:text-left
      text-[3.6vh] lg:text-[3.6vh]
     text-red-800
      font-semibold
      font-['Manrope']
      leading-none
      z-90
      select-none
      "><span className='underline decoration-1 underline-offset-2'>Discover</span> Our<br />New Projects<br />from ©2025</h1>

      {/* Vdo */}
      <div
        ref={scaleRef}
        className='
          absolute
    bottom-0               // Mobile: stick to bottom
    w-full
    h-[40vh]               // Mobile: height of image section (adjustable)
    z-5
    overflow-hidden

    lg:inset-0             // Desktop: stretch full screen
    lg:w-full
    lg:h-full
        '
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
      >
        

        {/* <img className='w-full h-full object-cover' src={imageSrc} alt="" /> */}

        <canvas
        ref={canvasRef}
        className='w-full h-full object-cover'
      ></canvas>

        {/* Transparent overlay to block mobile long press */}
        <div
          className='absolute inset-0 z-10'
          onContextMenu={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          onTouchMove={(e) => e.preventDefault()}
          onMouseDown={(e) => e.preventDefault()}
        ></div>
      </div>
    </div>
  )
}

export default App
