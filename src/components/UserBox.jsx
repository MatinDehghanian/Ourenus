/* eslint-disable react/prop-types */
import { Button, Grid, useTheme } from "@mui/material";
import BoxS from "./Box";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import QrModal from "./QrModal";
import QrCodeOutlinedIcon from "@mui/icons-material/QrCodeOutlined";

const UserBox = ({ data, subLink }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const [statusData, setStatusData] = useState("");

  useEffect(() => {
    if (data?.status) {
      // New API (and some legacy responses) provide status directly
      setStatusData(data.status);
    } else if (data?.expired || data?.data_limit_reached) {
      // Legacy API fallback
      setStatusData("expired");
    } else if (data && data.enabled === false) {
      setStatusData("disabled");
    } else if (data?.is_active) {
      setStatusData("active");
    } else if (data && data.activated === null) {
      setStatusData("on_hold");
    } else {
      setStatusData("");
    }
  }, [data]);

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "active":
        return theme.colors.userBox.statusBtn.btn.active[theme.palette.mode];
      case "expired":
        return theme.colors.userBox.statusBtn.btn.expired[theme.palette.mode];
      case "limited":
        return theme.colors.userBox.statusBtn.btn.limited[theme.palette.mode];
      case "on_hold":
        return theme.colors.userBox.statusBtn.btn.onHold[theme.palette.mode];
      case "disabled":
        return theme.colors.userBox.statusBtn.btn.disabled[theme.palette.mode];
      default:
        return "transparent";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "active":
        return theme.colors.userBox.statusBtn.text.active[theme.palette.mode];
      case "expired":
        return theme.colors.userBox.statusBtn.text.expired[theme.palette.mode];
      case "limited":
        return theme.colors.userBox.statusBtn.text.limited[theme.palette.mode];
      case "on_hold":
        return theme.colors.userBox.statusBtn.text.onHold[theme.palette.mode];
      case "disabled":
        return theme.colors.userBox.statusBtn.text.disabled[theme.palette.mode];
      default:
        return theme.palette.text.primary;
    }
  };

  const getStatusShadow = (status) => {
    switch (status) {
      case "active":
        return "0 0 6px 0px rgba(34, 197, 94, 0.4)";
      case "expired":
        return "0 0 6px 0px rgba(234, 179, 8, 0.4)";
      case "limited":
        return "0 0 6px 0px rgba(239, 68, 68, 0.4)";
      case "on_hold":
        return "0 0 6px 0px rgba(168, 85, 247, 0.4)";
      case "disabled":
        return "0 0 6px 0px rgba(156, 163, 175, 0.4)";
      default:
        return "0 0 3px 0px #99bbaf";
    }
  };

  const [openQrModal, setOpenQrModal] = useState(false);
  const [qrLink, setQrLink] = useState("https://example.com");

  const handleQrModalOpen = () => {
    setOpenQrModal(true);
  };

  const handleQrModalClose = () => {
    setOpenQrModal(false);
  };

  useEffect(() => {
    setQrLink(subLink);
  }, [subLink]);

  return (
    <>
      <BoxS>
        <Grid
          item
          xs={3}
          display="flex"
          justifyContent="center"
          sx={{ padding: ".3rem", paddingX: ".5rem" }}
        >
          <SupervisedUserCircleIcon
            fontSize="large"
            sx={{
              color: theme.colors.userBox.logoColor[theme.palette.mode],
              width: "100%",
              height: "auto",
            }}
          />
        </Grid>
        <Grid
          item
          xs={8}
          display="flex"
          flexDirection={"column"}
          sx={{
            color: theme.colors.BWColor[theme.palette.mode],
            fontSize: "1.2rem",
          }}
        >
          <Grid container paddingBottom={1} alignItems={"baseline"}>
            <Grid
              item
              sx={{
                color: theme.colors.BWColor[theme.palette.mode],
                fontSize: "medium",
                paddingBottom: ".7rem",
                paddingRight: ".4rem",
                fontWeight: 500,
              }}
              xs={8}
              textAlign={"start"}
            >
              {data?.username}
            </Grid>
            <Grid item xs={4} textAlign={"end"}>
              <Button
                onClick={handleQrModalOpen}
                sx={{
                  background: theme.colors.glass,
                  color: theme.palette.text.primary,
                  backdropFilter: "blur(.5rem)",
                  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                  borderRadius: "1rem",
                  border: "1px solid rgba(255, 255, 255)",
                  padding: "0.5rem 1rem",
                  height: "100%",
                }}
              >
                <QrCodeOutlinedIcon fontSize="small" />
              </Button>
            </Grid>
          </Grid>
          <Grid
            item
            display={"flex"}
            xs={12}
            justifyContent={
              import.meta.env.VITE_SUPPORT_URL ? "space-around" : "flex-start"
            }
          >
            <Grid
              xs={import.meta.env.VITE_SUPPORT_URL ? 5 : 6}
              textAlign={"center"}
              item
            >
              <Button
                sx={{
                  borderRadius: "50px",
                  backgroundColor: getStatusBackgroundColor(statusData),
                  color: getStatusTextColor(statusData),
                  textTransform: "capitalize",
                  boxShadow: getStatusShadow(statusData),
                  width: "90%",
                  fontWeight: "bold",
                  textWrap: "nowrap",
                  fontSize: "small",
                  transition: "all 0.3s ease",
                }}
              >
                {t(`status.${statusData}`)}
              </Button>
            </Grid>
            {import.meta.env.VITE_SUPPORT_URL && (
              <Grid item xs={7} textAlign={"center"}>
                <Button
                  onClick={() =>
                    window.open(
                      import.meta.env.VITE_SUPPORT_URL || "https://t.me/YourID"
                    )
                  }
                  sx={{
                    borderRadius: "50px",
                    backgroundColor:
                      theme.colors.userBox.supportBox[theme.palette.mode],
                    paddingX: ".5rem",
                    color: "#fff",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                    textTransform: "capitalize",
                    gap: "1rem",
                    width: "90%",
                    fontWeight: "lighter",
                  }}
                >
                  <QuestionAnswerOutlinedIcon />
                  {t("support")}
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </BoxS>
      <QrModal
        open={openQrModal}
        handleClose={handleQrModalClose}
        title={t("subQRCode")}
        link={qrLink}
        id="switch"
      />
    </>
  );
};

UserBox.propTypes = {
  data: PropTypes.shape({
    username: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};

export default UserBox;
