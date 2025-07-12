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
}

export const MapScreen: React.FC<MapScreenProps> = ({
  currentCheckpoint,
  scenario,
  onCheckpointClick,
  mapImage,
  playerAvatar
}) => {
  const [playerPosition, setPlayerPosition] = useState({ x: 100, y: 500 });
  const [isMoving, setIsMoving] = useState(false);
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

  // Update player position when returning to map
  useEffect(() => {
    if (currentCheckpoint === 2) {
      // Player at first checkpoint when showing second
      setPlayerPosition({ x: 400, y: 400 });
    } else {
      // Player at start when showing first
      setPlayerPosition({ x: 100, y: 500 });
    }
  }, [currentCheckpoint]);

  const handleCheckpointClick = () => {
    if (!isMoving && activeCheckpoint) {
      setIsMoving(true);
      
      // Define the path segments to follow
      let segments: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
      
      if (currentCheckpoint === 1) {
        // Move from start to first checkpoint
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
      <svg className="absolute inset-0 w-full h-full">
        
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
                className={isActive ? "cursor-pointer" : ""}
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
        <image
          href={playerAvatar}
          x={playerPosition.x - 25}
          y={playerPosition.y - 25}
          width="50"
          height="50"
        />
      </svg>
    </div>
  );
};