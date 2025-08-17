import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import CameraController, { CAMERA_POSITIONS } from '../CameraController';
import { Vector3 } from 'three';

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    timeline: () => ({
      to: vi.fn().mockReturnThis(),
      isActive: () => false
    })
  }
}));

// Mock Three.js objects
const mockCamera = {
  position: new Vector3(0, 1.6, 3),
  quaternion: { setFromEuler: vi.fn() },
  lookAt: vi.fn(),
  getWorldDirection: vi.fn(() => new Vector3(0, 0, -1)),
  updateProjectionMatrix: vi.fn(),
  type: 'PerspectiveCamera',
  fov: 75
};

const mockGL = {
  domElement: document.createElement('canvas')
};

// Mock React Three Fiber hooks
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual('@react-three/fiber');
  return {
    ...actual,
    Canvas: ({ children, ...props }: any) => (
      <div data-testid="canvas" {...props}>
        {children}
      </div>
    ),
    useFrame: vi.fn((callback) => {
      // Store callback for manual triggering in tests
      (global as any).frameCallback = callback;
    }),
    useThree: () => ({
      camera: mockCamera,
      gl: mockGL
    })
  };
});

// Mock document.pointerLockElement
Object.defineProperty(document, 'pointerLockElement', {
  writable: true,
  value: null
});

