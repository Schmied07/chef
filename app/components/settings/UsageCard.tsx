import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { getStoredTeamSlug } from '~/lib/stores/convexTeams';
import { convexTeamsStore } from '~/lib/stores/convexTeams';
import { TeamSelector } from '~/components/convex/TeamSelector';
import { Callout } from '@ui/Callout';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { Button } from '@ui/Button';
import { ProgressBar } from '@ui/ProgressBar';
import { useUsage } from '~/lib/stores/usage';
import { renderTokenCount } from '~/lib/convexUsage';

export function UsageCard() {
  const teams = useStore(convexTeamsStore);
  const [selectedTeamSlug, setSelectedTeamSlug] = useState(getStoredTeamSlug() ?? teams?.[0]?.slug ?? null);
  useEffect(() => {
    if (teams && !selectedTeamSlug) {
      setSelectedTeamSlug(teams[0]?.slug);
    }
    // No need to run if only `selectedTeamSlug` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teams]);

  const { isLoadingUsage, usagePercentage, used, quota, isPaidPlan } = useUsage({
    teamSlug: selectedTeamSlug,
  });

  return (
    <div className="group overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 shadow-lg shadow-blue-100/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/50 dark:border-blue-800 dark:from-bolt-elements-background-depth-1 dark:to-blue-950/20 dark:shadow-blue-900/30 dark:hover:shadow-blue-800/40">
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600">
              Utilisation Chef
            </h2>
            <p className="mt-1 text-sm text-content-secondary">Suivez votre consommation de tokens</p>
          </div>
          <div className="ml-auto">
            <TeamSelector selectedTeamSlug={selectedTeamSlug} setSelectedTeamSlug={setSelectedTeamSlug} />
          </div>
        </div>

        {/* Informations */}
        <div className="mb-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
          <ul className="space-y-2 text-sm text-content-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Votre équipe Convex inclut des tokens pour Chef</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Sur les abonnements payés, l'utilisation supplémentaire sera facturée</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
              <span>Sur les plans gratuits, Chef sera indisponible après avoir atteint la limite</span>
            </li>
          </ul>
        </div>

        {/* Barre de progression */}
        <div className="space-y-6">
          <div className="">
            {isLoadingUsage ? (
              <div className="h-8 w-full overflow-hidden rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700">
                <div className="animate-shimmer h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative h-8 w-full overflow-hidden rounded-full bg-gray-200 shadow-inner dark:bg-gray-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg transition-all duration-500 ease-out dark:from-blue-400 dark:to-blue-500"
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  >
                    <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {usagePercentage.toFixed(1)}% utilisé
                  </span>
                  <span className="text-content-secondary">
                    {renderTokenCount(used || 0)} / {renderTokenCount(quota || 0)} tokens
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Statistiques en cartes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 dark:from-blue-950/50 dark:to-blue-900/50">
              <div className="text-xs font-medium text-blue-600 dark:text-blue-400">TOKENS UTILISÉS</div>
              <div className="mt-2 text-2xl font-bold text-content-primary">
                {isLoadingUsage ? (
                  <div className="h-8 w-24 animate-pulse rounded bg-blue-200 dark:bg-blue-800" />
                ) : (
                  renderTokenCount(used || 0)
                )}
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 dark:from-purple-950/50 dark:to-purple-900/50">
              <div className="text-xs font-medium text-purple-600 dark:text-purple-400">QUOTA TOTAL</div>
              <div className="mt-2 text-2xl font-bold text-content-primary">
                {isLoadingUsage ? (
                  <div className="h-8 w-24 animate-pulse rounded bg-purple-200 dark:bg-purple-800" />
                ) : (
                  renderTokenCount(quota || 0)
                )}
              </div>
            </div>
          </div>

          {/* Alerte ou bouton de gestion */}
          {!isLoadingUsage && !isPaidPlan && used > quota ? (
            <Callout variant="upsell" className="min-w-full rounded-xl">
              <div className="flex w-full flex-col gap-4">
                <h3 className="font-semibold">Vous avez utilisé tous les tokens inclus dans votre plan gratuit.</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    href={`https://dashboard.convex.dev/t/${selectedTeamSlug}/settings/billing?source=chef`}
                    icon={<ExternalLinkIcon />}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Améliorer votre plan
                  </Button>
                  <span className="text-sm">ou ajoutez votre propre clé API ci-dessous pour envoyer plus de messages.</span>
                </div>
              </div>
            </Callout>
          ) : (
            <Button
              icon={<ExternalLinkIcon />}
              inline
              href={`https://dashboard.convex.dev/t/${selectedTeamSlug}/settings/billing`}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Gérer l'abonnement
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
