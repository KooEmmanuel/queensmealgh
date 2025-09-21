"use client";
import React, { useRef, useEffect } from "react";
// NOTE: You might need to install motion if you haven't already: npm install framer-motion
// If you are using the older `motion/react`, ensure it's installed and configured.
// For newer Framer Motion versions (recommended):
import { useScroll, useTransform, motion, MotionValue } from "framer-motion"; 

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"] // Adjust offset for when animation starts/ends
  });
  const [isMobile, setIsMobile] = React.useState(false);

  // Add this useEffect for debugging
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      console.log("Scroll Progress:", latest); 
    });
    return () => unsubscribe(); // Cleanup listener on unmount
  }, [scrollYProgress]);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1]; // Original: [1.05, 1]
  };

  // Adjusted rotation range for less extreme effect
  const rotate = useTransform(scrollYProgress, [0, 1], [5, 0]); 
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  // Adjusted translate range for less movement
  const translate = useTransform(scrollYProgress, [0, 1], [0, -50]); 

  return (
    // Reduced mobile horizontal padding from px-2 to px-1
    <div
      className="h-[50rem] md:h-[55rem] flex items-start justify-center relative md:pt-10 px-1 md:px-10"
      ref={containerRef}
    >
      <div
        // Reduced top padding (py- -> pt-), kept bottom padding (pb-)
        className="pt-2 md:pt-12 pb-10 md:pb-20 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: { translate: MotionValue<number>, titleComponent: string | React.ReactNode }) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      // Added bottom margin to push card down slightly
      className="div max-w-5xl mx-auto text-center mb-8 md:mb-12" 
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>; // Keep translate prop if needed elsewhere, though not used directly in style here
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        // Replaced complex shadow with a simpler one (similar to shadow-xl)
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
      // Increased mobile height further from h-[35rem] to h-[40rem]
      // Reduced mobile negative margin from -mt-8 to -mt-4
      // Kept md height and margin the same
      className="max-w-6xl -mt-4 md:-mt-12 mx-auto h-[40rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-4 bg-[#222222] rounded-[30px]"
    >
      <div className=" h-full w-full rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl ">
        {children}
      </div>
    </motion.div>
  );
}; 