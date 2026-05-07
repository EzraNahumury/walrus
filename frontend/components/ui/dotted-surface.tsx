"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import { cn } from "@/lib/cn";

type DottedSurfaceProps = Omit<React.ComponentProps<"div">, "ref"> & {
  /** Light or dark dot color — defaults to "dark" (white dots on black). */
  variant?: "light" | "dark";
  /** Particle column count. Default 40. Reduce for perf. */
  amountX?: number;
  /** Particle row count. Default 60. */
  amountY?: number;
};

export function DottedSurface({
  className,
  variant = "dark",
  amountX = 40,
  amountY = 60,
  ...props
}: DottedSurfaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const SEPARATION = 150;
    const AMOUNTX = amountX;
    const AMOUNTY = amountY;

    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000);
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const dotColor = variant === "dark" ? [200, 200, 200] : [10, 10, 10];

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;
        positions.push(x, y, z);
        colors.push(dotColor[0], dotColor[1], dotColor[2]);
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 8,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const positionAttribute = geometry.attributes.position;
      const positionArray = positionAttribute.array as Float32Array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;
          positionArray[index + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;
          i++;
        }
      }
      positionAttribute.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.1;
    };

    const handleResize = () => {
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    animate();

    return () => {
      ro.disconnect();
      if (animationId) cancelAnimationFrame(animationId);
      scene.traverse((object) => {
        if (object instanceof THREE.Points) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [variant, amountX, amountY]);

  return (
    <div ref={containerRef} className={cn("absolute inset-0", className)} {...props} />
  );
}
