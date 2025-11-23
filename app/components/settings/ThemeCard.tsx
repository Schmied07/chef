import { useStore } from '@nanostores/react';
import { toggleTheme } from '~/lib/stores/theme';
import { themeStore } from '~/lib/stores/theme';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

export function ThemeCard() {
  const theme = useStore(themeStore);
  const isDark = theme === 'dark';

  return (
    <div className="group overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-lg shadow-blue-100/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 dark:border-blue-800 dark:from-bolt-elements-background-depth-1 dark:to-blue-950/20 dark:shadow-blue-900/30 dark:hover:shadow-blue-800/40">
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
            Apparence
          </h2>
          <p className="mt-1 text-sm text-content-secondary">Personnalisez l'apparence de l'interface</p>
        </div>

        <div className="space-y-6">
          {/* Sélecteur de thème */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50 p-6 dark:bg-blue-950/30">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                {isDark ? <MoonIcon className="h-6 w-6 text-white" /> : <SunIcon className="h-6 w-6 text-white" />}
              </div>
              <div>
                <div className="font-semibold text-content-primary">Thème {isDark ? 'Sombre' : 'Clair'}</div>
                <div className="text-sm text-content-secondary">
                  {isDark ? 'Mode nuit activé' : 'Mode jour activé'}
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={() => toggleTheme()}
              className="group/toggle relative h-8 w-16 rounded-full bg-gray-300 shadow-inner transition-all duration-300 hover:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700"
              aria-label={`Passer au thème ${isDark ? 'clair' : 'sombre'}`}
            >
              <div
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-lg transition-all duration-300 ease-out ${
                  isDark ? 'left-9' : 'left-1'
                } group-hover/toggle:scale-110`}
              />
            </button>
          </div>

          {/* Prévisualisation des couleurs */}
          <div>
            <div className="mb-3 text-sm font-medium text-content-primary">Palette de couleurs</div>
            <div className="grid grid-cols-5 gap-3">
              <div className="group/color relative overflow-hidden rounded-lg">
                <div className="h-16 bg-blue-500 transition-transform group-hover/color:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/color:opacity-100">
                  <span className="text-xs font-medium text-white drop-shadow-lg">Bleu 500</span>
                </div>
              </div>
              <div className="group/color relative overflow-hidden rounded-lg">
                <div className="h-16 bg-blue-600 transition-transform group-hover/color:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/color:opacity-100">
                  <span className="text-xs font-medium text-white drop-shadow-lg">Bleu 600</span>
                </div>
              </div>
              <div className="group/color relative overflow-hidden rounded-lg">
                <div className="h-16 bg-blue-700 transition-transform group-hover/color:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/color:opacity-100">
                  <span className="text-xs font-medium text-white drop-shadow-lg">Bleu 700</span>
                </div>
              </div>
              <div className="group/color relative overflow-hidden rounded-lg">
                <div className="h-16 bg-blue-400 transition-transform group-hover/color:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/color:opacity-100">
                  <span className="text-xs font-medium text-white drop-shadow-lg">Bleu 400</span>
                </div>
              </div>
              <div className="group/color relative overflow-hidden rounded-lg">
                <div className="h-16 bg-blue-800 transition-transform group-hover/color:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/color:opacity-100">
                  <span className="text-xs font-medium text-white drop-shadow-lg">Bleu 800</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/30">
            <p className="text-sm text-content-secondary">
              🎨 Le thème bleu est appliqué à travers toute l'interface pour une expérience visuelle cohérente et moderne.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
