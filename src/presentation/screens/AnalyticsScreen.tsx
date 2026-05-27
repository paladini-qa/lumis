import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Share, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useFinanceStore } from '../../application/store/useFinanceStore';
import { Colors } from '../theme/colors';
import { formatBRL } from '../theme/currency';
import Svg, { Path, Rect, Circle, G } from 'react-native-svg';

// Custom simple interpolate helper to be bulletproof under Jest mock environments
const customInterpolate = (value: number, inputRange: number[], outputRange: number[]) => {
  'worklet';
  const [inputMin, inputMax] = inputRange;
  const [outputMin, outputMax] = outputRange;
  if (value <= inputMin) return outputMin;
  if (value >= inputMax) return outputMax;
  return outputMin + ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin);
};

export function AnalyticsScreen() {
  const { transactions, categories, paymentMethods } = useFinanceStore();

  const [selectedMonth, setSelectedMonth] = useState(new Date(2026, 4, 1));
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [is3DDrillDownActive, setIs3DDrillDownActive] = useState(false);

  // Reanimated rotation value for 3D slice flip
  const rotateValue = useSharedValue(0);

  const flipDrillDown = () => {
    setIs3DDrillDownActive(!is3DDrillDownActive);
    rotateValue.value = withSpring(rotateValue.value === 0 ? 180 : 0, { damping: 14, stiffness: 80 });
  };

  const drillDownFrontStyle = useAnimatedStyle(() => {
    const spin = customInterpolate(rotateValue.value, [0, 180], [0, 180]);
    return {
      transform: [{ rotateY: `${spin}deg` }],
      opacity: rotateValue.value > 90 ? 0 : 1,
      zIndex: rotateValue.value > 90 ? 0 : 1,
    };
  });

  const drillDownBackStyle = useAnimatedStyle(() => {
    const spin = customInterpolate(rotateValue.value, [0, 180], [180, 360]);
    return {
      transform: [{ rotateY: `${spin}deg` }],
      opacity: rotateValue.value > 90 ? 1 : 0,
      zIndex: rotateValue.value > 90 ? 1 : 0,
    };
  });

  // Filter transactions for selected statement month cycle
  const currentMonthTransactions = transactions.filter(
    (t) =>
      t.statementMonth.getUTCMonth() === selectedMonth.getMonth() &&
      t.statementMonth.getUTCFullYear() === selectedMonth.getFullYear()
  );

  const monthExpenses = currentMonthTransactions.filter((t) => t.type === 'expense');
  const totalMonthExpense = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category
  const categoryData = categories.map((cat) => {
    const amount = monthExpenses
      .filter((t) => t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = totalMonthExpense > 0 ? (amount / totalMonthExpense) * 100 : 0;
    return {
      ...cat,
      amount,
      percentage,
    };
  }).filter((c) => c.amount > 0);

  // Get payment methods distribution for selected category (Drill down)
  const selectedCatObj = categories.find((c) => c.id === selectedCategoryId);
  const selectedCategoryExpenses = monthExpenses.filter((t) => t.categoryId === selectedCategoryId);
  const selectedCategoryTotal = selectedCategoryExpenses.reduce((sum, t) => sum + t.amount, 0);

  const pmDrillDownData = paymentMethods.map((pm) => {
    const amount = selectedCategoryExpenses
      .filter((t) => t.paymentMethodId === pm.id)
      .reduce((sum, t) => sum + t.amount, 0);
    const percentage = selectedCategoryTotal > 0 ? (amount / selectedCategoryTotal) * 100 : 0;
    return {
      ...pm,
      amount,
      percentage,
    };
  }).filter((p) => p.amount > 0);

  // Dynamic Month Switchers
  const handlePrevMonth = () => {
    const next = new Date(selectedMonth.getTime());
    next.setMonth(next.getMonth() - 1);
    setSelectedMonth(next);
    setSelectedCategoryId(null);
    setIs3DDrillDownActive(false);
    rotateValue.value = 0;
  };

  const handleNextMonth = () => {
    const next = new Date(selectedMonth.getTime());
    next.setMonth(next.getMonth() + 1);
    setSelectedMonth(next);
    setSelectedCategoryId(null);
    setIs3DDrillDownActive(false);
    rotateValue.value = 0;
  };

  const formatMonthYear = (date: Date): string => {
    const months = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Bespoke SVG Donut paths generation
  let accumulatedAngle = 0;
  const donutCenter = 100;
  const donutRadius = 75;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const donutSlices = categoryData.map((cat, idx) => {
    const slicePercent = cat.percentage / 100;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + slicePercent;
    accumulatedAngle = endAngle;

    const [startX, startY] = getCoordinatesForPercent(startAngle);
    const [endX, endY] = getCoordinatesForPercent(endAngle);

    const x1 = donutCenter + startX * donutRadius;
    const y1 = donutCenter + startY * donutRadius;
    const x2 = donutCenter + endX * donutRadius;
    const y2 = donutCenter + endY * donutRadius;

    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    // SVG path string representing the slice arc
    const pathData = [
      `M ${x1} ${y1}`,
      `A ${donutRadius} ${donutRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
    ].join(' ');

    const isSelected = selectedCategoryId === cat.id;

    return (
      <Path
        key={cat.id}
        d={pathData}
        fill="none"
        stroke={cat.color}
        strokeWidth={isSelected ? '24' : '16'}
        strokeLinecap="round"
        onPress={() => {
          setSelectedCategoryId(isSelected ? null : cat.id);
        }}
      />
    );
  });

  // YoY Inflow vs Card Outflow Mock Data (aggregating last 4 months)
  const yoyMonths = [
    { label: 'FEB', income: 15000, cardOutflow: 4200 },
    { label: 'MAR', income: 18000, cardOutflow: 5100 },
    { label: 'APR', income: 16500, cardOutflow: 3800 },
    { label: 'MAY', income: 20000, cardOutflow: 6500 },
  ];

  // CSV Exporter
  const handleExportCSV = async () => {
    try {
      const csvHeader = 'Date,Description,Type,Amount (R$),Category,Payment Method,Notes\r\n';
      const csvRows = currentMonthTransactions
        .map((t) => {
          const pm = paymentMethods.find((p) => p.id === t.paymentMethodId)?.name || 'N/A';
          const cat = categories.find((c) => c.id === t.categoryId)?.name || 'N/A';
          return `"${t.date.toISOString().slice(0, 10)}","${t.description}","${t.type}",${t.amount.toFixed(2)},"${cat}","${pm}","${t.notes || ''}"`;
        })
        .join('\r\n');

      const csvContent = csvHeader + csvRows;

      await Share.share({
        title: 'Lumis Monthly Statement',
        message: csvContent,
      });
    } catch (error: any) {
      Alert.alert('Export Failed', error.message);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 }}
    >
      <Text style={styles.sectionTitle}>Expenditure Reports</Text>
      <Text style={styles.sectionSubtitle}>Statement-based multi-dimensional analysis</Text>

      {/* Dynamic Month Scroll Selector */}
      <View style={styles.monthSelector}>
        <Pressable onPress={handlePrevMonth} style={styles.arrowButton}>
          <Text style={{ color: Colors.gold.DEFAULT, fontSize: 14, fontWeight: '700' }}>◀</Text>
        </Pressable>
        <Text style={styles.monthLabel}>{formatMonthYear(selectedMonth)}</Text>
        <Pressable onPress={handleNextMonth} style={styles.arrowButton}>
          <Text style={{ color: Colors.gold.DEFAULT, fontSize: 14, fontWeight: '700' }}>▶</Text>
        </Pressable>
      </View>

      {/* 3D Flip Card Container for Donut & Detail Drill Down */}
      <View style={{ height: 260, marginBottom: 20 }}>
        {/* Front View (Donut Chart) */}
        {!is3DDrillDownActive ? (
          <Animated.View style={[styles.glassCard, styles.drillDownCard, drillDownFrontStyle]}>
            {totalMonthExpense === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: Colors.ivory.mute, fontSize: 13, fontFamily: 'Manrope' }}>
                  No expenditures recorded for this statement month.
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                {/* SVG Donut */}
                <Svg width="180" height="180" viewBox="0 0 200 200" style={{ marginRight: 16 }}>
                  <G transform="rotate(-90 100 100)">
                    <Circle cx="100" cy="100" r="75" fill="none" stroke={`${Colors.surfaceMedium}`} strokeWidth="8" />
                    {donutSlices}
                  </G>
                  <Circle cx="100" cy="100" r="58" fill={Colors.surface} />
                </Svg>

                {/* Slices legend */}
                <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                  <View style={{ gap: 8 }}>
                    {categoryData.map((cat) => (
                      <Pressable
                        key={cat.id}
                        onPress={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
                      >
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cat.color }} />
                        <Text
                          style={{
                            color: selectedCategoryId === cat.id ? Colors.gold.bright : Colors.ivory.DEFAULT,
                            fontFamily: 'Manrope',
                            fontSize: 12,
                            fontWeight: selectedCategoryId === cat.id ? '700' : '400',
                          }}
                        >
                          {cat.name} ({Math.round(cat.percentage)}%)
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}
          </Animated.View>
        ) : (
          /* Back View (Details / Payment Method breakdown) */
          <Animated.View style={[styles.glassCard, styles.drillDownCard, drillDownBackStyle]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'Marcellus', fontSize: 15, fontWeight: '600', color: Colors.gold.DEFAULT, marginBottom: 12 }}>
                Breakdown: {selectedCatObj?.name || 'Category'}
              </Text>
              <Text style={{ fontSize: 11, fontFamily: 'Manrope', color: Colors.ivory.mute, marginBottom: 16 }}>
                Total spent in {formatMonthYear(selectedMonth)}: {formatBRL(selectedCategoryTotal)}
              </Text>

              {pmDrillDownData.length === 0 ? (
                <Text style={{ color: Colors.ivory.mute, fontSize: 12 }}>No card transactions for this slice.</Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {pmDrillDownData.map((pm) => (
                    <View key={pm.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: Colors.ivory.DEFAULT, fontFamily: 'Manrope', fontSize: 13 }}>{pm.name}</Text>
                      <Text style={{ color: Colors.gold.bright, fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: '600' }}>
                        {formatBRL(pm.amount)} ({Math.round(pm.percentage)}%)
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </View>

      {/* Drill-down Toggle Actions */}
      {selectedCategoryId && (
        <Pressable onPress={flipDrillDown} style={styles.drillDownToggle}>
          <Text style={styles.drillDownToggleText}>
            {is3DDrillDownActive ? '◀ BACK TO DONUT' : '🔍 VIEW CARD DETAILS (3D DRILL-DOWN)'}
          </Text>
        </Pressable>
      )}

      {/* YoY Income vs Statement Outflows Chart */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>YoY Outflows Comparison</Text>
      <View style={styles.glassCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.positive }} />
            <Text style={{ color: Colors.ivory.mute, fontSize: 11, fontFamily: 'Manrope' }}>Income</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: Colors.negative }} />
            <Text style={{ color: Colors.ivory.mute, fontSize: 11, fontFamily: 'Manrope' }}>Outflows</Text>
          </View>
        </View>

        {/* Custom SVG Bar Chart */}
        <Svg width="100%" height="150" viewBox="0 0 300 150">
          {/* Grid lines */}
          <Rect x="0" y="30" width="300" height="1" fill={`${Colors.ivory.mute}1A`} />
          <Rect x="0" y="70" width="300" height="1" fill={`${Colors.ivory.mute}1A`} />
          <Rect x="0" y="110" width="300" height="1" fill={`${Colors.ivory.mute}1A`} />

          {/* Render Bars */}
          {yoyMonths.map((m, idx) => {
            const xOffset = 30 + idx * 70;
            // Income bar height
            const incHeight = (m.income / 25000) * 110;
            // Statement outflow bar height
            const cardHeight = (m.cardOutflow / 25000) * 110;

            return (
              <G key={m.label}>
                {/* Income Bar */}
                <Rect
                  x={xOffset}
                  y={120 - incHeight}
                  width="18"
                  height={incHeight}
                  rx="3"
                  fill={Colors.positive}
                />
                {/* Outflow Bar */}
                <Rect
                  x={xOffset + 22}
                  y={120 - cardHeight}
                  width="18"
                  height={cardHeight}
                  rx="3"
                  fill={Colors.negative}
                />
                {/* Month label */}
                <Text
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: 10,
                    fill: Colors.ivory.mute,
                    textAlign: 'center',
                  }}
                  x={xOffset + 12}
                  y="140"
                >
                  {m.label}
                </Text>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* CSV Exporter Action */}
      <Pressable onPress={handleExportCSV} style={styles.exportButton}>
        <Text style={styles.exportButtonText}>📥 EXPORT STATEMENT CYCLE (CSV)</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'Marcellus',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gold.DEFAULT,
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: 'Manrope',
    fontSize: 12,
    color: Colors.ivory.mute,
    marginBottom: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: `${Colors.gold.DEFAULT}1A`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthLabel: {
    fontFamily: 'Marcellus',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.gold.bright,
    letterSpacing: 2,
  },
  glassCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Colors.gold.DEFAULT}1A`,
    padding: 16,
  },
  drillDownCard: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  drillDownToggle: {
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.gold.DEFAULT,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  drillDownToggleText: {
    color: Colors.gold.bright,
    fontFamily: 'Manrope',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exportButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.gold.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  exportButtonText: {
    color: Colors.background,
    fontFamily: 'Manrope',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1,
  },
});
