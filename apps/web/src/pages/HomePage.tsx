import { useNavigate } from 'react-router-dom';
import { RocketIcon, CodeIcon, LayersIcon } from '@radix-ui/react-icons';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-bolt-elements-background-depth-1 to-bolt-elements-background-depth-2 p-8">
      <div className="max-w-4xl text-center">
        <h1 className="mb-6 text-6xl font-bold text-bolt-elements-textPrimary">
          Chef by Convex
        </h1>
        <p className="mb-12 text-xl text-bolt-elements-textSecondary">
          Build full-stack applications with AI-powered development
        </p>

        <div className="mb-12 grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<RocketIcon className="h-8 w-8" />}
            title="Fast Development"
            description="Generate complete applications in minutes"
          />
          <FeatureCard
            icon={<CodeIcon className="h-8 w-8" />}
            title="Visual Editor"
            description="Drag & drop components with live preview"
          />
          <FeatureCard
            icon={<LayersIcon className="h-8 w-8" />}
            title="Real-time Build"
            description="Watch your app build in real-time"
          />
        </div>

        <button
          onClick={() => navigate('/editor')}
          className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Start Building
        </button>
      </div>

      <footer className="mt-16 text-sm text-bolt-elements-textSecondary">
        Sprint 3.0 - Migration Complete ✅
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-6 transition-colors hover:bg-bolt-elements-background-depth-3">
      <div className="mb-4 flex justify-center text-blue-500">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-bolt-elements-textPrimary">{title}</h3>
      <p className="text-sm text-bolt-elements-textSecondary">{description}</p>
    </div>
  );
}
