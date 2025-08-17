'use client';

import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Raycaster, Vector2, Object3D, Intersection } from 'three';

interface TableInteraction {
  gameId: string;
  object: Object3D;
  distance: number;
}

interface UseTableInteractionsProps {
  onTableHover?: (gameId: string | null, hovered: boolean) => void;
  onTableClick?: (gameId: string) => void;
}

export function useTableInteractions({
  onTableHover,
  onTableClick
}: UseTableInteractionsProps = {}) {
  const { camera, gl, scene } = useThree();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const [hoveredTable, setHoveredTable] = useState<string | null>(null);
  const [clickedTable, setClickedTable] = useState<string | null>(null);
  const tableObjects = useRef<Map<string, Object3D>>(new Map());

  // Register a table object for interaction
  const registerTable = useCallback((gameId: string, object: Object3D) => {
    tableObjects.current.set(gameId, object);
    // Add userData to identify the table
    object.userData = { ...object.userData, gameId, isTable: true };
  }, []);

  // Unregister a table object
  const unregisterTable = useCallback((gameId: string) => {
    tableObjects.current.delete(gameId);
  }, []);

  // Handle mouse movement for hover detection
  const handleMouseMove = useCallback((event: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }, [gl]);

  // Handle mouse clicks
  const handleMouseClick = useCallback((event: MouseEvent) => {
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(
      Array.from(tableObjects.current.values()),
      true
    );

    if (intersects.length > 0) {
      const intersection = intersects[0];
      let gameId: string | null = null;

      // Find the gameId by traversing up the object hierarchy
      let currentObject: Object3D | null = intersection.object;
      while (currentObject && !gameId) {
        if (currentObject.userData?.gameId) {
          gameId = currentObject.userData.gameId;
          break;
        }
        currentObject = currentObject.parent;
      }

      if (gameId) {
        setClickedTable(gameId);
        onTableClick?.(gameId);
        
        // Reset clicked state after animation
        setTimeout(() => setClickedTable(null), 200);
      }
    }
  }, [camera, onTableClick]);

  // Raycast on each frame to detect hover
  useFrame(() => {
    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(
      Array.from(tableObjects.current.values()),
      true
    );

    let newHoveredTable: string | null = null;

    if (intersects.length > 0) {
      const intersection = intersects[0];
      
      // Find the gameId by traversing up the object hierarchy
      let currentObject: Object3D | null = intersection.object;
      while (currentObject && !newHoveredTable) {
        if (currentObject.userData?.gameId) {
          newHoveredTable = currentObject.userData.gameId;
          break;
        }
        currentObject = currentObject.parent;
      }
    }

    // Update hover state if changed
    if (newHoveredTable !== hoveredTable) {
      if (hoveredTable) {
        onTableHover?.(hoveredTable, false);
      }
      if (newHoveredTable) {
        onTableHover?.(newHoveredTable, true);
      }
      setHoveredTable(newHoveredTable);
    }
  });

  // Set up event listeners
  const setupEventListeners = useCallback(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleMouseClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleMouseClick);
    };
  }, [gl, handleMouseMove, handleMouseClick]);

  return {
    hoveredTable,
    clickedTable,
    registerTable,
    unregisterTable,
    setupEventListeners
  };
}