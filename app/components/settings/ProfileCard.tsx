import { useStore } from '@nanostores/react';
import { profileStore } from '~/lib/stores/profile';
import { ExitIcon, ExternalLinkIcon, PersonIcon } from '@radix-ui/react-icons';
import { LoadingTransition } from '@ui/Loading';
import { useAuth } from '@workos-inc/authkit-react';

export function ProfileCard() {
  const profile = useStore(profileStore);
  const { signOut } = useAuth();
  const handleLogout = () => {
    signOut({ returnTo: window.location.origin });
  };

  return (
    <LoadingTransition loadingProps={{ className: 'h-[12.375rem]' }}>
      {profile && (
        <div className="group w-full overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-lg shadow-blue-100/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 dark:border-blue-800 dark:from-bolt-elements-background-depth-1 dark:to-blue-950/20 dark:shadow-blue-900/30 dark:hover:shadow-blue-800/40">
          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
                Profil utilisateur
              </h2>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-20" />
            </div>
            
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="size-24 min-w-24 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-blue-200 p-1 shadow-lg ring-4 ring-blue-100 dark:from-blue-800 dark:to-blue-900 dark:ring-blue-900/50">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile?.username || 'User'}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                      <PersonIcon className="size-10 text-white" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 size-6 rounded-full border-4 border-white bg-green-500 dark:border-bolt-elements-background-depth-1" />
              </div>

              {/* Info utilisateur */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-content-primary">{profile.username}</h3>
                {profile.email && (
                  <p className="mt-1 text-sm text-content-secondary flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
                    {profile.email}
                  </p>
                )}
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="https://dashboard.convex.dev/profile"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 dark:bg-blue-500 dark:hover:bg-blue-600 dark:hover:shadow-blue-900/50"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    <span>Gérer le profil Convex</span>
                  </a>
                  
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-all hover:border-red-400 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:bg-transparent dark:text-red-400 dark:hover:border-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    <ExitIcon className="h-4 w-4" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </LoadingTransition>
  );
}
