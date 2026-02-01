import { useRef, useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';

/**
 * Spline avatar that animates with cursor movement
 * Supports both small avatar mode and fullScreen mode
 */
function SplineAvatar({ size = 60, fullScreen = false }) {
  const splineRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!splineRef.current) return;

      // Calculate normalized mouse position for full screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;

      // Normalize and limit rotation
      const maxRotation = fullScreen ? 0.3 : 0.5;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const normalizedX = (dx / (distance + 200)) * maxRotation;
      const normalizedY = (dy / (distance + 200)) * maxRotation;

      try {
        const spline = splineRef.current;

        // Find and rotate objects based on cursor position
        const camera = spline.findObjectByName('Camera');
        if (camera) {
          camera.rotation.y = normalizedX * 0.8;
          camera.rotation.x = -normalizedY * 0.5;
        }

        // Rotate any main object in the scene
        const obj = spline.findObjectByName('Object');
        if (obj) {
          obj.rotation.y = normalizedX;
          obj.rotation.x = -normalizedY * 0.6;
        }
      } catch (err) {
        // Scene objects might not exist
      }
    };

    if (isLoaded) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isLoaded, fullScreen]);

  const handleSplineLoad = (spline) => {
    splineRef.current = spline;
    setIsLoaded(true);
  };

  // Full screen mode for landing page
  if (fullScreen) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '100%' }}
      >
        <Spline
          scene="https://prod.spline.design/ytZIUAjWyvVTX-G6/scene.splinecode"
          onLoad={handleSplineLoad}
          style={{
            width: '100%',
            height: '100%',
          }}
        />

        {/* Loading placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center animate-pulse">
                <span className="text-3xl">🎓</span>
              </div>
              <p className="text-[#8e8e8e] text-sm">Loading 3D scene...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Small avatar mode for messages
  return (
    <div
      ref={containerRef}
      className="spline-avatar flex-shrink-0 rounded-full overflow-hidden relative"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
      }}
    >
      <Spline
        scene="https://prod.spline.design/ytZIUAjWyvVTX-G6/scene.splinecode"
        onLoad={handleSplineLoad}
        style={{
          width: '100%',
          height: '100%',
          transform: 'scale(1.5)',
        }}
      />

      {/* Loading placeholder */}
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] rounded-full"
        >
          <span className="text-xl">🎓</span>
        </div>
      )}
    </div>
  );
}

export default SplineAvatar;

