// ============================================================
// animations/AnimationRouter.tsx
// Routes concept ID to the correct animation component.
// Future: Add more animations here as concepts are added.
// ============================================================

import React from 'react';
import TriangleAnimation from './TriangleAnimation';
import PythagorasAnimation from './PythagorasAnimation';
import RectangleAnimation from './RectangleAnimation';
import CircleAnimation from './CircleAnimation';
import SimpleInterestAnimation from './SimpleInterestAnimation';
import OhmsLawAnimation from './OhmsLawAnimation';

interface AnimationRouterProps {
  conceptId: string;
  step: number;
  speed: number;
  isPlaying: boolean;
  accentColor: string;
  onStepComplete?: () => void;
}

const AnimationRouter: React.FC<AnimationRouterProps> = ({ conceptId, ...props }) => {
  switch (conceptId) {
    case 'triangle-area':
      return <TriangleAnimation {...props} />;
    case 'pythagoras':
      return <PythagorasAnimation {...props} />;
    case 'rectangle-area':
      return <RectangleAnimation {...props} />;
    case 'circle-area':
      return <CircleAnimation {...props} />;
    case 'simple-interest':
      return <SimpleInterestAnimation {...props} />;
    case 'ohms-law':
      return <OhmsLawAnimation {...props} />;
    default:
      return (
        <div className="flex items-center justify-center w-full h-full bg-[#0D0D14] rounded-xl">
          <div className="text-center text-[#5A5A72]">
            <p className="text-4xl mb-3">🚧</p>
            <p className="text-sm">Animation coming soon</p>
          </div>
        </div>
      );
  }
};

export default AnimationRouter;