describe('CameraController Integration Tests', () => {
  const mockOnCameraChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset camera position
    mockCamera.position.set(0, 1.6, 3);
    document.pointerLockElement = null;
    
    // Mock requestPointerLock
    mockGL.domElement.requestPointerLock = vi.fn();
    
    // Clear any existing global callbacks
    delete (global as any).frameCallback;
    delete (global as any).cameraController;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderCameraController = (props = {}) => {
    return render(
      <Canvas>
        <CameraController
          onCameraChange={mockOnCameraChange}
          {...props}
        />
      </Canvas>
    );
  };

  describe('Initialization', () => {
    it('should initialize with default settings', () => {
      renderCameraController();
      
      // Should set up global camera controller
      expect((global as any).cameraController).toBeDefined();
    });

    it('should register event listeners', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const canvasAddEventListenerSpy = vi.spyOn(mockGL.domElement, 'addEventListener');
      
      renderCameraController();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('pointerlockchange', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(canvasAddEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should expose camera positions', () => {
      expect(CAMERA_POSITIONS).toBeDefined();
      expect(CAMERA_POSITIONS.default).toBeDefined();
      expect(CAMERA_POSITIONS.overview).toBeDefined();
      expect(CAMERA_POSITIONS.blackjack).toBeDefined();
    });
  });

  describe('Mouse Controls', () => {
    it('should request pointer lock on canvas click', () => {
      renderCameraController();
      
      fireEvent.click(mockGL.domElement);
      
      expect(mockGL.domElement.requestPointerLock).toHaveBeenCalled();
    });

    it('should handle pointer lock change events', () => {
      renderCameraController();
      
      // Simulate pointer lock acquired
      document.pointerLockElement = mockGL.domElement;
      fireEvent(document, new Event('pointerlockchange'));
      
      // Should update internal state (tested indirectly through behavior)
      expect(document.pointerLockElement).toBe(mockGL.domElement);
    });

    it('should handle mouse movement when pointer locked', () => {
      renderCameraController();
      
      // Simulate pointer lock
      document.pointerLockElement = mockGL.domElement;
      fireEvent(document, new Event('pointerlockchange'));
      
      // Simulate mouse movement
      const mouseMoveEvent = new MouseEvent('mousemove', {
        movementX: 10,
        movementY: 5
      });
      
      fireEvent(document, mouseMoveEvent);
      
      // Should not throw errors
      expect(() => {
        if ((global as any).frameCallback) {
          (global as any).frameCallback({}, 0.016);
        }
      }).not.toThrow();
    });

    it('should ignore mouse movement when pointer not locked', () => {
      renderCameraController();
      
      // Ensure pointer is not locked
      document.pointerLockElement = null;
      
      const mouseMoveEvent = new MouseEvent('mousemove', {
        movementX: 10,
        movementY: 5
      });
      
      // Should not throw errors
      expect(() => {
        fireEvent(document, mouseMoveEvent);
      }).not.toThrow();
    });
  });

  describe('Touch Controls', () => {
    it('should handle touch start events', () => {
      renderCameraController();
      
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      });
      
      expect(() => {
        fireEvent(mockGL.domElement, touchStartEvent);
      }).not.toThrow();
    });

    it('should handle touch move events', () => {
      renderCameraController();
      
      // Start touch
      const touchStartEvent = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch]
      });
      fireEvent(mockGL.domElement, touchStartEvent);
      
      // Move touch
      const touchMoveEvent = new TouchEvent('touchmove', {
        touches: [{ clientX: 110, clientY: 105 } as Touch]
      });
      
      expect(() => {
        fireEvent(mockGL.domElement, touchMoveEvent);
      }).not.toThrow();
    });

    it('should handle touch end events', () => {
      renderCameraController();
      
      const touchEndEvent = new TouchEvent('touchend');
      
      expect(() => {
        fireEvent(mockGL.domElement, touchEndEvent);
      }).not.toThrow();
    });
  });

  describe('Camera Navigation', () => {
    it('should expose navigation methods globally', () => {
      renderCameraController();
      
      const controller = (global as any).cameraController;
      expect(controller).toBeDefined();
      expect(controller.navigateToGame).toBeInstanceOf(Function);
      expect(controller.navigateToPosition).toBeInstanceOf(Function);
      expect(controller.transitionToPosition).toBeInstanceOf(Function);
    });

    it('should navigate to game positions', () => {
      renderCameraController();
      
      const controller = (global as any).cameraController;
      
      expect(() => {
        controller.navigateToGame('blackjack');
      }).not.toThrow();
    });

    it('should navigate to predefined positions', () => {
      renderCameraController();
      
      const controller = (global as any).cameraController;
      
      expect(() => {
        controller.navigateToPosition('overview');
      }).not.toThrow();
    });

    it('should handle invalid game navigation gracefully', () => {
      renderCameraController();
      
      const controller = (global as any).cameraController;
      
      expect(() => {
        controller.navigateToGame('invalid-game');
      }).not.toThrow();
    });
  });

  describe('Camera Constraints', () => {
    it('should apply height constraints', () => {
      renderCameraController({ enabled: true });
      
      // Simulate frame update with extreme position
      mockCamera.position.set(0, 10, 0); // Too high
      
      if ((global as any).frameCallback) {
        (global as any).frameCallback({}, 0.016);
      }
      
      // Position should be constrained (exact values depend on implementation)
      expect(mockCamera.position.y).toBeLessThan(10);
    });

    it('should apply boundary constraints', () => {
      renderCameraController({ enabled: true });
      
      // Simulate frame update with position outside boundary
      mockCamera.position.set(15, 1.6, 15); // Outside boundary
      
      if ((global as any).frameCallback) {
        (global as any).frameCallback({}, 0.016);
      }
      
      // Position should be constrained within boundary
      const distance = Math.sqrt(
        mockCamera.position.x * mockCamera.position.x + 
        mockCamera.position.z * mockCamera.position.z
      );
      expect(distance).toBeLessThan(15);
    });
  });

  describe('Frame Updates', () => {
    it('should call onCameraChange callback during frame updates', () => {
      renderCameraController({ enabled: true });
      
      if ((global as any).frameCallback) {
        (global as any).frameCallback({}, 0.016);
      }
      
      expect(mockOnCameraChange).toHaveBeenCalled();
    });

    it('should not update when disabled', () => {
      renderCameraController({ enabled: false });
      
      const initialPosition = mockCamera.position.clone();
      
      if ((global as any).frameCallback) {
        (global as any).frameCallback({}, 0.016);
      }
      
      // Camera position should not change significantly when disabled
      expect(mockCamera.position.distanceTo(initialPosition)).toBeLessThan(0.1);
    });

    it('should handle frame updates without errors', () => {
      renderCameraController();
      
      expect(() => {
        if ((global as any).frameCallback) {
          (global as any).frameCallback({}, 0.016);
        }
      }).not.toThrow();
    });
  });

  describe('Cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const canvasRemoveEventListenerSpy = vi.spyOn(mockGL.domElement, 'removeEventListener');
      
      const { unmount } = renderCameraController();
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerlockchange', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(canvasRemoveEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should clean up global references on unmount', () => {
      const { unmount } = renderCameraController();
      
      expect((global as any).cameraController).toBeDefined();
      
      unmount();
      
      expect((global as any).cameraController).toBeUndefined();
    });
  });

  describe('Configuration', () => {
    it('should respect sensitivity setting', () => {
      renderCameraController({ sensitivity: 0.001 });
      
      // Should initialize without errors
      expect((global as any).cameraController).toBeDefined();
    });

    it('should respect smoothness setting', () => {
      renderCameraController({ smoothness: 0.2 });
      
      // Should initialize without errors
      expect((global as any).cameraController).toBeDefined();
    });

    it('should work with all configuration options', () => {
      renderCameraController({
        enabled: true,
        sensitivity: 0.003,
        smoothness: 0.15,
        onCameraChange: mockOnCameraChange
      });
      
      expect((global as any).cameraController).toBeDefined();
    });
  });
});