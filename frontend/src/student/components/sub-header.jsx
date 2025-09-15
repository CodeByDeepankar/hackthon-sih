import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Flame, Gift, Calendar, Target, Trophy, Star } from "lucide-react";
import { useI18n } from "@/i18n/useI18n";

export function SubHeader({ showStreak = false, showChallenge = false, showRewards = false, showProgress = false, user, todaysChallenge, nextLevelRewards, customContent, className = "" }) { if (!showStreak && !showChallenge && !showRewards && !showProgress && !customContent) {
    return null; }
  const { t } = useI18n();

  return (
    <div className={ `px-4 py-3 border-b bg-white border-gray-200 dark:bg-[#0b0b0f] dark:border-[#1f2430] light:text-black ${className }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 overflow-x-auto">
          { /* Streak Counter */ }
          { showStreak && user && (
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 whitespace-nowrap bg-orange-50 dark:bg-slate-800">
              <Flame className="w-4 h-4 text-orange-500 dark:text-slate-200" />
              <div className="flex flex-col">
                <span className="text-xs font-medium light:text-black dark:text-slate-100">{t.subHeader.dayStreak({ count: user.streak })}</span>
                <span className="text-xs light:text-black/80 dark:text-slate-300">{t.subHeader.keepItGoing()}</span>
              </div>
            </div>
          )}

          { /* Today's Challenge */ }
          { showChallenge && todaysChallenge && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 whitespace-nowrap bg-blue-50 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">{todaysChallenge.icon }</span>
                <div className="flex flex-col">
                  <span className="text-xs font-medium light:text-black dark:text-slate-100">{ todaysChallenge.title }</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full overflow-hidden bg-blue-200 dark:bg-slate-700">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={ { width: `${(todaysChallenge.progress / todaysChallenge.target) * 100 }%` }}
                      />
                    </div>
                    <span className="text-xs light:text-black/80 dark:text-slate-200">
                      { todaysChallenge.progress }/{ todaysChallenge.target }
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs light:text-black dark:bg-slate-700 dark:text-slate-200">
                +{ todaysChallenge.reward } {t.common.xp()}
              </Badge>
            </div>
          )}

          { /* XP Progress to Next Level */ }
          { showProgress && user && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 whitespace-nowrap bg-yellow-50 dark:bg-slate-800">
              <Star className="w-4 h-4 text-yellow-600 dark:text-slate-200" />
              <div className="flex flex-col">
                <span className="text-xs font-medium light:text-black dark:text-slate-100">
                  {t.subHeader.xpToLevel({ xp: user.xpToNextLevel - user.xp, level: user.level + 1 })}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full overflow-hidden bg-yellow-200 dark:bg-slate-700">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                      style={ { width: `${(user.xp / user.xpToNextLevel) * 100 }%` }}
                    />
                  </div>
                  <span className="text-xs light:text-black/80 dark:text-slate-200">
                    { Math.round((user.xp / user.xpToNextLevel) * 100) }%
                  </span>
                </div>
              </div>
            </div>
          )}

          { /* Next Level Rewards */ }
          { showRewards && nextLevelRewards && nextLevelRewards.length > 0 && (
            <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-2 whitespace-nowrap">
              <Gift className="w-4 h-4 text-purple-500" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-purple-700">{t.subHeader.nextRewards()}</span>
                <div className="flex items-center gap-1">
                  {nextLevelRewards.slice(0, 3).map((reward, index) => (
                    <span key={index } className="text-xs">
                      { reward.icon }
                    </span>
                  ))}
                  <span className="text-xs text-purple-600">{ nextLevelRewards[0].name }</span>
                </div>
              </div>
            </div>
          )}

          { /* Custom Content */ }
          { customContent && (
            <div className="flex-1">
              {customContent }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}