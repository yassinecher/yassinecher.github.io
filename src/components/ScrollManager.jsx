import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

export const ScrollManager = (props) => {
  const { section, request, onSectionChange } = props;

  const data = useScroll();
  const lastScroll = useRef(0);
  const isAnimating = useRef(false);

  data.fill.classList.add("top-0");
  data.fill.classList.add("absolute");

  useEffect(() => {
    let frame;
    const scrollToSection = () => {
      // On first mount the scroller isn't laid out yet (height 0); wait for it.
      if (!data.el.clientHeight) {
        frame = requestAnimationFrame(scrollToSection);
        return;
      }
      // Flag synchronously: frames rendered before the tween starts would otherwise read the
      // first scroll movement as a user scroll and redirect to another section.
      isAnimating.current = true;
      gsap.to(data.el, {
        duration: 1,
        scrollTop: section * data.el.clientHeight,
        onComplete: () => {
          isAnimating.current = false;
        },
      });
    };
    scrollToSection();
    return () => cancelAnimationFrame(frame);
  }, [section, request]);

  useFrame(() => {
    if (isAnimating.current) {
      lastScroll.current = data.scroll.current;
      return;
    }

    const curSection = Math.floor(data.scroll.current * data.pages);
    if (data.scroll.current > lastScroll.current && curSection === 0 && section !== 1) {
      onSectionChange(1);
    }
    if (
      data.scroll.current < lastScroll.current &&
      data.scroll.current < 1 / (data.pages - 1) &&
      section !== 0
    ) {
      onSectionChange(0);
    }
    lastScroll.current = data.scroll.current;
  });

  return null;
};
