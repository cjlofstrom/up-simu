import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { gameState } from '../services/gameState';
import type { ScenarioContent } from '../types/scenario';

interface MapScreenProps {
  currentCheckpoint: number;
  scenario: ScenarioContent;
  onCheckpointClick: (checkpoint: number) => void;
  mapImage: string;
  playerAvatar: string;
  shouldBounce?: boolean;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  currentCheckpoint,
  scenario,
  onCheckpointClick,
  mapImage,
  playerAvatar,
  shouldBounce = false
}) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 500 });
  const [isMoving, setIsMoving] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [viewBox, setViewBox] = useState('0 0 800 600'); // Initial default view
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const totalStars = gameState.getTotalStars();

  // Define the path points with straight angles
  const pathPoints = [
    { x: 100, y: 500 },  // Start
    { x: 400, y: 500 },  // Move right
    { x: 400, y: 400 },  // First checkpoint (move up)
    { x: 700, y: 400 },  // Move right
    { x: 700, y: 250 },  // Second checkpoint (move up)
  ];

  // Checkpoint positions
  const checkpoints = [
    { id: 1, x: 400, y: 400 },
    { id: 2, x: 700, y: 250 }
  ];

  // Get current checkpoint to show
  const activeCheckpoint = checkpoints.find(cp => cp.id === currentCheckpoint);

  // Update player position and camera when returning to map
  useEffect(() => {
    // Always reset to default view when returning to map
    updateViewBox(0, 0, false);
    
    if (currentCheckpoint === 2) {
      // Player at first checkpoint when showing second
      setPlayerPosition({ x: 400, y: 400 });
    } else if (currentCheckpoint === 1) {
      // Check if we should be at checkpoint or start
      const checkpoint = checkpoints.find(cp => cp.id === 1);
      if (shouldBounce && checkpoint) {
        // Player stays at checkpoint and bounces
        setPlayerPosition({ x: checkpoint.x, y: checkpoint.y });
        performBounce();
      } else {
        // Player at start when showing first checkpoint fresh
        setPlayerPosition({ x: 100, y: 500 });
      }
    }
  }, [currentCheckpoint, shouldBounce]);
  
  const updateViewBox = (centerX: number, centerY: number, zoomed: boolean = true) => {
    if (!zoomed) {
      // Default view
      setViewBox('0 0 800 600');
      setIsZoomedIn(false);
    } else {
      // Zoomed in view - double zoom (half the view dimensions)
      const viewWidth = 400;
      const viewHeight = 300;
      const x = Math.max(0, centerX - viewWidth / 2);
      const y = Math.max(0, centerY - viewHeight / 2);
      setViewBox(`${x} ${y} ${viewWidth} ${viewHeight}`);
      setIsZoomedIn(true);
    }
  };
  
  const performBounce = () => {
    setIsBouncing(true);
    setTimeout(() => {
      setIsBouncing(false);
    }, 1000); // Bounce for 1 second
  };

  const handleCheckpointClick = () => {
    if (!isMoving && activeCheckpoint) {
      setIsMoving(true);
      
      // Zoom in on the player when starting movement
      updateViewBox(playerPosition.x, playerPosition.y, true);
      
      // Define the path segments to follow
      let segments: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
      
      if (currentCheckpoint === 1) {
        // Move from start to first checkpoint (or replay from checkpoint if bouncing)
        if (shouldBounce) {
          // Already at checkpoint, just trigger the scenario
          setTimeout(() => onCheckpointClick(currentCheckpoint), 500);
          setIsMoving(false);
          return;
        }
        segments = [
          { from: { x: 100, y: 500 }, to: { x: 400, y: 500 } }, // Right
          { from: { x: 400, y: 500 }, to: { x: 400, y: 400 } }  // Up
        ];
      } else if (currentCheckpoint === 2) {
        // Move from first checkpoint to second
        segments = [
          { from: { x: 400, y: 400 }, to: { x: 700, y: 400 } }, // Right
          { from: { x: 700, y: 400 }, to: { x: 700, y: 250 } }  // Up
        ];
      }
      
      // Calculate total distance
      const totalDistance = segments.reduce((sum, seg) => {
        const dx = seg.to.x - seg.from.x;
        const dy = seg.to.y - seg.from.y;
        return sum + Math.sqrt(dx * dx + dy * dy);
      }, 0);
      
      const duration = 1500; // 1.5 seconds total
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;
        
        // Calculate position along path
        const targetDistance = totalDistance * eased;
        let accumulatedDistance = 0;
        let newPosition = playerPosition;
        
        for (const segment of segments) {
          const dx = segment.to.x - segment.from.x;
          const dy = segment.to.y - segment.from.y;
          const segmentLength = Math.sqrt(dx * dx + dy * dy);
          
          if (accumulatedDistance + segmentLength >= targetDistance) {
            // We're on this segment
            const segmentProgress = (targetDistance - accumulatedDistance) / segmentLength;
            newPosition = {
              x: segment.from.x + dx * segmentProgress,
              y: segment.from.y + dy * segmentProgress
            };
            break;
          }
          
          accumulatedDistance += segmentLength;
        }
        
        setPlayerPosition(newPosition);
        updateViewBox(newPosition.x, newPosition.y);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsMoving(false);
          setTimeout(() => onCheckpointClick(currentCheckpoint), 300);
        }
      };
      
      requestAnimationFrame(animate);
    }
  };

  // Create SVG path string
  const pathString = pathPoints
    .map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    })
    .join(' ');

  return (
    <div className="min-h-screen bg-gray-600 relative overflow-hidden">
      {/* Header */}
      <div className="fixed top-8 left-0 right-0 flex justify-between px-8 z-10">
        <div className="flex items-center gap-4 bg-gray-800 text-white px-6 py-3 rounded-full">
          <h1 className="text-xl font-medium">{scenario.title}</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-full">
          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          <span className="text-xl font-medium">{totalStars}</span>
        </div>
      </div>

      {/* Map SVG */}
      <svg className="absolute inset-0 w-full h-full" viewBox={viewBox} style={{ transition: 'viewBox 0.5s ease-in-out' }}>
        
        {/* Path */}
        <path
          d={pathString}
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        
        {/* Path inner line for depth */}
        <path
          d={pathString}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
        
        {/* Completed path highlight */}
        {currentCheckpoint === 2 && (
          <path
            d={`M 100 500 L 400 500 L 400 400`}
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        )}
        
        {/* Starting point circle */}
        <circle
          cx={100}
          cy={500}
          r="20"
          fill="#6b7280"
          stroke="white"
          strokeWidth="3"
        />
        
        {/* Checkpoints */}
        {checkpoints.map((checkpoint) => {
          const isActive = checkpoint.id === currentCheckpoint;
          const isCompleted = checkpoint.id < currentCheckpoint;
          
          return (
            <g key={checkpoint.id}>
              {/* Checkpoint glow effect */}
              {isActive && (
                <circle
                  cx={checkpoint.x}
                  cy={checkpoint.y}
                  r="35"
                  fill="#10b981"
                  opacity="0.2"
                  className="animate-pulse"
                />
              )}
              
              {/* Checkpoint */}
              <rect
                x={checkpoint.x - 30}
                y={checkpoint.y - 30}
                width="60"
                height="60"
                rx="8"
                fill={isCompleted ? "#10b981" : isActive ? "#10b981" : "#9ca3af"}
                className={`${isActive ? "cursor-pointer" : ""} ${isActive && shouldBounce ? "animate-pulse-size" : ""}`}
                onClick={isActive ? handleCheckpointClick : undefined}
              />
              
              {/* Checkpoint icon */}
              {isCompleted && (
                <text
                  x={checkpoint.x}
                  y={checkpoint.y + 8}
                  textAnchor="middle"
                  fill="white"
                  fontSize="32"
                >
                  ✓
                </text>
              )}
            </g>
          );
        })}
        
        {/* Player */}
        <g className={isBouncing ? 'animate-bounce' : ''}>
          <image
            href={playerAvatar}
            x={playerPosition.x - 25}
            y={playerPosition.y - 25}
            width="50"
            height="50"
          />
        </g>
      </svg>
      
      {/* Add bounce animation styles */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-bounce {
          animation: bounce 0.5s ease-in-out infinite;
        }
        
        @keyframes pulse-size {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        
        .animate-pulse-size {
          animation: pulse-size 1s ease-in-out infinite;
          transform-origin: center;
          transform-box: fill-box;
        }
      `}</style>
    </div>
  );
};