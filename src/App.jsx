import { Grid, ThemeProvider, CssBaseline } from "@mui/material";
import LogoBox from "./components/LogoBox";
import UserBox from "./components/UserBox";
import UsageBox from "./components/UsageBox";
import UsageChart from "./components/UsageChart";
import Apps from "./components/Apps";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import getTheme from "./theme/Theme";
import Configs from "./components/Configs";
import LanguageIcon from "@mui/icons-material/Language";
import GetInfoRequest from "./utils/GetInfoRequest";
import { ClipLoader } from "react-spinners";
import {
  calculateRemainingTime,
  calculateUsedTimePercentage,
  formatTraffic,
} from "./utils/Helper";
import { ToastContainer } from "react-toastify";
import RadioButtons from "./components/RadioButtons";
import { Helmet } from "react-helmet";
import { normalizeRebeccaProfiles } from "./utils/dataAdapter";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode]);

  const handleLanguageChange = (newLanguage) => {
    i18n.changeLanguage(newLanguage);
  };

  const [dataLinks, setDataLinks] = useState([]);
  const vpnProfiles = useMemo(() => normalizeRebeccaProfiles(data), [data]);

  useEffect(() => {
    GetInfoRequest.getInfo()
      .then((res) => {
        setData(res?.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (data?.links && Array.isArray(data.links)) {
      // Legacy API: links embedded in the response
      const links =
        data.links[data.links.length - 1] === "False"
          ? data.links.slice(0, -1)
          : data.links;
      setDataLinks(links);
    } else if (data) {
      // New API (or legacy without links): fetch configs from subscription URL
      GetInfoRequest.getConfigs().then((res) => {
        if (!res?.data) return;
        const links = typeof res.data === "string" ? res.data.trim() : "";
        const decodedLinks =
          links.includes("vmess") || links.includes("vless")
            ? links
            : decodeBase64(links);
        const configArray = decodedLinks ? decodedLinks.split("\n") : [];
        setDataLinks(
          configArray[configArray.length - 1] === "False"
            ? configArray.slice(0, -1)
            : configArray
        );
      });
    }
  }, [data]);


  const getAdjustedUrl = (subURL) => {
    if (import.meta.env.VITE_PANEL_DOMAIN) {
      return subURL.replace(
        /https?:\/\/[^/]+/,
        import.meta.env.VITE_PANEL_DOMAIN
      );
    } else if (subURL?.includes("https://")) {
      return subURL;
    }

    return `${window.location.origin}${subURL}`;
  };

  const title = data?.username
    ? `${data.username} Sub Info`
    : `${import.meta.env.VITE_BRAND_NAME || "Ourenus"} Sub Info`;

  const isOffSections = useMemo(() => {
    try {
      const envValue = import.meta.env.VITE_OFF_SECTIONS;
      if (envValue) {
        return JSON.parse(envValue);
      }
      return {
        appsBox: true,
        logoBox: true,
        timeBox: true,
        usageBox: true,
        userBox: true,
        supportBox: true,
        configs: true,
        chartBox: true,
      };
    } catch (error) {
      console.error("Failed to parse VITE_OFF_SECTIONS:", error);
      return {
        appsBox: true,
        logoBox: true,
        timeBox: true,
        usageBox: true,
        userBox: true,
        supportBox: true,
        configs: true,
        chartBox: true,
      };
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <title>{title}</title>
        <meta
          name="description"
          content="Powered by https://github.com/MatinDehghanian"
        />
      </Helmet>
      <Grid container justifyContent={"center"}>
        <Grid
          container
          justifyContent={"center"}
          item
          xs={11.5}
          sm={7}
          md={6}
          lg={5}
          xl={3.5}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              <ClipLoader size={50} color="#3498db" loading={loading} />
            </div>
          ) : (
            data && (
              <>
                <RadioButtons
                  setIsDarkMode={setIsDarkMode}
                  handleLanguageChange={handleLanguageChange}
                />
                {isOffSections.logoBox && <LogoBox />}
                {isOffSections.userBox && (
                  <UserBox
                    data={data}
                    subLink={getAdjustedUrl(
                      data?.subscription_url || window.location.pathname.split("#")[0]
                    )}
                  />
                )}
                {isOffSections.usageBox && (
                  <UsageBox
                    type="usage"
                    value={Number(
                      ((data?.used_traffic / data?.data_limit) * 100).toFixed(2)
                    )}
                    total={formatTraffic(data?.data_limit, t)}
                    remaining={
                      data?.data_limit === null
                        ? formatTraffic(null, t)
                        : formatTraffic(
                            data?.data_limit - data?.used_traffic,
                            t
                          )
                    }
                  />
                )}
                {isOffSections.timeBox && (
                  <UsageBox
                    type="time"
                    value={calculateUsedTimePercentage(
                      data?.expire
                    )}
                    remaining={calculateRemainingTime(
                      data?.expire,
                      t
                    )}
                  />
                )}
                {isOffSections.chartBox !== false &&
                  isOffSections.usageChart !== false &&
                  data?.supports_usage_chart && (
                    <UsageChart userData={data} />
                  )}
                {isOffSections.appsBox && (
                  <Apps subLink={getAdjustedUrl(
                    data?.subscription_url || window.location.pathname.split("#")[0]
                  )} />
                )}
                {isOffSections.configs && (
                  <Configs
                    title={t("configsList")}
                    style={{
                      direction: lang === "fa" ? "rtl" : "ltr",
                      background: theme.colors.configs[theme.palette.mode],
                      boxShadow: "0 0 30px 10px rgba(0, 0, 0, 0.1)",
                      width: "100%",
                      border:
                        theme.palette.mode === "light"
                          ? "1px solid #ffffff6b"
                          : "none",
                      borderRadius: "16px",
                      paddingY: ".4rem",
                      color:
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255)"
                          : "rgb(0 0 0)",
                    }}
                    iconColor={theme.colors.configs.revert[theme.palette.mode]}
                    icon={
                      <LanguageIcon
                        fontSize="large"
                        sx={{
                          marginInlineStart: "1rem",
                          color:
                            theme.colors.configs.revert[theme.palette.mode],
                        }}
                      />
                    }
                    configs={dataLinks}
                    profiles={vpnProfiles}
                    btnStyle={{
                      cursor: "pointer",
                      borderRadius: "30%",
                      padding: ".3rem",
                      background: theme.colors.glassColor,
                      "&:hover": {
                        background:
                          theme.colors.configs.revert[theme.palette.mode],
                      },
                    }}
                    liStyle={{
                      background: theme.colors.glassColor,
                    }}
                    isFirst={!isOffSections.appsBox}
                  />
                )}
              </>
            )
          )}
        </Grid>
        <ToastContainer
          position="top-right"
          theme="colored"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ marginTop: "1rem", borderRadius: "16px" }}
        />
      </Grid>
    </ThemeProvider>
  );
}

export default App;

function decodeBase64(encodedString) {
  try {
    const decodedString = atob(encodedString);
    return decodedString;
  } catch (error) {
    console.error("Failed to decode base64:", error);
    return "";
  }
}
