// components/SeasonScreen.js
// Season Mode hub — with career stats tab + first-run onboarding overlay

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, GRADIENTS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { NFL_TEAMS } from '../constants/rosters';

const getTeamInfo = (teamId) =>
  NFL_TEAMS.find(t => t.id === teamId) || { id: teamId, name: teamId.toUpperCase(), emoji: '🏈', shortName: teamId };

const ONBOARDING_KEY = 'season_onboarding_seen';

// ── Season Screen ─────────────────────────────────────────────────────────────
const SeasonScreen = ({
  playerTeamId,
  currentWeek,
  schedule,
  leaderboard,
  playerRecord,
  weekResult,
  isLastWeek,
  currentScheduleWeek,
  seasonPhase,
  playoffTeams,
  playoffBracket,
  playoffRound,
  hasTeamError,
  onStartGame,
  onAdvanceWeek,
  onStartPlayoffGame,
  onBackToMenu,
}) => {
  const [tab,           setTab]           = useState('schedule');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [seasonStats,   setSeasonStats]   = useState(null);

  const playerTeam = getTeamInfo(playerTeamId);

  // Check if first time in season mode
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(seen => {
      if (!seen) setShowOnboarding(true);
    });
    AsyncStorage.getItem('seasonStats').then(raw => {
      if (raw) setSeasonStats(JSON.parse(raw));
    });
  }, []);

  const dismissOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  // ── First-run onboarding overlay ─────────────────────────────────────────
  const renderOnboarding = () => {
    if (!showOnboarding) return null;
    return (
      <View style={styles.onboardingOverlay}>
        <LinearGradient colors={['rgba(5,13,5,0.98)', 'rgba(0,0,0,0.96)']} style={styles.onboardingPanel}>
          <Text style={styles.onboardingTitle}>🏈 SEASON MODE</Text>
          <View style={styles.onboardingItems}>
            {[
              { icon: '📅', title: 'SCHEDULE TAB', desc: '8 weeks, one division per week. Tap PLAY WEEK to start each game.' },
              { icon: '📊', title: 'STANDINGS TAB', desc: 'All 32 teams ranked by wins. Top 4 make the playoffs after Week 8.' },
              { icon: '🏆', title: 'CAREER TAB', desc: 'Your all-time season history and championship count.' },
              { icon: '🎮', title: 'EACH GAME', desc: 'Standard Spades rules. Win the game, get a W on your record.' },
              { icon: '⚡', title: 'PLAYOFFS', desc: 'Top 4 teams. Semi-finals then Championship. Win it all.' },
            ].map(item => (
              <View key={item.icon} style={styles.onboardingItem}>
                <Text style={styles.onboardingIcon}>{item.icon}</Text>
                <View style={styles.onboardingText}>
                  <Text style={styles.onboardingItemTitle}>{item.title}</Text>
                  <Text style={styles.onboardingItemDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.onboardingBtn} onPress={dismissOnboarding} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.onboardingBtnInner}>
              <Text style={[styles.onboardingBtnText, { color: '#000' }]}>LET'S GO 🏈</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  // ── Team error guard ─────────────────────────────────────────────────────
  if (hasTeamError) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={GRADIENTS.fieldDeep} style={styles.content}>
          <Text style={[styles.pageTitle, { color: COLORS.lose }]}>NO TEAM SELECTED</Text>
          <Text style={styles.pageSub}>Go back and pick a team to start a season</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={onBackToMenu} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.fieldLight, COLORS.field]} style={styles.primaryBtnInner}>
              <Text style={styles.primaryBtnText}>← BACK TO MENU</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // ── Playoff phase ────────────────────────────────────────────────────────
  if (seasonPhase === 'playoff') {
    return (
      <View style={styles.root}>
        <LinearGradient colors={GRADIENTS.fieldDeep} style={styles.content}>
          <Text style={styles.pageTitle}>🏆 PLAYOFFS</Text>
          <Text style={styles.pageSub}>Tournament of 4</Text>
          {playoffBracket && (
            <View style={styles.bracket}>
              <BracketGame label="Semi-Final 1" home={playoffBracket.semi1.home} away={playoffBracket.semi1.away} playerTeamId={playerTeamId} />
              <BracketGame label="Semi-Final 2" home={playoffBracket.semi2.home} away={playoffBracket.semi2.away} playerTeamId={playerTeamId} />
              {playoffBracket.final && (
                <BracketGame label="🏆 Championship" home={playoffBracket.final.home} away={playoffBracket.final.away} playerTeamId={playerTeamId} isChampionship />
              )}
            </View>
          )}
          <TouchableOpacity style={styles.primaryBtn} onPress={onStartPlayoffGame} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.primaryBtnInner}>
              <Text style={[styles.primaryBtnText, { color: '#000' }]}>
                {playoffRound === 'semi' ? '▶ PLAY SEMI-FINAL' : '▶ PLAY CHAMPIONSHIP'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // ── Eliminated ───────────────────────────────────────────────────────────
  if (seasonPhase === 'eliminated') {
    const top4 = playoffTeams.map(getTeamInfo);
    return (
      <View style={styles.root}>
        <LinearGradient colors={GRADIENTS.fieldDeep} style={styles.content}>
          <Text style={[styles.pageTitle, { color: COLORS.lose }]}>SEASON OVER</Text>
          <Text style={styles.pageSub}>Better luck next season</Text>
          <Text style={styles.eliminatedEmoji}>💀</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YOUR RECORD</Text>
            <Text style={styles.bigRecord}>{playerRecord.wins}W – {playerRecord.losses}L</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PLAYOFF TEAMS</Text>
            {top4.map((t, i) => (
              <View key={t.id} style={styles.playoffRow}>
                <Text style={styles.playoffSeed}>#{i + 1}</Text>
                <Text style={styles.playoffEmoji}>{t.emoji}</Text>
                <Text style={styles.playoffName}>{t.shortName}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={onBackToMenu} activeOpacity={0.8}>
            <LinearGradient colors={[COLORS.fieldLight, COLORS.field]} style={styles.primaryBtnInner}>
              <Text style={styles.primaryBtnText}>← BACK TO MENU</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // ── Champion ─────────────────────────────────────────────────────────────
  if (seasonPhase === 'champion') {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#1a1000', '#2a2000']} style={styles.content}>
          <Text style={[styles.pageTitle, { color: COLORS.gold }]}>CHAMPION!</Text>
          <Text style={styles.pageSub}>Spades Season Champion</Text>
          <Text style={styles.championEmoji}>🏆</Text>
          <Text style={styles.championTeam}>{playerTeam.emoji} {playerTeam.name}</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEASON RECORD</Text>
            <Text style={styles.bigRecord}>{playerRecord.wins}W – {playerRecord.losses}L</Text>
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={onBackToMenu} activeOpacity={0.8}>
            <LinearGradient colors={GRADIENTS.gold} style={styles.primaryBtnInner}>
              <Text style={[styles.primaryBtnText, { color: '#000' }]}>← BACK TO MENU</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // ── Main hub ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <LinearGradient colors={GRADIENTS.fieldDeep} style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>{playerTeam.emoji} {playerTeam.shortName}</Text>
            <Text style={styles.pageSub}>Season • Week {currentWeek} of 8 • {playerRecord.wins}W–{playerRecord.losses}L</Text>
          </View>
          <TouchableOpacity onPress={onBackToMenu} style={styles.menuBtn}>
            <Text style={styles.menuBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Result banner */}
        {weekResult && (
          <LinearGradient
            colors={weekResult === 'win' ? ['rgba(0,230,118,0.2)', 'rgba(0,230,118,0.05)'] : ['rgba(255,82,82,0.2)', 'rgba(255,82,82,0.05)']}
            style={styles.resultBanner}
          >
            <Text style={styles.resultEmoji}>{weekResult === 'win' ? '🏆' : '💀'}</Text>
            <Text style={[styles.resultText, { color: weekResult === 'win' ? COLORS.win : COLORS.lose }]}>
              {weekResult === 'win' ? 'W — VICTORY' : 'L — DEFEAT'}
            </Text>
            <Text style={styles.resultSub}>Week {currentWeek - 1} result recorded</Text>
          </LinearGradient>
        )}

        {/* Tab bar — 3 tabs now */}
        <View style={styles.tabBar}>
          {[
            { id: 'schedule',  label: '📅 SCHEDULE'  },
            { id: 'standings', label: '📊 STANDINGS'  },
            { id: 'career',    label: '🏆 CAREER'     },
          ].map(t => (
            <TouchableOpacity key={t.id} style={[styles.tab, tab === t.id && styles.tabActive]} onPress={() => setTab(t.id)}>
              <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {tab === 'schedule'  && renderSchedule()}
          {tab === 'standings' && renderStandings()}
          {tab === 'career'    && renderCareer()}
        </ScrollView>

        {renderCTA()}
      </LinearGradient>

      {renderOnboarding()}
    </View>
  );

  function renderSchedule() {
    return (
      <View>
        {schedule.map((week) => {
          const isPast    = week.week < currentWeek;
          const isCurrent = week.week === currentWeek;
          return (
            <View key={week.week} style={[styles.weekRow, isCurrent && styles.weekRowCurrent, isPast && styles.weekRowPast]}>
              <View style={styles.weekLeft}>
                <Text style={[styles.weekNum, isCurrent && styles.weekNumActive]}>WK {week.week}</Text>
                <Text style={styles.weekDiv}>{week.label}</Text>
              </View>
              <View style={styles.weekOpponents}>
                {week.opponents.map(tid => {
                  const t = getTeamInfo(tid);
                  return <Text key={tid} style={styles.weekOpponentChip}>{t.emoji} {t.shortName}</Text>;
                })}
              </View>
              {isCurrent && <View style={styles.weekBadge}><Text style={styles.weekBadgeText}>NOW</Text></View>}
              {isPast    && <Text style={styles.weekDone}>✓</Text>}
            </View>
          );
        })}
      </View>
    );
  }

  function renderStandings() {
    return (
      <View>
        <View style={styles.standingsHeader}>
          <Text style={[styles.standingsCol, { flex: 3 }]}>TEAM</Text>
          <Text style={styles.standingsCol}>W</Text>
          <Text style={styles.standingsCol}>L</Text>
          <Text style={styles.standingsCol}>PCT</Text>
        </View>
        {leaderboard.map((team, i) => {
          const isPlayer  = team.id === playerTeamId;
          const isPlayoff = i < 4;
          const pct = team.wins + team.losses > 0
            ? (team.wins / (team.wins + team.losses)).toFixed(3).replace('0.', '.')
            : '.000';
          return (
            <View key={team.id} style={[styles.standingsRow, isPlayer && styles.standingsRowPlayer, isPlayoff && !isPlayer && styles.standingsRowPlayoff]}>
              <View style={[styles.standingsTeam, { flex: 3 }]}>
                <Text style={styles.standingsSeed}>#{i + 1}</Text>
                <Text style={styles.standingsEmoji}>{team.emoji}</Text>
                <Text style={[styles.standingsName, isPlayer && { color: COLORS.gold }]}>{team.shortName}</Text>
                {isPlayer && <Text style={styles.youBadge}>YOU</Text>}
              </View>
              <Text style={[styles.standingsCol, { color: COLORS.win }]}>{team.wins}</Text>
              <Text style={[styles.standingsCol, { color: COLORS.lose }]}>{team.losses}</Text>
              <Text style={styles.standingsCol}>{pct}</Text>
            </View>
          );
        })}
        <Text style={styles.standingsNote}>Top 4 teams advance to playoffs</Text>
      </View>
    );
  }

  function renderCareer() {
    const s = seasonStats;
    if (!s || s.seasonsPlayed === 0) {
      return (
        <View style={styles.emptyCareer}>
          <Text style={styles.emptyCareerEmoji}>🏈</Text>
          <Text style={styles.emptyCareerText}>No completed seasons yet.</Text>
          <Text style={styles.emptyCareerText}>Finish your first season to see career stats.</Text>
        </View>
      );
    }
    return (
      <View>
        <View style={styles.careerSection}>
          <Text style={styles.careerSectionTitle}>📋 ALL-TIME RECORD</Text>
          <CareerRow label="Seasons Played"      value={s.seasonsPlayed} />
          <CareerRow label="Playoff Appearances"  value={s.playoffAppearances} highlight />
          <CareerRow label="Championships 🏆"    value={s.championships} highlight={s.championships > 0} />
          <CareerRow label="Best Record"          value={`${s.bestRecord.wins}W – ${s.bestRecord.losses}L`} />
        </View>
        {s.history?.length > 0 && (
          <View style={styles.careerSection}>
            <Text style={styles.careerSectionTitle}>📅 SEASON HISTORY</Text>
            {s.history.map((entry, i) => {
              const t = getTeamInfo(entry.teamId);
              return (
                <View key={i} style={styles.historyRow}>
                  <Text style={styles.historyEmoji}>{t.emoji}</Text>
                  <Text style={styles.historyTeam}>{t.shortName}</Text>
                  <Text style={styles.historyRecord}>{entry.wins}W–{entry.losses}L</Text>
                  <Text style={[styles.historyBadge,
                    entry.wonChampionship && styles.historyChamp,
                    entry.madePlayoffs && !entry.wonChampionship && styles.historyPlayoff,
                  ]}>
                    {entry.wonChampionship ? '🏆 CHAMP' : entry.madePlayoffs ? '🏅 PLAYOFFS' : 'MISSED'}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }

  function renderCTA() {
    if (weekResult !== null) {
      return (
        <TouchableOpacity style={styles.primaryBtn} onPress={onAdvanceWeek} activeOpacity={0.8}>
          <LinearGradient colors={GRADIENTS.win} style={styles.primaryBtnInner}>
            <Text style={styles.primaryBtnText}>
              {isLastWeek ? '→ SEE PLAYOFF PICTURE' : `→ WEEK ${currentWeek + 1}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity style={styles.primaryBtn} onPress={onStartGame} activeOpacity={0.8}>
        <LinearGradient colors={GRADIENTS.gold} style={styles.primaryBtnInner}>
          <Text style={[styles.primaryBtnText, { color: '#000' }]}>▶ PLAY WEEK {currentWeek}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
};

const CareerRow = ({ label, value, highlight }) => (
  <View style={styles.careerRow}>
    <Text style={styles.careerLabel}>{label}</Text>
    <Text style={[styles.careerValue, highlight && { color: COLORS.win }]}>{value}</Text>
  </View>
);

const BracketGame = ({ label, home, away, playerTeamId, isChampionship }) => {
  const h = getTeamInfo(home), a = getTeamInfo(away);
  return (
    <View style={[styles.bracketGame, isChampionship && styles.bracketGameChamp]}>
      <Text style={styles.bracketLabel}>{label}</Text>
      <View style={styles.bracketTeams}>
        <TeamChip team={h} isPlayer={home === playerTeamId} />
        <Text style={styles.bracketVs}>VS</Text>
        <TeamChip team={a} isPlayer={away === playerTeamId} />
      </View>
    </View>
  );
};

const TeamChip = ({ team, isPlayer }) => (
  <View style={[styles.teamChip, isPlayer && styles.teamChipPlayer]}>
    <Text style={styles.teamChipEmoji}>{team.emoji}</Text>
    <Text style={[styles.teamChipName, isPlayer && { color: COLORS.gold }]}>{team.shortName}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, paddingHorizontal: SPACING.md, paddingTop: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  pageTitle: { ...TYPOGRAPHY.displayM, color: COLORS.gold },
  pageSub:   { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub, marginTop: 2 },
  menuBtn:   { padding: SPACING.sm },
  menuBtnText: { color: COLORS.textMuted, fontSize: 18, fontWeight: '700' },
  resultBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  resultEmoji: { fontSize: 24 },
  resultText:  { ...TYPOGRAPHY.h2, flex: 1 },
  resultSub:   { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  tabBar: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: RADIUS.pill, padding: 4, marginBottom: SPACING.sm },
  tab: { flex: 1, paddingVertical: SPACING.sm - 2, borderRadius: RADIUS.pill, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.goldGlow, borderWidth: 1, borderColor: COLORS.borderGold },
  tabText:       { ...TYPOGRAPHY.label, color: COLORS.textMuted, fontSize: 8 },
  tabTextActive: { ...TYPOGRAPHY.label, color: COLORS.gold, fontSize: 8 },
  scroll: { flex: 1, marginBottom: SPACING.sm },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm, borderRadius: RADIUS.sm, marginBottom: 6, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  weekRowCurrent: { borderColor: COLORS.borderGold, backgroundColor: COLORS.goldGlow },
  weekRowPast:    { opacity: 0.5 },
  weekLeft: { width: 80 },
  weekNum:        { ...TYPOGRAPHY.label, color: COLORS.textMuted },
  weekNumActive:  { color: COLORS.gold },
  weekDiv:        { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub, fontSize: 10 },
  weekOpponents:  { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  weekOpponentChip: { ...TYPOGRAPHY.label, color: COLORS.textPrimary, fontSize: 9, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.pill },
  weekBadge: { backgroundColor: COLORS.gold, borderRadius: RADIUS.pill, paddingHorizontal: 8, paddingVertical: 2 },
  weekBadgeText: { color: '#000', fontSize: 9, fontWeight: '800' },
  weekDone: { color: COLORS.win, fontSize: 16, fontWeight: '700' },
  standingsHeader: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  standingsCol:  { ...TYPOGRAPHY.label, color: COLORS.textMuted, width: 40, textAlign: 'center' },
  standingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  standingsRowPlayer: { backgroundColor: 'rgba(255,215,0,0.06)' },
  standingsRowPlayoff: { backgroundColor: 'rgba(0,230,118,0.04)' },
  standingsTeam: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  standingsSeed: { ...TYPOGRAPHY.label, color: COLORS.textMuted, width: 24 },
  standingsEmoji: { fontSize: 14 },
  standingsName:  { ...TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, fontWeight: '700' },
  youBadge: { backgroundColor: COLORS.gold, borderRadius: RADIUS.pill, paddingHorizontal: 4, paddingVertical: 1, color: '#000', fontSize: 7, fontWeight: '900' },
  standingsNote: { ...TYPOGRAPHY.label, color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.sm },
  primaryBtn: { borderRadius: RADIUS.pill, overflow: 'hidden', marginTop: SPACING.sm },
  primaryBtnInner: { paddingVertical: SPACING.md, alignItems: 'center' },
  primaryBtnText: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, letterSpacing: 1 },
  eliminatedEmoji: { fontSize: 64, textAlign: 'center', marginVertical: SPACING.md },
  championEmoji:   { fontSize: 80, textAlign: 'center', marginVertical: SPACING.md },
  championTeam: { ...TYPOGRAPHY.displayL, color: COLORS.gold, textAlign: 'center', marginBottom: SPACING.md },
  bigRecord: { ...TYPOGRAPHY.displayM, color: COLORS.gold, textAlign: 'center', marginVertical: SPACING.sm },
  section: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.borderGold },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMuted, marginBottom: SPACING.sm },
  playoffRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 4 },
  playoffSeed: { ...TYPOGRAPHY.label, color: COLORS.textMuted, width: 24 },
  playoffEmoji: { fontSize: 20 },
  playoffName:  { ...TYPOGRAPHY.body, color: COLORS.textPrimary, fontWeight: '700' },
  bracket: { gap: SPACING.sm, marginBottom: SPACING.md },
  bracketGame: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  bracketGameChamp: { borderColor: COLORS.borderGold, backgroundColor: COLORS.goldGlow },
  bracketLabel: { ...TYPOGRAPHY.h3, color: COLORS.textMuted, marginBottom: SPACING.sm },
  bracketTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bracketVs:    { ...TYPOGRAPHY.h2, color: COLORS.textMuted },
  teamChip: { flex: 1, alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: RADIUS.sm, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  teamChipPlayer: { borderColor: COLORS.borderGold, backgroundColor: COLORS.goldGlow },
  teamChipEmoji: { fontSize: 24 },
  teamChipName:  { ...TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, fontWeight: '700' },

  // Career tab
  careerSection: { backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.borderGold },
  careerSectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textMuted, marginBottom: SPACING.sm },
  careerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.xs },
  careerLabel: { ...TYPOGRAPHY.body, color: COLORS.textSub },
  careerValue: { ...TYPOGRAPHY.body, fontWeight: '800', color: COLORS.gold },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs, gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  historyEmoji: { fontSize: 16 },
  historyTeam:  { ...TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, fontWeight: '700', flex: 1 },
  historyRecord: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub },
  historyBadge: { ...TYPOGRAPHY.label, color: COLORS.textMuted, fontSize: 8 },
  historyChamp:  { color: COLORS.gold },
  historyPlayoff: { color: COLORS.win },
  emptyCareer: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyCareerEmoji: { fontSize: 48 },
  emptyCareerText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, textAlign: 'center' },

  // Onboarding overlay
  onboardingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 100 },
  onboardingPanel: { width: '90%', maxHeight: '85%', borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.borderGold, ...SHADOWS.goldGlow },
  onboardingTitle: { ...TYPOGRAPHY.displayM, color: COLORS.gold, textAlign: 'center', marginBottom: SPACING.md },
  onboardingItems: { gap: SPACING.sm, marginBottom: SPACING.lg },
  onboardingItem: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'flex-start' },
  onboardingIcon: { fontSize: 24, width: 32 },
  onboardingText: { flex: 1 },
  onboardingItemTitle: { ...TYPOGRAPHY.h3, color: COLORS.gold, marginBottom: 2 },
  onboardingItemDesc:  { ...TYPOGRAPHY.bodySmall, color: COLORS.textSub, lineHeight: 16 },
  onboardingBtn: { borderRadius: RADIUS.pill, overflow: 'hidden' },
  onboardingBtnInner: { paddingVertical: SPACING.md, alignItems: 'center' },
  onboardingBtnText: { ...TYPOGRAPHY.h2, letterSpacing: 1 },
});

export default SeasonScreen;
