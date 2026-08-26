/* eslint-disable react/prop-types */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import RefreshIcon from "@mui/icons-material/Refresh";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import GetInfoRequest from "../utils/GetInfoRequest";
import { formatBytes } from "../utils/Helper";
import { normalizeUsageData } from "../utils/dataAdapter";

const PERIODS = ["24H", "7D", "30D", "12M", "All"];

const calculateDateRange = (period) => {
  const now = new Date();
  const endDate = new Date(now);
  let startDate;
  let apiPeriod;

  switch (period) {
    case "24H":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      apiPeriod = "hour";
      break;
    case "7D":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      apiPeriod = "day";
      break;
    case "30D":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      apiPeriod = "day";
      break;
    case "12M":
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      apiPeriod = "month";
      break;
    case "All":
      startDate = new Date(0);
      apiPeriod = "month";
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      apiPeriod = "day";
  }

  return { startDate, endDate, apiPeriod };
};

const formatDateLabel = (date, period, lang) => {
  const locale = lang === "fa" ? "fa-IR" : lang === "ru" ? "ru-RU" : "en-US";

  switch (period) {
    case "24H":
      return date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      });
    case "7D":
    case "30D":
      return date.toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });
    case "12M":
      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
      });
    case "All":
      return date.toLocaleDateString(locale, {
        year: "2-digit",
        month: "short",
      });
    default:
      return date.toLocaleDateString(locale);
  }
};

const CustomTooltip = ({ active, payload, isDark, t }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const accentColor = isDark
      ? "rgba(180, 185, 230, 1)"
      : "rgba(72, 76, 112, 1)";
    return (
      <Box
        sx={{
          background: isDark
            ? "rgba(38, 42, 62, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          border: isDark
            ? "1px solid rgba(143, 141, 179, 0.3)"
            : "1px solid rgba(72, 76, 112, 0.25)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          borderRadius: "12px",
          padding: "0.6rem 1rem",
          textAlign: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.75rem",
            color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
            marginBottom: "0.2rem",
          }}
        >
          {item.formattedDate}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.95rem",
            fontWeight: "bold",
            color: accentColor,
          }}
        >
          {t("usageChart.usage")}: {item.formattedUsage}
        </Typography>
      </Box>
    );
  }
  return null;
};

