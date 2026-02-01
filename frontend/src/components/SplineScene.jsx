import { useRef, useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';

function SplineScene({ onLoad }) {
  const splineRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!splineRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      // Calculate normalized mouse position (-1 to 1)
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Get the camera or any object you want to animate
      const spline = splineRef.current;

      // Try to find and animate objects in the scene
      try {
        // Emit mouse move event to Spline (for built-in interactions)
        spline.emitEvent('mouseHover', 'Camera');

        // You can also directly manipulate objects if you know their names
        // For example, rotating based on cursor position:
        const camera = spline.findObjectByName('Camera');
        if (camera) {
          // Subtle rotation based on cursor
          camera.rotation.y = x * 0.2;
          camera.rotation.x = y * 0.1;
        }

        // Try to move/rotate main objects for parallax effect
        const mainObject = spline.findObjectByName('Object');
        if (mainObject) {
          mainObject.rotation.y = x * 0.3;
          mainObject.rotation.x = y * 0.2;
        }
      } catch (err) {
        // Scene might not have these objects, that's okay
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLoaded]);

  const handleSplineLoad = (spline) => {
    splineRef.current = spline;
    setIsLoaded(true);
    if (onLoad) onLoad(spline);
    console.log('🎨 Spline scene loaded!');
  };

  return (
    <div
      ref={containerRef}
      className="spline-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
        <Spline
          scene="https://prod.spline.design/ytZIUAjWyvVTX-G6/scene.splinecode"
          onLoad={handleSplineLoad}
        />
      </div>

      {/* Loading indicator */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#8e8e8e',
            fontSize: '14px',
          }}
        >
          Loading 3D scene...
        </div>
      )}
    </div>
  );
}

export default SplineScene;