const UsageChart = ({ userData }) => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const isDark = theme.palette.mode === "dark";
  const lang = i18n.language;
  const isRtl = lang === "fa";

  // Base brand colors matching rgba(72, 76, 112, 1)
  const brandMain = isDark ? "rgba(143, 141, 179, 1)" : "rgba(72, 76, 112, 1)";
  const brandGradient = isDark
    ? "linear-gradient(135deg, rgba(117, 122, 166, 1) 0%, rgba(82, 88, 125, 1) 100%)"
    : "linear-gradient(135deg, rgba(72, 76, 112, 1) 0%, rgba(52, 56, 88, 1) 100%)";
  const brandGradientHover = isDark
    ? "linear-gradient(135deg, rgba(143, 141, 179, 1) 0%, rgba(100, 106, 148, 1) 100%)"
    : "linear-gradient(135deg, rgba(92, 97, 138, 1) 0%, rgba(62, 66, 100, 1) 100%)";

  const [period, setPeriod] = useState("7D");
  const [chartType, setChartType] = useState("area");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is on hold or has 0 lifetime used traffic
  const isOnHoldOrNoUsage = useMemo(() => {
    if (!userData || userData.is_rebecca) return false;
    const isHold =
      userData.status === "on_hold" ||
      userData.activated === null;
    const isZeroTraffic =
      (userData.lifetime_used_traffic !== undefined &&
        userData.lifetime_used_traffic === 0) ||
      (userData.lifetime_used_traffic === undefined &&
        userData.used_traffic === 0);
    return isHold || isZeroTraffic;
  }, [userData]);

  const fetchStats = useCallback(async () => {
    if (isOnHoldOrNoUsage || (userData && userData.supports_usage_chart === false)) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate, apiPeriod } = calculateDateRange(period);
      const res = await GetInfoRequest.getUsage(apiPeriod, startDate, endDate);
      const rawStats = res?.data?.stats;
      const statsList = userData?.is_rebecca
        ? normalizeUsageData(res?.data, period === "24H")
        : rawStats && typeof rawStats === "object" && !Array.isArray(rawStats)
          ? rawStats[-1] || Object.values(rawStats)[0] || []
          : [];
      const hasUsage = statsList.some((item) =>
        userData?.is_rebecca
          ? item.usedTraffic > 0
          : (item.total_traffic || 0) > 0
      );

      if (statsList.length && (!userData?.is_rebecca || hasUsage)) {
        const formatted = statsList.map((item) => {
          const d = new Date(
            userData?.is_rebecca ? item.timestamp : item.period_start
          );
          const bytes = userData?.is_rebecca
            ? item.usedTraffic
            : item.total_traffic || 0;
          const fb = formatBytes(bytes, t);
          return {
            date: d.toISOString().split("T")[0],
            usage: bytes,
            formattedDate: formatDateLabel(d, period, lang),
            formattedUsage: `${fb.value} ${fb.unit}`,
          };
        });
        setData(formatted);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Error fetching usage chart data:", err);
      setError(err?.message || "Failed to load usage chart data");
    } finally {
      setLoading(false);
    }
  }, [period, lang, t, isOnHoldOrNoUsage, userData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const summary = useMemo(() => {
    if (!data.length || isOnHoldOrNoUsage) {
      return {
        total: { value: "0", unit: t("B") },
        avg: { value: "0", unit: t("B") },
        peak: { value: "0", unit: t("B") },
      };
    }
    const totalBytes = data.reduce((acc, curr) => acc + curr.usage, 0);
    const avgBytes = totalBytes / Math.max(data.length, 1);
    const peakBytes = Math.max(...data.map((d) => d.usage), 0);

    return {
      total: formatBytes(totalBytes, t),
      avg: formatBytes(avgBytes, t),
      peak: formatBytes(peakBytes, t),
    };
  }, [data, t, isOnHoldOrNoUsage]);

  const descriptionKey = useMemo(() => {
    switch (period) {
      case "24H":
        return "description24h";
      case "7D":
        return "description7d";
      case "30D":
        return "description30d";
      case "12M":
        return "description12m";
      default:
        return "descriptionAll";
    }
  }, [period]);

  const avgLabelKey = useMemo(() => {
    if (period === "24H") return "avgHourly";
    if (period === "12M" || period === "All") return "avgMonthly";
    return "avgDaily";
  }, [period]);

  const peakLabelKey = useMemo(() => {
    if (period === "24H") return "peakHour";
    if (period === "12M" || period === "All") return "peakMonth";
    return "peakDay";
  }, [period]);

  // If user is from legacy API that doesn't support usage chart endpoint, don't render
  if (
    userData &&
    (userData.supports_usage_chart === false ||
      (userData.is_rebecca && !error && !data.length))
  ) {
    return null;
  }

  return (
    <Grid item container justifyContent="space-around" xs={11}>
      <Box
        sx={{
          borderRadius: "16px",
          marginTop: "1rem",
          padding: "1.2rem",
          background: theme.colors.box[theme.palette.mode],
          boxShadow: "0 0 3rem 10px rgba(0, 0, 0, 0.1)",
          direction: isRtl ? "rtl" : "ltr",
          width: "100%",
          border: theme.colors.box.border[theme.palette.mode],
          color: theme.colors.BWColor[theme.palette.mode],
        }}
      >
        {/* Header: Title + Type Toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.8rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShowChartIcon sx={{ color: brandMain }} />
            <Typography sx={{ fontWeight: "bold", fontSize: "1.05rem" }}>
              {t("usageChart.title")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              background: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.05)",
              borderRadius: "50px",
              padding: "2px",
              gap: "2px",
              ...(isOnHoldOrNoUsage && {
                opacity: 0.5,
                cursor: "not-allowed",
              }),
            }}
          >
            <Button
              size="small"
              disabled={isOnHoldOrNoUsage}
              onClick={() => setChartType("area")}
              sx={{
                borderRadius: "50px",
                minWidth: "40px",
                padding: "4px 12px",
                fontSize: "0.75rem",
                background:
                  chartType === "area" ? brandGradient : "transparent",
                color: chartType === "area" ? "#fff" : "inherit",
                boxShadow:
                  chartType === "area"
                    ? "0 2px 8px rgba(72, 76, 112, 0.4)"
                    : "none",
                "&:hover": {
                  background:
                    chartType === "area"
                      ? brandGradientHover
                      : isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.08)",
                },
                ...(isOnHoldOrNoUsage && {
                  pointerEvents: "none",
                }),
              }}
            >
              <ShowChartIcon sx={{ fontSize: "1.1rem", marginInlineEnd: "4px" }} />
              {t("usageChart.area")}
            </Button>
            <Button
              size="small"
              disabled={isOnHoldOrNoUsage}
              onClick={() => setChartType("bar")}
              sx={{
                borderRadius: "50px",
                minWidth: "40px",
                padding: "4px 12px",
                fontSize: "0.75rem",
                background:
                  chartType === "bar" ? brandGradient : "transparent",
                color: chartType === "bar" ? "#fff" : "inherit",
                boxShadow:
                  chartType === "bar"
                    ? "0 2px 8px rgba(72, 76, 112, 0.4)"
                    : "none",
                "&:hover": {
                  background:
                    chartType === "bar"
                      ? brandGradientHover
                      : isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.08)",
                },
                ...(isOnHoldOrNoUsage && {
                  pointerEvents: "none",
                }),
              }}
            >
              <BarChartIcon sx={{ fontSize: "1.1rem", marginInlineEnd: "4px" }} />
              {t("usageChart.bar")}
            </Button>
          </Box>
        </Box>

        {/* Periods Switcher */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "0.6rem",
            flexWrap: "wrap",
            ...(isOnHoldOrNoUsage && {
              opacity: 0.5,
            }),
          }}
        >
          <Typography
            sx={{
              fontSize: "0.8rem",
              opacity: 0.7,
              marginInlineEnd: "0.3rem",
            }}
          >
            {t("usageChart.timePeriod")}:
          </Typography>
          {PERIODS.map((p) => {
            const isSelected = period === p;
            const periodKey =
              p === "24H"
                ? "24h"
                : p === "7D"
                ? "7d"
                : p === "30D"
                ? "30d"
                : p === "12M"
                ? "12m"
                : "all";

            return (
              <Button
                key={p}
                size="small"
                disabled={isOnHoldOrNoUsage}
                onClick={() => setPeriod(p)}
                sx={{
                  borderRadius: "50px",
                  padding: "2px 10px",
                  fontSize: "0.72rem",
                  minWidth: "unset",
                  fontWeight: isSelected ? "bold" : "normal",
                  background: isSelected
                    ? brandGradient
                    : isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "rgba(0, 0, 0, 0.04)",
                  color: isSelected ? "#fff" : "inherit",
                  boxShadow: isSelected
                    ? "0 2px 6px rgba(72, 76, 112, 0.35)"
                    : "none",
                  "&:hover": {
                    background: isSelected
                      ? brandGradientHover
                      : isDark
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(0, 0, 0, 0.08)",
                  },
                  ...(isOnHoldOrNoUsage && {
                    pointerEvents: "none",
                  }),
                }}
              >
                {t(`usageChart.${periodKey}`)}
              </Button>
            );
          })}
        </Box>

        {/* Dynamic Description */}
        <Typography
          sx={{
            fontSize: "0.75rem",
            opacity: 0.65,
            marginBottom: "1rem",
            lineHeight: 1.5,
          }}
        >
          {t(`usageChart.${descriptionKey}`)}{" "}
          {t("usageChart.descriptionSuffix")}
        </Typography>

        {/* Chart Canvas Area */}
        <Box
          sx={{
            background: isDark
              ? "rgba(0, 0, 0, 0.25)"
              : "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: "14px",
            padding: "0.8rem 0.4rem",
            marginBottom: "1rem",
            minHeight: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            direction: "ltr",
          }}
        >
          {isOnHoldOrNoUsage ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.8rem",
                paddingY: "2.5rem",
                textAlign: "center",
                direction: isRtl ? "rtl" : "ltr",
              }}
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDark
                    ? "rgba(143, 141, 179, 0.15)"
                    : "rgba(72, 76, 112, 0.1)",
                  color: brandMain,
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: "1.6rem" }} />
              </Box>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  fontWeight: "bold",
                  opacity: 0.85,
                }}
              >
                {t("usageChart.noUsageYet")}
              </Typography>
            </Box>
          ) : loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.8rem",
                paddingY: "2.5rem",
              }}
            >
              <CircularProgress size={36} sx={{ color: brandMain }} />
              <Typography sx={{ fontSize: "0.85rem", opacity: 0.7 }}>
                {t("usageChart.loading")}
              </Typography>
            </Box>
          ) : error || !data.length ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.6rem",
                paddingY: "2rem",
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.85rem",
                  color: theme.palette.error.main,
                  opacity: 0.85,
                }}
              >
                {error || t("usageChart.noData")}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={fetchStats}
                startIcon={<RefreshIcon />}
                sx={{
                  borderRadius: "50px",
                  fontSize: "0.75rem",
                  textTransform: "none",
                  borderColor: isDark
                    ? "rgba(143, 141, 179, 0.5)"
                    : "rgba(72, 76, 112, 0.5)",
                  color: isDark ? "#fff" : brandMain,
                  "&:hover": {
                    borderColor: brandMain,
                    background: isDark
                      ? "rgba(143, 141, 179, 0.15)"
                      : "rgba(72, 76, 112, 0.1)",
                  },
                }}
              >
                {t("usageChart.retry")}
              </Button>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              {chartType === "area" ? (
                <AreaChart
                  data={data}
                  margin={{ top: 10, right: 15, left: 5, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="usageGradientArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={
                          isDark
                            ? "rgba(143, 141, 179, 1)"
                            : "rgba(72, 76, 112, 1)"
                        }
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          isDark
                            ? "rgba(117, 122, 166, 1)"
                            : "rgba(52, 56, 88, 1)"
                        }
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"
                    }
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#B0B3C7" : "#555977",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    width={55}
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#B0B3C7" : "#555977",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => {
                      const fb = formatBytes(val, t);
                      return `${fb.value} ${fb.unit}`;
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip isDark={isDark} t={t} />}
                  />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke={
                      isDark
                        ? "rgba(143, 141, 179, 1)"
                        : "rgba(72, 76, 112, 1)"
                    }
                    strokeWidth={2.5}
                    fill="url(#usageGradientArea)"
                    dot={{
                      fill: isDark
                        ? "rgba(143, 141, 179, 1)"
                        : "rgba(72, 76, 112, 1)",
                      strokeWidth: 2,
                      r: 3,
                    }}
                    activeDot={{
                      r: 6,
                      stroke: "#fff",
                      strokeWidth: 2,
                      fill: isDark
                        ? "rgba(143, 141, 179, 1)"
                        : "rgba(72, 76, 112, 1)",
                    }}
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={data}
                  margin={{ top: 10, right: 15, left: 5, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="usageGradientBar"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={
                          isDark
                            ? "rgba(160, 165, 210, 1)"
                            : "rgba(92, 97, 138, 1)"
                        }
                        stopOpacity={0.95}
                      />
                      <stop
                        offset="100%"
                        stopColor={
                          isDark
                            ? "rgba(117, 122, 166, 1)"
                            : "rgba(72, 76, 112, 1)"
                        }
                        stopOpacity={0.85}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={
                      isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"
                    }
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="formattedDate"
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#B0B3C7" : "#555977",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    width={55}
                    tick={{
                      fontSize: 11,
                      fill: isDark ? "#B0B3C7" : "#555977",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => {
                      const fb = formatBytes(val, t);
                      return `${fb.value} ${fb.unit}`;
                    }}
                  />
                  <Tooltip
                    content={<CustomTooltip isDark={isDark} t={t} />}
                  />
                  <Bar
                    dataKey="usage"
                    fill="url(#usageGradientBar)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </Box>

        {/* 3-Column Summary Stats */}
        <Grid
          container
          sx={{
            background: isDark
              ? "rgba(255, 255, 255, 0.04)"
              : "rgba(0, 0, 0, 0.03)",
            borderRadius: "12px",
            padding: "0.8rem 0.5rem",
            textAlign: "center",
          }}
        >
          {/* Total */}
          <Grid item xs={4}>
            <Typography sx={{ fontSize: "0.72rem", opacity: 0.65, mb: 0.3 }}>
              {t("usageChart.totalUsage")}
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: "bold" }}>
              {summary.total.value}{" "}
              <Typography
                component="span"
                sx={{ fontSize: "0.75rem", fontWeight: "normal", opacity: 0.8 }}
              >
                {summary.total.unit}
              </Typography>
            </Typography>
          </Grid>

          {/* Average */}
          <Grid item xs={4}>
            <Typography sx={{ fontSize: "0.72rem", opacity: 0.65, mb: 0.3 }}>
              {t(`usageChart.${avgLabelKey}`)}
            </Typography>
            <Typography sx={{ fontSize: "0.95rem", fontWeight: "bold" }}>
              {summary.avg.value}{" "}
              <Typography
                component="span"
                sx={{ fontSize: "0.75rem", fontWeight: "normal", opacity: 0.8 }}
              >
                {summary.avg.unit}
              </Typography>
            </Typography>
          </Grid>

          {/* Peak */}
          <Grid item xs={4}>
            <Typography sx={{ fontSize: "0.72rem", opacity: 0.65, mb: 0.3 }}>
              {t(`usageChart.${peakLabelKey}`)}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: "bold",
                color: brandMain,
              }}
            >
              {summary.peak.value}{" "}
              <Typography
                component="span"
                sx={{ fontSize: "0.75rem", fontWeight: "normal", opacity: 0.8 }}
              >
                {summary.peak.unit}
              </Typography>
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Grid>
  );
};

export default UsageChart;
